const cron = require('node-cron');
const Result = require('../models/Result');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// 🔥 Chạy mỗi phút
cron.schedule('* * * * *', async () => {
  console.log('🔔 Running medication reminder cron job...');

  try {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    // 🔍 Lấy tất cả result có medicationTime và chưa tới ngày tái khám
    const results = await Result.find({
      medicationTime: { $exists: true, $ne: null },
      reExaminationDate: { $gte: now }
    });

    for (const result of results) {
      if (result.medicationTime === currentTime) {
        const booking = await Booking.findById(result.bookingId);

        if (booking && booking.userId) {
          // 💥 Tạo notification nhắc uống thuốc
          await Notification.create({
            notiName: 'Nhắc nhở uống thuốc',
            notiDescription: `Đây là giờ uống thuốc của bạn. Vui lòng uống thuốc đúng giờ để đảm bảo hiệu quả điều trị.`,
            userId: booking.userId,
            bookingId: booking._id,
            resultId: result._id
          });

          console.log(`✅ Medication notification sent to userId ${booking.userId} at ${currentTime}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error in medication reminder cron job:', error);
  }
});
