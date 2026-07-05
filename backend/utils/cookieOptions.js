// ADDED: single source of truth for how long the login session should last.
// This MUST match the JWT's own expiry (see User.js -> generateToken),
// otherwise you get exactly the bug you had: the cookie disappears (or outlives)
// the token, and the two get out of sync.
export const AUTH_TOKEN_TTL_MS = 40 * 60 * 60 * 1000; // 40 hours, in milliseconds

export const getAuthCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

  // ADDED: maxAge turns this into a PERSISTENT cookie instead of a SESSION cookie.
  // Without maxAge/expires, the browser deletes the cookie the moment the
  // browser/tab is fully closed - which is why users were being "logged out"
  // even though their JWT was still valid for 40h.
  if (isProduction) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: AUTH_TOKEN_TTL_MS, // ADDED
    };
  }

  return {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: AUTH_TOKEN_TTL_MS, // ADDED
  };
};
