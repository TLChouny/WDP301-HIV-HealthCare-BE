const cron = require('node-cron');
const Result = require('../models/Result');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// Mapping tiếng Việt slot -> key
const SLOT_MAP = {
  'Sáng': 'morning',
  'Trưa': 'noon',
  'Tối': 'evening',
};

const SLOT_LABEL = {
  morning: 'sáng',
  noon: 'trưa',
  evening: 'tối',
};

let isProcessing = false;

cron.schedule('* * * * *', async () => {
  if (isProcessing) return;
  isProcessing = true;

  console.log('🔔 Running custom medication reminder cron job...');

  try {
    const now = new Date();
    const currentTime = formatTime(now); // e.g. "15:25"

    const results = await Result.find({
      medicationTime: { $exists: true, $ne: null },
      medicationSlot: { $exists: true, $ne: null },
      reExaminationDate: { $gte: now },
    });

    for (const result of results) {
      let times = result.medicationTime.split(';').map(t => t.trim());
      const slotNames = result.medicationSlot.split(' và ').map(s => s.trim());
      const slots = slotNames.map(name => SLOT_MAP[name]).filter(Boolean);

      if (times.length !== slots.length) {
        if (times.length === 1 && slots.length > 1) {
          times = slots.map(() => times[0]); // replicate time
        } else {
          console.warn(`⚠️ Số lượng thời gian và slot không khớp trong result ${result._id}`);
          continue;
        }
      }

      const booking = await Booking.findById(result.bookingId);
      if (!booking || !booking.userId) continue;

      for (let i = 0; i < times.length; i++) {
        const slotTime = times[i].slice(0, 5);
        const slot = slots[i];

        if (slotTime === currentTime) {
          const uniqueKey = `${booking.userId}_${result._id}_${slot}_${slotTime}`;

          // Kiểm tra xem đã từng gửi thông báo với key này chưa
          const existed = await Notification.findOne({ uniqueKey });
          if (existed) {
            console.log(`⚠️ Already sent notification (duplicate blocked): ${uniqueKey}`);
            continue;
          }

          await Notification.create({
            notiName: `Nhắc nhở uống thuốc (${SLOT_LABEL[slot]})`,
            notiDescription: `Đây là giờ uống thuốc buổi ${SLOT_LABEL[slot]} (${slotTime}). Vui lòng uống thuốc đúng giờ để đảm bảo hiệu quả điều trị.`,
            userId: booking.userId,
            bookingId: booking._id,
            resultId: result._id,
            uniqueKey, // Khóa chống trùng
          });

          console.log(`✅ Sent reminder to user ${booking.userId} - ${slot} at ${slotTime}`);
          console.log('🧪 Debug info:', {
            id: result._id,
            times,
            slotNames,
            slots,
            rawTime: result.medicationTime,
            rawSlot: result.medicationSlot,
          });
        }
      }
    }
  } catch (err) {
    console.error('❌ Cron error:', err);
  } finally {
    isProcessing = false;
  }
});

// Helper: format time thành HH:mm
function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
