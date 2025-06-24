const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  paymentID: { type: String, required: true, unique: true },
  orderCode: { type: Number, required: true, unique: true },
  orderName: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["pending", "success", "failed", "cancelled"],
    default: "pending",
  },
  returnUrl: { type: String },
  cancelUrl: { type: String },
  checkoutUrl: { type: String },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", PaymentSchema);