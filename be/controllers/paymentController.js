const mongoose = require("mongoose");
const PayOS = require("@payos/node");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const crypto = require("crypto");

let payOS = null;
try {
  payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
  );
  console.log("✅ PayOS initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize PayOS:", error.message || error);
}

const createPaymentLink = async (req, res) => {
  try {
    const { amount, orderName, description, returnUrl, cancelUrl } = req.body;
    const bookingIds = (req.body.bookingIds || [])
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    console.log("🔍 bookingIds:", bookingIds.map(id => id.toString()));

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: -1, message: "Invalid amount" });
    }
    if (!description) {
      return res.status(400).json({ error: -1, message: "Description is required" });
    }
    if (!returnUrl || !cancelUrl) {
      return res.status(400).json({ error: -1, message: "returnUrl and cancelUrl are required" });
    }
    if (!bookingIds || bookingIds.length === 0) {
      return res.status(400).json({ error: -1, message: "bookingIds must be a non-empty array" });
    }

    if (!payOS) {
      return res.status(500).json({ error: -1, message: "PayOS service is not available" });
    }

    const truncatedDescription = description.length > 25 ? description.substring(0, 25) : description;
    const body = {
      amount,
      description: truncatedDescription,
      orderCode: Math.floor(100000 + Math.random() * 900000),
      returnUrl,
      cancelUrl,
    };

    const payOSResponse = await payOS.createPaymentLink(body);
    const orderCode = payOSResponse.orderCode;
    const paymentID = `PAY${orderCode}`;

    const newPayment = new Payment({
      paymentID,
      orderName,
      amount,
      description: truncatedDescription,
      status: "pending",
      returnUrl,
      cancelUrl,
      orderCode,
      checkoutUrl: payOSResponse.checkoutUrl,
      qrCode: payOSResponse.qrCode,
      bookingIds, // <- thêm dòng này
    });

    await newPayment.save();
    console.log("✅ Saved Payment:", newPayment);

    console.log("🔍 Querying bookings with bookingIds:", bookingIds);
    const bookings = await Booking.find({ _id: { $in: bookingIds }, status: "pending" });
    console.log("🔍 Found bookings:", bookings);

    if (bookings.length === 0) {
      console.warn("⚠️ No bookings found with provided bookingIds and status 'pending'");
      return res.status(400).json({
        error: -1,
        message: "No bookings found to associate with payment",
      });
    }

    const updatedBookings = await Booking.updateMany(
      { _id: { $in: bookingIds }, status: "pending" },
      { $set: { paymentID } }
    );

    console.log(`✅ Updated ${updatedBookings.modifiedCount} bookings with paymentID: ${paymentID}`);

    return res.json({
      error: 0,
      message: "Payment link created successfully",
      data: {
        checkoutUrl: payOSResponse.checkoutUrl,
        qrCode: payOSResponse.qrCode,
        orderCode,
      },
    });
  } catch (error) {
    console.error("❌ Error creating payment link:", error.message || error);
    return res.status(500).json({
      error: -1,
      message: "Failed to create payment link",
      details: error.message || "Unknown error",
    });
  }
};


const getPaymentByOrderCode = async (req, res) => {
  try {
    const { orderCode } = req.params;
    if (!orderCode) {
      return res.status(400).json({ error: -1, message: "Order code is required" });
    }

    const payment = await Payment.findOne({ orderCode });
    if (!payment) {
      return res.status(404).json({ error: -1, message: "Payment not found" });
    }

    return res.json({ error: 0, data: payment });
  } catch (error) {
    console.error("❌ Error fetching payment by order code:", error.message || error);
    return res.status(500).json({
      error: -1,
      message: "Failed to fetch payment",
      details: error.message || "Unknown error",
    });
  }
};
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentID, status } = req.body;
    if (!paymentID || !status) {
      return res.status(400).json({ error: -1, message: "Payment ID and status are required" });
    }

    const validStatuses = ["pending", "success", "failed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: -1, message: "Invalid payment status" });
    }

    const payment = await Payment.findOneAndUpdate(
      { paymentID },
      { status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ error: -1, message: "Payment not found" });
    }

    return res.json({ error: 0, data: payment });
  } catch (error) {
    console.error("❌ Error updating payment status:", error.message || error);
    return res.status(500).json({
      error: -1,
      message: "Failed to update payment status",
      details: error.message || "Unknown error",
    });
  }
};
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findOne().populate("bookingIds").sort({ createdAt: -1 });
    return res.json({ error: 0, data: payments });
  } catch (error) {
    console.error("❌ Error fetching all payments:", error.message || error);
    return res.status(500).json({
      error: -1,
      message: "Failed to fetch payments",
      details: error.message || "Unknown error",
    });
  }
};
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentID } = req.params;
    if (!paymentID) {
      return res.status(400).json({ error: -1, message: "Payment ID is required" });
    }

    const payment = await Payment.findOne({ paymentID });
    if (!payment) {
      return res.status(404).json({ error: -1, message: "Payment not found" });
    }

    return res.json({ error: 0, data: payment });
  } catch (error) {
    console.error("❌ Error checking payment status:", error.message || error);
    return res.status(500).json({
      error: -1,
      message: "Failed to check payment status",
      details: error.message || "Unknown error",
    });
  }
};
const handlePaymentWebhook = async (req, res) => {
  try {
    const { orderCode, status } = req.body;
    if (!orderCode || !status) {
      return res.status(400).json({ error: -1, message: "Order code and status are required" });
    }

    const payment = await Payment.findOne({ orderCode });
    if (!payment) {
      return res.status(404).json({ error: -1, message: "Payment not found" });
    }

    payment.status = status;
    await payment.save();

    console.log(`✅ Payment status updated via webhook: ${status}`);
    return res.json({ error: 0, message: "Payment status updated successfully" });
  } catch (error) {
    console.error("❌ Error handling payment webhook:", error.message || error);
    return res.status(500).json({
      error: -1,
      message: "Failed to handle payment webhook",
      details: error.message || "Unknown error",
    });
  }
};
module.exports = {
  createPaymentLink,
  getPaymentByOrderCode,
  updatePaymentStatus,
  getAllPayments,
  checkPaymentStatus,
  handlePaymentWebhook,
};