const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm gửi OTP cho đăng ký tài khoản
const sendOTP = async (email, subject, text) => {
  const mailOptions = {
    from: `"HIV HealthCare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Xác Thực Tài Khoản</h2>
        <p>Xin chào,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP sau:</p>
        <div style="text-align: center; font-size: 24px; font-weight: bold; color: #2196F3; padding: 10px; border-radius: 5px; background: #f8d7da;">
          ${text}
        </div>
        <hr />
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP đăng ký đã được gửi thành công!");
  } catch (error) {
    console.error("Lỗi gửi email đăng ký:", error);
    throw new Error("Failed to send OTP email: " + error.message);
  }
};

// Hàm gửi OTP cho reset password
const sendResetPasswordOTP = async (email, otp) => {
  const mailOptions = {
    from: `"HC-HealthCare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Mã OTP để đặt lại mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Yêu Cầu Đặt Lại Mật Khẩu</h2>
        <p>Xin chào,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng sử dụng mã OTP sau để tiếp tục:</p>
        <div style="text-align: center; font-size: 24px; font-weight: bold; color: #2196F3; padding: 10px; border-radius: 5px; background: #D6EAF8;">
          ${otp}
        </div>
        <hr />
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP reset password đã được gửi thành công!");
  } catch (error) {
    console.error("Lỗi gửi email reset password:", error);
    throw new Error("Failed to send reset password OTP email: " + error.message);
  }
};

const sendAdminVerificationEmail = async (email, verifyLink) => {
  const mailOptions = {
    from: `"HC-HealthCare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Xác thực tài khoản",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Xác Thực Tài Khoản</h2>
        <p>Xin chào,</p>
        <p>Bạn đã được tạo tài khoản Admin. Để hoàn tất quá trình xác thực, vui lòng nhấp vào đường dẫn sau:</p>
        <div style="text-align: center; padding: 10px;">
          <a href="${verifyLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Xác Thực Ngay
          </a>
        </div>
        <p>Nếu bạn không yêu cầu tài khoản này, vui lòng bỏ qua email này.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email xác thực Admin đã được gửi thành công!");
  } catch (error) {
    console.error("Lỗi gửi email xác thực Admin:", error);
    throw new Error("Failed to send admin verification email: " + error.message);
  }
};

// Gửi email thông báo trạng thái thanh toán
const sendPaymentStatusEmail = async ({
  email,
  customerName,
  paymentID,
  status,
  amount,
  bookingID,
}) => {
  const statusText = {
    success: "Thành công",
    failed: "Thất bại",
    cancelled: "Đã hủy",
    pending: "Đang chờ",
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Cập nhật trạng thái thanh toán cho đơn ${bookingID}`,
    html: `
      <h2>Xin chào ${customerName},</h2>
      <p>Chúng tôi xin thông báo trạng thái thanh toán của bạn:</p>
      <ul>
        <li><strong>Mã thanh toán:</strong> ${paymentID}</li>
        <li><strong>Mã đặt chỗ:</strong> ${bookingID}</li>
        <li><strong>Số tiền:</strong> ${amount.toLocaleString()} VND</li>
        <li><strong>Trạng thái:</strong> ${statusText[status]}</li>
      </ul>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
      <p>Trân trọng,<br/>Đội ngũ hỗ trợ</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Lỗi gửi email thông báo thanh toán:", error);
    throw new Error("Failed to send payment status email: " + error.message);
  }
};

module.exports = { sendOTP, sendResetPasswordOTP, sendAdminVerificationEmail, sendPaymentStatusEmail };