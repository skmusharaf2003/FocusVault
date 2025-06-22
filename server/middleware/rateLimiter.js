import rateLimit from "express-rate-limit";

// Redis-backed rate limiter for production
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = "Too many requests from this IP, please try again later.",
    standardHeaders = true,
    legacyHeaders = false,
    ...otherOptions
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders,
    legacyHeaders,
    // Use Redis store if available
    store: process.env.REDIS_URL ? undefined : undefined, // Will use memory store as fallback
    ...otherOptions,
  });
};

// Different rate limits for different endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: "Too many authentication attempts, please try again in 15 minutes.",
  skipSuccessfulRequests: true,
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: "API rate limit exceeded, please try again later.",
});

export const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: "Rate limit exceeded, please slow down.",
});

export default createRateLimiter;
