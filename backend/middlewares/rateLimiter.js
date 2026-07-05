import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
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

export const recordLoginFailure = async (req) => {
  const promises = [loginFailureLimiterIP.consume(req.ip)];
  const email = req.body?.email?.trim().toLowerCase();

  if (email) {
    promises.push(loginFailureLimiterEmail.consume(email));
  }

  await Promise.all(promises);
};

const createRequestLimiterMiddleware = (
  limiters,
  message = "Too many requests. Try again later.",
) =>
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
    } catch {
      res.status(429).send(message);
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
  points: 200,
  duration: 60,
});

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
  (limiter, keyFn, shouldSkip = () => false) => async (req, res, next) => {
    try {
      if (shouldSkip(req)) {
        return next();
      }

      await limiter.consume(keyFn(req));
      next();
    } catch {
      res.status(429).send("Too many requests. Try again later.");
    }
  };
