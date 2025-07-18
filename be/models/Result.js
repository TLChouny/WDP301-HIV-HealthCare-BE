const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResultSchema = new Schema({
  resultName: { type: String, required: true },
  resultDescription: { type: String },
  reExaminationDate: { type: Date, required: true },
  medicationTime: { type: String },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  arvregimenId: { type: Schema.Types.ObjectId, ref: 'ARVRegimen', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
},
{ timestamps: true }
);

module.exports = mongoose.model("Result", ResultSchema);
