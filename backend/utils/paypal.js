import AppError from "./appError.js";

// Uses PayPal's REST API directly (no SDK dependency needed - just fetch,
// available globally in Node 18+).
const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE ||
  (process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com");

let cachedToken = null;
let cachedTokenExpiry = 0;

/**
 * Gets (and caches) an OAuth2 access token from PayPal using the server's
 * own client id/secret. This is intentionally separate from the frontend's
 * VITE_PAYPAL_CLIENT_ID, which is public and only used to render the button.
 */
const getAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new AppError(
      "PayPal is not configured on the server (missing PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET)",
      500,
    );
  }

  if (cachedToken && Date.now() < cachedTokenExpiry) {
    return cachedToken;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new AppError("Failed to authenticate with PayPal", 502);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // Refresh a little early to avoid using a token that expires mid-request.
  cachedTokenExpiry = Date.now() + Math.max(data.expires_in - 60, 0) * 1000;

  return cachedToken;
};

/**
 * Fetches an order directly from PayPal's Orders v2 API. This is the
 * server's own source of truth - it is never derived from anything the
 * client sent us other than the order id.
 */
export const getPayPalOrder = async (orderId) => {
  if (!orderId || typeof orderId !== "string") {
    throw new AppError("A PayPal order id is required", 400);
  }

  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new AppError("Could not verify PayPal order", 502);
  }

  return response.json();
};

/**
 * Verifies that a given PayPal order id represents a genuinely completed
 * payment for at least the expected amount. Throws an AppError if anything
 * doesn't check out. Never trust `req.body.paymentStatus` directly - this
 * is the only source of truth for "was this actually paid".
 */
export const verifyPayPalPayment = async (orderId, expectedAmount) => {
  const order = await getPayPalOrder(orderId);

  if (order.status !== "COMPLETED") {
    throw new AppError("PayPal payment has not completed", 402);
  }

  const purchaseUnit = order.purchase_units?.[0];
  const capture = purchaseUnit?.payments?.captures?.[0];

  if (!capture || capture.status !== "COMPLETED") {
    throw new AppError("PayPal payment capture is not completed", 402);
  }

  const paidAmount = Number(capture.amount?.value);
  const expected = Number(expectedAmount);

  // Small epsilon to tolerate floating point rounding - the paid amount
  // must never be less than what we expect, though.
  if (!Number.isFinite(paidAmount) || paidAmount + 0.01 < expected) {
    throw new AppError(
      "The amount paid on PayPal does not match this order's total",
      402,
    );
  }

  return { order, capture };
};
