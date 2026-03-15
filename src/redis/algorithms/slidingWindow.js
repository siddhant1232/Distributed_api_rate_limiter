const { client } = require('../client');
const slidingWindow = async (key, limit, windowMs) => {
  const redisKey = `rate_limit:sliding_window:${key}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  const multi = client.multi();
  multi.zRemRangeByScore(redisKey, 0, windowStart);
  const requestValue = `${now}-${Math.random().toString(36).substring(2, 7)}`;
  multi.zAdd(redisKey, { score: now, value: requestValue });
  multi.zCard(redisKey);
  multi.pExpire(redisKey, windowMs);
  const replies = await multi.exec();
  const currentRequestCount = replies[2];
  if (currentRequestCount > limit) {
    client.zRem(redisKey, requestValue).catch(err => console.error('Error removing excess request:', err));
  }

  return {
    allowed: currentRequestCount <= limit,
    count: currentRequestCount
  };
};

module.exports = slidingWindow;
