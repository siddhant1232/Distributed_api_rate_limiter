const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const rateLimiter = require('../middleware/rateLimiter');

// Setup routes with specific rate limiting algorithms
// You can use tokenBucket, fixedWindow, or slidingWindow
router.get('/data', rateLimiter('tokenBucket'), exampleController.getData);
router.get('/user', rateLimiter('slidingWindow'), exampleController.getUser);
router.post('/resource', rateLimiter('fixedWindow'), exampleController.createResource);

module.exports = router;
