// routes/arvTreatmentRoutes.js
const express = require('express');
const router = express.Router();
const arvTreatmentController = require('../controllers/arvTreatmentController');

router.post('/arv-treatments', arvTreatmentController.addARVTreatment);
router.get('/arv-treatments/:userId', arvTreatmentController.getARVTreatment);

module.exports = router;