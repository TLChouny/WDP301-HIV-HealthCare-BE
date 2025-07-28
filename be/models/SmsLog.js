const mongoose = require('mongoose');

const SmsLogSchema = new mongoose.Schema({
  messageId: String,
  to: String,
  status: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SmsLog', SmsLogSchema);
