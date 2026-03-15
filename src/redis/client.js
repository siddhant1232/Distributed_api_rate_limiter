const { createClient } = require('redis');
const config = require('../config');

// Create a Redis client
const client = createClient({
  url: config.redisUrl
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

// A function to connect to Redis
// This is typically called when the server starts
const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
};

module.exports = {
  client,
  connectRedis
};
