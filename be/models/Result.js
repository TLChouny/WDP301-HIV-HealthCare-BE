const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
  {
    // 📝 Thông tin chung cho tất cả kết quả
    resultName: { type: String, required: true }, // Tên kết quả (VD: Xét nghiệm PCR lần 1)
    resultDescription: { type: String }, // Mô tả thêm (chủ yếu dùng cho ARV)
    testerName: { type: String }, // Tên người thực hiện xét nghiệm (string tự do)
    notes: { type: String }, // Ghi chú thêm của bác sĩ hoặc kỹ thuật viên

    // 💊 Thông tin liên kết phác đồ ARV (nếu có)
    arvregimenId: { type: mongoose.Schema.Types.ObjectId, ref: "ARVRegimen" }, // Liên kết với phác đồ điều trị ARV
    reExaminationDate: { type: Date }, // Ngày tái khám đề xuất
    medicationTime: { type: String }, // Giờ uống thuốc
    medicationSlot: { type: String }, // Buổi uống thuốc (VD: sáng, tối)

    // 📅 Thông tin liên kết đặt lịch khám
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true }, // Liên kết với bảng Booking

    // 🩺 Thông tin cơ bản về khám bệnh hoặc khi test
    symptoms: { type: String }, // Triệu chứng ghi nhận (VD: sốt, ho, mệt)
    weight: { type: Number }, // Cân nặng (kg)
    height: { type: Number }, // Chiều cao (m)
    bmi: { type: Number }, // Chỉ số BMI tính toán
    bloodPressure: { type: String }, // Huyết áp (VD: "120/80")
    pulse: { type: Number }, // Mạch (lần/phút)
    temperature: { type: Number }, // Nhiệt độ cơ thể (°C)
    sampleType: { type: String }, // Loại mẫu xét nghiệm (VD: Máu, Nước tiểu)
    testMethod: { type: String }, // Phương pháp xét nghiệm (VD: PCR, Test nhanh)

    // 📊 Thông tin riêng cho xét nghiệm PCR HIV
    viralLoad: { type: Number }, // Tải lượng virus HIV (copies/mL)
    viralLoadReference: { type: String }, // Khoảng tham chiếu VL (VD: <20 copies/mL)
    viralLoadInterpretation: {
      type: String,
      enum: ["undetectable", "low", "high"], // Diễn giải kết quả: Không phát hiện, thấp, cao
    },

    // ⚖️ Đơn vị đo dùng chung cho VL & CD4
    unit: { type: String }, // VD: "copies/mL" hoặc "cells/mm³"

    // 📉 Thông tin riêng cho xét nghiệm CD4
    cd4Count: { type: Number }, // Số lượng tế bào CD4 (cells/mm³)
    cd4Reference: { type: String }, // Khoảng tham chiếu CD4 (VD: >500)
    cd4Interpretation: {
      type: String,
      enum: ["normal", "low", "very_low"], // Diễn giải kết quả CD4
    },
    coInfections: [{ type: String }], // Danh sách bệnh nhiễm kèm nếu có (VD: Viêm gan B, Lao, ...)

    // ✅ Thông tin cho xét nghiệm nhanh HIV / Ag-Ab
    testResult: {
      type: String,
      enum: ["positive", "negative", "invalid"], // Kết quả test nhanh HIV
    },
    interpretationNote: { type: String }, // Ghi chú diễn giải (VD: Có thể test lại sau 1 tuần)
    p24Antigen: { type: Number }, // Giá trị kháng nguyên P24 - nếu có là dương tính
    hivAntibody: { type: Number }, // Giá trị kháng thể HIV - nếu có là dương tính
  },
  {
    timestamps: true, // Tự động thêm createdAt & updatedAt
  }
);

module.exports = mongoose.model("Result", ResultSchema);
