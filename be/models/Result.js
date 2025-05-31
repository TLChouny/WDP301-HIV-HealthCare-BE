const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ResultSchema = new Schema({
  resultName: { type: String, required: true },
  resultDescription: { type: String },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
},
{ timestamps: true }
);

module.exports = mongoose.model("Result", ResultSchema);
