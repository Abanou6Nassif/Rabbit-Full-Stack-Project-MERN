import {
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterRes,
} from "rate-limiter-flexible";
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const useRedis = Boolean(process.env.REDIS_URL);

const redisClient = useRedis
  ? new Redis(process.env.REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    })
  : null;

if (redisClient) {
  redisClient.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });
}

const createLimiter = ({ keyPrefix, points, duration, blockDuration }) => {
  const options = { keyPrefix, points, duration, blockDuration };

  if (redisClient) {
    return new RateLimiterRedis({
      storeClient: redisClient,
      ...options,
    });
  }

  return new RateLimiterMemory(options);
};

export const registerLimiterEmail = createLimiter({
  keyPrefix: "register",
  points: 5,
  duration: 60 * 15,
  blockDuration: 60 * 15,
});
export const registerLimiterIP = createLimiter({
  keyPrefix: "register",
  points: 10,
  duration: 60 * 30,
  blockDuration: 60 * 15,
});

export const verifyEmailLimiterIP = createLimiter({
  keyPrefix: "verify-email",
  points: 10,
  duration: 60 * 30,
  blockDuration: 60 * 15,
});

export const forgotPasswordLimiterEmail = createLimiter({
  keyPrefix: "forgot-password",
  points: 5,
  duration: 60 * 15,
  blockDuration: 60 * 15,
});
export const forgotPasswordLimiterIP = createLimiter({
  keyPrefix: "forgot-password",
  points: 10,
  duration: 60 * 30,
  blockDuration: 60 * 15,
});

export const resetPasswordLimiterIP = createLimiter({
  keyPrefix: "reset-password",
  points: 10,
  duration: 60 * 30,
  blockDuration: 60 * 15,
});

export const loginFailureLimiterEmail = createLimiter({
  keyPrefix: "login",
  points: 5,
  duration: 60 * 15,
  blockDuration: 60 * 15,
});
export const loginFailureLimiterIP = createLimiter({
  keyPrefix: "login",
  points: 10,
  duration: 60 * 30,
  blockDuration: 60 * 15,
});

// Best-effort bookkeeping: a Redis hiccup here should never block the login
// flow itself, so failures are logged and swallowed rather than thrown.
export const recordLoginFailure = async (req) => {
  try {
    const promises = [loginFailureLimiterIP.consume(req.ip)];
    const email = req.body?.email?.trim().toLowerCase();

    if (email) {
      promises.push(loginFailureLimiterEmail.consume(email));
    }

    await Promise.all(promises);
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      // Expected: this IP/email has already hit the failure limit. Nothing
      // to do here, the next login attempt will be blocked by the limiter.
      return;
    }
    // Unexpected (e.g. Redis connection error) - don't let it break login.
    console.error("recordLoginFailure error:", err);
  }
};

// `limiter.consume()` rejects for two very different reasons:
//   1. The limit was actually exceeded -> rejects with a RateLimiterRes
//   2. A technical failure occurred (e.g. Redis connection error/timeout)
//      -> rejects with a plain Error
// Only case (1) should ever produce a 429. Case (2) is a bug in the
// rate limiter's infrastructure, not a signal that the user made too many
// requests, so we log it and fail open (let the request through) instead
// of incorrectly telling the user they're being rate limited.
const createRequestLimiterMiddleware =
  (limiters, message = "Too many requests. Try again later.") =>
  async (req, res, next) => {
    try {
      const promises = limiters.map(({ limiter, keyFn }) => {
        const key = keyFn(req);

        if (!key) {
          return null;
        }

        return limiter.consume(key);
      });

      await Promise.all(promises.filter(Boolean));
      next();
    } catch (err) {
      if (err instanceof RateLimiterRes) {
        return res.status(429).send(message);
      }

      console.error("Rate limiter error:", err);
      next();
    }
  };

export const registerLimiterMiddleware = createRequestLimiterMiddleware(
  [
    { limiter: registerLimiterIP, keyFn: (req) => req.ip },
    {
      limiter: registerLimiterEmail,
      keyFn: (req) => req.body?.email?.trim().toLowerCase(),
    },
  ],
  "Too many registration attempts. Try again later.",
);

export const verifyEmailLimiterMiddleware = createRequestLimiterMiddleware(
  [{ limiter: verifyEmailLimiterIP, keyFn: (req) => req.ip }],
  "Too many verification attempts. Try again later.",
);

export const forgotPasswordLimiterMiddleware = createRequestLimiterMiddleware(
  [
    { limiter: forgotPasswordLimiterIP, keyFn: (req) => req.ip },
    {
      limiter: forgotPasswordLimiterEmail,
      keyFn: (req) => req.body?.email?.trim().toLowerCase(),
    },
  ],
  "Too many password reset attempts. Try again later.",
);

export const resetPasswordLimiterMiddleware = createRequestLimiterMiddleware(
  [{ limiter: resetPasswordLimiterIP, keyFn: (req) => req.ip }],
  "Too many password reset attempts. Try again later.",
);

export const globalLimiter = createLimiter({
  keyPrefix: "global",
  points: 1000,
  duration: 60,
});

// Prefer the authenticated user's ID when available so that many distinct
// logged-in users behind the same IP (NAT, corporate network, mobile
// carrier, etc.) don't share one rate-limit bucket. Falls back to IP for
// anonymous requests. Requires a soft-auth step upstream that attaches
// `req.user` when a valid token is present, without rejecting the request
// if it's missing/invalid (see `identifyUser` middleware in server.js).
export const globalLimiterKey = (req) => req.user?.id || req.ip;

export const checkoutLimiter = createLimiter({
  keyPrefix: "checkout",
  points: 10,
  duration: 60,
});

export const shouldSkipGlobalRateLimit = (req) =>
  req.method === "GET" ||
  req.method === "HEAD" ||
  req.method === "OPTIONS" ||
  req.path === "/api/health";

export const makeLimiterMiddleware =
  (limiter, keyFn, shouldSkip = () => false) =>
  async (req, res, next) => {
    try {
      if (shouldSkip(req)) {
        return next();
      }

      await limiter.consume(keyFn(req));
      next();
    } catch (err) {
      if (err instanceof RateLimiterRes) {
        return res.status(429).send("Too many requests. Try again later.");
      }

      console.error("Rate limiter error:", err);
      next();
    }
  };
