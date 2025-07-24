const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ARVRegimenSchema = new mongoose.Schema(
  {
    arvName: { type: String, required: true }, //tên phác đồ
    arvDescription: { type: String }, //mô tả phá đồ
    regimenCode: { type: String }, // Mã phác đồ theo guideline MOH/WHO	
    treatmentLine: { type: String, enum: ['First-line', 'Second-line', 'Third-line'] }, //Tuyến điều trị
    recommendedFor: { type: String }, // Đối tượng khuyến cáo
    drugs: [{ type: String }], // danh sách thuốc
    dosages: [{ type: String }], // Liều dùng từng thuốc	
    frequency: { type: String }, //Tần suất uống thuốc	
    contraindications: [{ type: String }], //Chống chỉ định	
    sideEffects: [{ type: String }], //Tác dụng phụ thường gặp
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ARVRegimen", ARVRegimenSchema);
