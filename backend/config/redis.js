const Redis = require('ioredis');

function createRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableAutoPipelining: true,
  });
  client.on('error', (err) => {
    console.error('Redis error:', err.message);
  });
  client.on('connect', () => console.log('Redis connected'));
  return client;
}

module.exports = { createRedisClient };
