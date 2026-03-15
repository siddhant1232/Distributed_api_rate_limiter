module.exports = {
  port: process.env.PORT || 3000,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000, 
    maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100 
  }
};
