const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const rateLimiter = require('../middleware/rateLimiter');

router.get('/data', rateLimiter('tokenBucket'), exampleController.getData);
router.get('/user', rateLimiter('slidingWindow'), exampleController.getUser);
router.post('/resource', rateLimiter('fixedWindow'), exampleController.createResource);

module.exports = router;
