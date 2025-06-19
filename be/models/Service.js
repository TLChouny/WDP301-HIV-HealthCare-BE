const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true, trim: true },
  serviceDescription: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  serviceImage: { type: String },
  duration: { type: Number, default: 30 }, // ⏱ fallback nếu FE không truyền
  price: { type: Number, required: true }, // 💰 kiểu số để dễ xử lý
}, { timestamps: true }); // ✅ Bật createdAt, updatedAt

module.exports = mongoose.model("Service", ServiceSchema);
