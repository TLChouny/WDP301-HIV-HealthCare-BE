const cron = require('node-cron');
const Result = require('../models/Result');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// 🔥 Schedule chạy mỗi ngày lúc 2 giờ 30 chiều
cron.schedule('10 14 * * *', async () => {
  console.log('🔔 Running re-examination reminder cron job...');

  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(0,0,0,0); // set to 00:00:00 for date match

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1); // để tìm trong range [targetDate, nextDate)

    // 🔍 Tìm tất cả Result có reExaminationDate = hôm nay + 3 ngày
    const results = await Result.find({
      reExaminationDate: {
        $gte: targetDate,
        $lt: nextDate
      }
    });

    for (const result of results) {
      const booking = await Booking.findById(result.bookingId);

      if (booking && booking.userId) {
        // 💥 Tạo notification nhắc lịch tái khám
        await Notification.create({
          notiName: 'Nhắc lịch tái khám',
          notiDescription: `Bạn có lịch tái khám vào ngày ${result.reExaminationDate.toLocaleDateString('vi-VN')}. Đặt lịch ngay để đảm bảo sức khoẻ.`,
          userId: booking.userId,
          bookingId: booking._id,
          resultId: result._id
        });

        console.log(`✅ Notification sent to userId ${booking.userId}`);
      }
    }

  } catch (error) {
    console.error('❌ Error in re-examination reminder cron job:', error);
  }
});