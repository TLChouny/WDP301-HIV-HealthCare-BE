const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const NotificationSchema = new Schema({
  notiName: { type: String, required: true },
  notiDescription: { type: String },
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  resultId: { type: Schema.Types.ObjectId, ref: "Result" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
},
{ timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);