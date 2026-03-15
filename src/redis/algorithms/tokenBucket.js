const { client } = require('../client');
const luaScript = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refillRate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local requested = tonumber(ARGV[4])
  
  local bucket = redis.call("HMGET", key, "tokens", "lastRefill")
  local tokens = tonumber(bucket[1])
  local lastRefill = tonumber(bucket[2])
  
  if not tokens then
    tokens = capacity
    lastRefill = now
  else
    local elapsedTime = math.max(0, now - lastRefill)
    local refilledTokens = math.floor(elapsedTime * refillRate)
    if refilledTokens > 0 then
      tokens = math.min(capacity, tokens + refilledTokens)
      lastRefill = now
    end
  end
  
  if tokens >= requested then
    tokens = tokens - requested
    redis.call("HMSET", key, "tokens", tokens, "lastRefill", lastRefill)
    -- Set expiration to clean up unused buckets
    local ttl = math.ceil(capacity / refillRate)
    redis.call("PEXPIRE", key, ttl)
    return {1, tokens}
  else
    return {0, tokens}
  end
`;


const tokenBucket = async (key, capacity, refillRatePerSecond) => {
  const redisKey = `rate_limit:token_bucket:${key}`;
  const refillRatePerMs = refillRatePerSecond / 1000;
  const now = Date.now();

  const result = await client.eval(
    luaScript,
    {
      keys: [redisKey],
      arguments: [capacity.toString(), refillRatePerMs.toString(), now.toString(), '1']
    }
  );

  return {
    allowed: result[0] === 1,
    remaining: result[1]
  };  
};

module.exports = tokenBucket;
