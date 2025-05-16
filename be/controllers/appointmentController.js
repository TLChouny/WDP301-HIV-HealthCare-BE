// controllers/appointmentController.js
const Appointment = require('../models/Appointment');

exports.bookAppointment = async (req, res) => {
  const { date, doctorId, isAnonymous, userId } = req.body;
  try {
    const appointment = new Appointment({ date, doctorId, isAnonymous, userId });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('doctorId');
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};