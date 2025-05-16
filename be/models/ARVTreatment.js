// models/ARVTreatment.js
const mongoose = require('mongoose');

const arvTreatmentSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  medication: { type: String, required: true },
  dosage: { type: String, required: true },
  nextVisit: { type: Date, required: true },
  userId: { type: String, required: true },
});

module.exports = mongoose.model('ARVTreatment', arvTreatmentSchema);