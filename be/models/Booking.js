const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bookingSchema = new mongoose.Schema({
  BookingCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  serviceName: { type: String, required: true },
  bookingDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String },
  duration: { type: Number },
  doctorName: { type: String },
  originalPrice: { type: Number },
  notes: { type: String },
  // totalPrice: { type: Number, required: true },
  // discountedPrice: { type: Number },
  currency: { type: String, default: "VND" },
  // discountCode: { type: String },
  status: {
    type: String,
    enum: ["cancel", "pending", "checked-in", "completed", "checked-out", "reviewed"],
    default: "pending",
  },
  // description: { type: String },
  // paymentID: { type: String, default: null }, // Thêm trường paymentID
},
{ timestamps: false }
);

// Middleware để tự động cập nhật updatedAt
bookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);