// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  isAnonymous: { type: Boolean, default: false },
  userId: { type: String, required: true }, // Giả sử userId từ frontend
});

module.exports = mongoose.model('Appointment', appointmentSchema);