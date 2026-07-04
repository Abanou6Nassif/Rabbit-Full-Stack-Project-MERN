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

export const authLimiterEmail = createLimiter({
  keyPrefix: "auth",
  points: 5,
  duration: 60 * 15,
  blockDuration: 60 * 15,
});
export const authLimiterIP = createLimiter({
  keyPrefix: "auth",
  points: 10,
  duration: 60 * 30,
  blockDuration: 60 * 15,
});

export const authLimiterMiddleware = async (req, res, next) => {
  try {
    const promises = [authLimiterIP.consume(req.ip)];
    if (req.body?.email) promises.push(authLimiterEmail.consume(req.body.email));

    await Promise.all(promises);
    next();
  } catch {
    res.status(429).send("Too many login attempts. Try again later.");
  }
};

export const globalLimiter = createLimiter({
  keyPrefix: "global",
  points: 300,
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
