const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ServiceSchema = new mongoose.Schema(
  {
  serviceName: { type: String, required: true },
  serviceDescription: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  serviceImage: { type: String },
  duration: { type: Number },
  price: { type: String },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Service", ServiceSchema);