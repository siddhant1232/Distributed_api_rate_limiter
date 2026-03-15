const { client } = require('../client');

/**
 * Fixed Window Counter Algorithm
 * @param {string} key - The unique identifier for the user/IP
 * @param {number} limit - Maximum allowed requests
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {Promise<{allowed: boolean, count: number}>}
 */
const fixedWindow = async (key, limit, windowMs) => {
  const redisKey = `rate_limit:fixed_window:${key}`;

  const multi = client.multi();
  multi.incr(redisKey);
  multi.pttl(redisKey); // check TTL

  const replies = await multi.exec();
  const count = replies[0];
  const ttl = replies[1];

  // If TTL is -1 (no expiration), we set it
  if (ttl === -1) {
    await client.pExpire(redisKey, windowMs);
  }

  return {
    allowed: count <= limit,
    count: count
  };
};

module.exports = fixedWindow;
