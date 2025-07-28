const cron = require('node-cron');
const dayjs = require('dayjs');
const Result = require('../models/Result');
const { sendSMS } = require('../utils/sendSMS');

// 🕐 Cron chạy hàng ngày lúc 5:59 sáng
cron.schedule('35 15 * * *', async () => {
  console.log('🔔 [Cron] Đang kiểm tra lịch tái khám trước 3 ngày...');

  const targetDate = dayjs().add(3, 'day').format('YYYY-MM-DD');

  try {
    const results = await Result.find({ reExaminationDate: targetDate }).populate('bookingId');

    if (results.length === 0) {
      console.log(`ℹ️ Không có bệnh nhân nào cần nhắc vào ngày ${targetDate}`);
      return;
    }

    for (const result of results) {
      const booking = result.bookingId;
      if (!booking || !booking.customerPhone) {
        console.warn(`⚠️ Bỏ qua result vì thiếu thông tin booking hoặc số điện thoại`);
        continue;
      }

      const rawPhone = booking.customerPhone;
      const phone = rawPhone.startsWith('0') ? `84${rawPhone.slice(1)}` : rawPhone;

      const message = `📅 Nhắc nhở: Bạn có lịch tái khám vào ngày ${result.reExaminationDate}. Vui lòng sắp xếp thời gian!`;

      try {
        await sendSMS({ to: phone, text: message }); // ✅ Sửa tại đây
        console.log(`✅ Đã gửi SMS đến ${phone}`);
      } catch (err) {
        console.error(`❌ Lỗi gửi SMS tới ${phone}:`, err.message);
      }
    }

  } catch (err) {
    console.error('❌ Lỗi khi truy vấn dữ liệu Result:', err.message);
  }
});
