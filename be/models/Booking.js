const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bookingSchema = new mongoose.Schema({
  BookingID: { type: String, required: true, unique: true },
  BookingCode: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  notes: { type: String },
  service_id: { type: Number, required: true },
  serviceName: { type: String, required: true },
  serviceType: { type: String },
  bookingDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String },
  duration: { type: Number },
  originalPrice: { type: Number },
  totalPrice: { type: Number, required: true },
  discountedPrice: { type: Number },
  currency: { type: String, default: "VND" },
  discountCode: { type: String },
  Skincare_staff: { type: String },
  status: {
    type: String,
    enum: ["pending", "checked-in", "completed", "checked-out", "cancel", "reviewed"],
    default: "pending",
  },
  description: { type: String },
  paymentID: { type: String, default: null }, // Thêm trường paymentID
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware để tự động cập nhật updatedAt
bookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);