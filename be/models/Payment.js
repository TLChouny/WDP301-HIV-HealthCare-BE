const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PaymentSchema = new Schema({
  paymentName: { type: String, required: true },
  paymentDescription: { type: String },
   bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
      },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
},
{ timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);