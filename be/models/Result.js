const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResultSchema = new Schema({
  resultName: { type: String, required: true },
  resultDescription: { type: String },

  // 🩺 Thông tin khám
  symptoms: { type: String }, // triệu chứng hiện tại
  weight: { type: Number }, // cân nặng
  height: { type: Number }, // chiều cao
  bmi: { type: Number }, // BMI
  bloodPressure: { type: String }, //huyết áp
  pulse: { type: Number }, // nhịp mạch
  temperature: { type: Number }, // nhiệt độ

  // 🧪 Nếu là lab test
  sampleType: { type: String }, // loại mẫu máu, huyết thanh, nước tiểu
  testMethod: { type: String }, // phương pháp test: rapid, ELISA, PCR
  resultType: { type: String, enum: ['positive-negative', 'quantitative', 'other'] }, //loại khám: âm, dương, khác
  testResult: { type: String }, // VD: "Âm tính", "Dương tính"
  testValue: { type: Number }, // VD: số copies/mL giá trị đo được
  unit: { type: String }, // đơn vị cho testValue
  referenceRange: { type: String }, // khoảng tham chiếu

  // 💊 Nếu là khám ARV
  reExaminationDate: { type: Date }, // Ngày tái khám
  medicationTime: { type: String }, // Thời gian uống thuốc
  medicationSlot: { type: String }, // Buổi uống thuốc
  arvregimenId: { type: Schema.Types.ObjectId, ref: 'ARVRegimen' },

  // 🔗 Liên kết Booking
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
}, { timestamps: true });


module.exports = mongoose.model("Result", ResultSchema);
