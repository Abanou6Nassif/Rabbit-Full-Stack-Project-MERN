import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";

export const redisClient = new Redis({ enableOfflineQueue: false });

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 5, //10 requests
  duration: 60 * 15,
  blockDuration: 60 * 15,
});


export const authLimiterMiddleware = async (req, res, next) => {
  try {
    const promises = [rateLimiter.consume(req.ip)];
    if (req.body?.email) promises.push(rateLimiter.consume(req.body.email));

    await Promise.all(promises);
    next();
  } catch (error) {
    res.status(429).send("Too many login attempts. Try again later.");
  }
};

////////////////////////////////////////////////


// Safety net for the whole app
export const globalLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "global",
  points: 200,
  duration: 60,
});

// Stricter, route-specific
export const authLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "auth",
  points: 5,
  duration: 60 * 15,
  blockDuration: 60 * 15,
});

export const checkoutLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "checkout",
  points: 5,
  duration: 60,
});

export const makeLimiterMiddleware = (limiter, keyFn) => async (req, res, next) => {
  try {
    await limiter.consume(keyFn(req));
    next();
  } catch {
    res.status(429).send("Too many requests. Try again later.");
  }
};
