const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true },
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  serviceName: { type: String },
  bookingDate: { type: Date, required: true },
  startTime: { type: String, required: true }, 
  endTime: { type: String },
  duration: { type: Number },
  doctorName: { type: String },
  originalPrice: { type: Number },
  notes: { type: String },
  meetLink: { type: String },
  currency: { type: String, default: "VND" },
  status: {
    type: String,
    enum: ["cancel", "cancelled", "pending", "confirmed", "checked-in", "completed", "checked-out", "reviewed"],
    default: "pending",
  },
  isAnonymous: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

bookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
