const fixedWindow = require('../redis/algorithms/fixedWindow');
const tokenBucket = require('../redis/algorithms/tokenBucket');
const slidingWindow = require('../redis/algorithms/slidingWindow');
const config = require('../config');

// Default config options
const LIMIT = config.rateLimit.maxRequests;
const WINDOW_MS = config.rateLimit.windowMs;

/**
 * Factory for Rate Limiting Middleware
 * @param {string} algorithm 'fixedWindow' or 'tokenBucket'
 */
const rateLimiter = (algorithm = 'fixedWindow') => {
  return async (req, res, next) => {
    try {
      // Use IP as identifier. In a real app, this could be user ID for authenticated routes.
      const key = req.ip || req.connection.remoteAddress;

      let result;
      if (algorithm === 'fixedWindow') {
        result = await fixedWindow(key, LIMIT, WINDOW_MS);
      } else if (algorithm === 'tokenBucket') {
        // Calculate appropriate refill rate based on the same limit configuration
        const refillRatePerSecond = LIMIT / (WINDOW_MS / 1000);
        result = await tokenBucket(key, LIMIT, refillRatePerSecond);
      } else if (algorithm === 'slidingWindow') {
        result = await slidingWindow(key, LIMIT, WINDOW_MS);
      } else {
        return res.status(500).json({ error: 'Invalid rate limiter algorithm' });
      }

      // Set common rate limit headers
      const remaining = typeof result.remaining !== 'undefined'
        ? result.remaining
        : Math.max(0, LIMIT - result.count);

      res.setHeader('X-RateLimit-Limit', LIMIT);
      res.setHeader('X-RateLimit-Remaining', remaining);

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.'
        });
      }

      next();
    } catch (error) {
      console.error('Rate Limiter Error:', error);
      // In production, we might want to fail open to not block users if Redis goes down
      // but it's a design choice. Here we'll let it pass but log the error.
      next();
    }
  };
};

module.exports = rateLimiter;
