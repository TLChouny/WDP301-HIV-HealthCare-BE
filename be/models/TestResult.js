// models/TestResult.js
const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, required: true },
  result: { type: String, required: true },
  userId: { type: String, required: true },
});

module.exports = mongoose.model('TestResult', testResultSchema);