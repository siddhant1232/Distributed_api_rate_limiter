const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { connectRedis } = require('./redis/client');
const apiRoutes = require('./routes/api');

const app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());

app.use(cors({
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining']
}));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

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
