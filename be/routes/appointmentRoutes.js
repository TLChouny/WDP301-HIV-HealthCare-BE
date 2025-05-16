// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/appointments', appointmentController.bookAppointment);
router.get('/appointments', appointmentController.getAppointments);

module.exports = router;