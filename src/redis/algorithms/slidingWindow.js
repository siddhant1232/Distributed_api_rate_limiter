const { client } = require('../client');

/**
 * Sliding Window Log Algorithm using Redis Sorted Sets
 * @param {string} key - The unique identifier for the user/IP
 * @param {number} limit - Maximum allowed requests
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {Promise<{allowed: boolean, count: number}>}
 */
const slidingWindow = async (key, limit, windowMs) => {
  const redisKey = `rate_limit:sliding_window:${key}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Use a transaction to perform operations atomically
  const multi = client.multi();

  // 1. Remove all records originating before the current window
  multi.zRemRangeByScore(redisKey, 0, windowStart);

  // 2. Add the current request timestamp
  // Using 'now' as both the score and the value. 
  // To prevent collisions if multiple requests happen at the exact same millisecond, 
  // we append a random string or counter to the value, but keep the score as 'now'.
  const requestValue = `${now}-${Math.random().toString(36).substring(2, 7)}`;
  multi.zAdd(redisKey, { score: now, value: requestValue });

  // 3. Count the number of requests in the current window
  multi.zCard(redisKey);

  // 4. Set TTL to the window duration to clean up idle keys
  multi.pExpire(redisKey, windowMs);

  const replies = await multi.exec();

  // The result of zCard is the 3rd operation (index 2)
  const currentRequestCount = replies[2];

  // If the count exceeds the limit, we technically should remove the request we just added.
  // We can do this asynchronously without blocking the response.
  if (currentRequestCount > limit) {
    client.zRem(redisKey, requestValue).catch(err => console.error('Error removing excess request:', err));
  }

  return {
    allowed: currentRequestCount <= limit,
    count: currentRequestCount
  };
};

module.exports = slidingWindow;
