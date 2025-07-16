const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ARVRegimenSchema = new mongoose.Schema(
  {
    arvName: { type: String, required: true },
    arvDescription: { type: String },
    drugs: [{ type: String }], // Danh sách thuốc
    dosages: [{ type: String }], // Liều dùng
    contraindications: [{ type: String }], // Chống chỉ định
    sideEffects: [{ type: String }], // Tác dụng phụ
  },
  { timestamps: true }
);

module.exports = mongoose.model("ARVRegimen", ARVRegimenSchema);
