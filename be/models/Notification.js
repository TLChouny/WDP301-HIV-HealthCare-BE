const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const NotificationSchema = new Schema({
  notiName: { type: String, required: true },
  notiDescription: { type: String },
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
},
{ timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);