// routes/testResultRoutes.js
const express = require('express');
const router = express.Router();
const testResultController = require('../controllers/testResultController');

router.post('/test-results', testResultController.addTestResult);
router.get('/test-results', testResultController.getTestResults);

module.exports = router;