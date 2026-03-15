module.exports = {
  port: process.env.PORT || 3000,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000, // 1 minute window
    maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100 // limit each IP to 100 requests per windowMs
  }
};
