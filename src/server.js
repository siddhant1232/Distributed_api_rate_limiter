const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const { connectRedis } = require('./redis/client');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
// Using Morgan for logging request latency, URL, and status. Fulfills the "metrics and logging" requirement
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());

// Top level rate limit logging or custom morgan format can also be added. 
// However, the `morgan` default logger records all 429 errors from the rate limiter.

// Main API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const startServer = async () => {
  try {
    await connectRedis();
    console.log('Redis connected successfully.');

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Global Rate Limiting config: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 1000} seconds`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
