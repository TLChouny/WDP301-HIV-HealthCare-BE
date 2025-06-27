const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

const handlePaymentWebhook = async (req, res) => {
  try {
    const { code, success, data, desc } = req.body;

    console.log("✅ Webhook Received:", req.body);

    // Không kiểm tra nghiêm ngặt dữ liệu webhook để đảm bảo trả về 200
    // Chỉ ghi log nếu dữ liệu không hợp lệ, nhưng không trả về lỗi
    if (code !== "00" || !success || desc !== "success" || !data?.orderCode) {
      console.warn("⚠️ Dữ liệu webhook không hợp lệ:", { code, success, desc, orderCode: data?.orderCode });
      return res.status(200).json({
        error: 0,
        message: "Webhook received but data is invalid, no updates performed",
        data: null,
      });
    }

    const orderCode = Number(data.orderCode);
    if (isNaN(orderCode)) {
      console.warn(`⚠️ Invalid orderCode: ${data.orderCode}`);
      return res.status(200).json({
        error: 0,
        message: "Webhook received but orderCode is invalid, no updates performed",
        data: null,
      });
    }

    // Tìm payment theo orderCode
    const payment = await Payment.findOne({ orderCode });
    if (!payment) {
      console.warn(`❌ Payment with orderCode ${orderCode} not found`);
      return res.status(200).json({
        error: 0,
        message: "Webhook received but payment not found, no updates performed",
        data: null,
      });
    }

    // Nếu payment đã success thì không làm lại
    if (payment.status === "success") {
      console.log(`✅ Payment ${orderCode} already marked as success`);
      return res.status(200).json({
        error: 0,
        message: "Payment already processed",
        data: { payment, updatedBookingCount: 0 },
      });
    }

    // Cập nhật trạng thái payment
    payment.status = "success";
    payment.updatedAt = new Date();
    await payment.save();
    console.log(`✅ Payment ${payment.paymentID} marked as success`);

    // Tìm và cập nhật các booking liên quan
    const paymentID = payment.paymentID;
    if (!paymentID) {
      console.warn("⚠️ Missing paymentID in payment document");
      return res.status(200).json({
        error: 0,
        message: "Webhook received but paymentID is missing, no bookings updated",
        data: { payment, updatedBookingCount: 0 },
      });
    }

    const bookingsToUpdate = await Booking.find({
      _id: { $in: payment.bookingIds },
      status: "pending",
    });
    console.log(`🔍 Found ${bookingsToUpdate.length} bookings with paymentID: ${paymentID}`);

    if (bookingsToUpdate.length === 0) {
      console.log(`ℹ️ No bookings to update with paymentID: ${paymentID}`);
      return res.status(200).json({
        error: 0,
        message: "Payment updated, but no bookings were eligible for status update",
        data: {
          payment,
          updatedBookingCount: 0,
        },
      });
    }

    const updated = await Booking.updateMany(
      { _id: { $in: payment.bookingIds }, status: "pending" },
      { $set: { status: "checked-out", updatedAt: new Date() } }
    );

    console.log(`✅ Updated ${updated.modifiedCount} bookings to 'checked-out'`);

    return res.status(200).json({
      error: 0,
      message: "Payment and bookings updated successfully",
      data: {
        payment,
        updatedBookingCount: updated.modifiedCount,
      },
    });
  } catch (error) {
    console.error("❌ Webhook error:", error.message || error);
    // Trả về 200 ngay cả khi có lỗi để PayOS chấp nhận webhook
    return res.status(200).json({
      error: 0,
      message: "Webhook received but server error occurred, no updates performed",
      data: error.message || "Unknown error",
    });
  }
};

const handleWebhook = (req, res) => {
  res.status(200).json({
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
    status: "OK",
  });
};

module.exports = { handlePaymentWebhook, handleWebhook };