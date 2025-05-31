const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ReviewSchema = new Schema({
  reviewName: { type: String, required: true },
  reviewDescription: { type: String },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
},
{ timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);