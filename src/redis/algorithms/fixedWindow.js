const { client } = require('../client');





const fixedWindow = async (key, limit, windowMs) => {
  const redisKey = `rate_limit:fixed_window:${key}`;

  const multi = client.multi();
  multi.incr(redisKey);
  multi.pttl(redisKey); 

  const replies = await multi.exec();
  const count = replies[0];
  const ttl = replies[1];


  if (ttl === -1) {
    await client.pExpire(redisKey, windowMs);
  }

  return {
    allowed: count <= limit,
    count: count
  };
};

module.exports = fixedWindow;
