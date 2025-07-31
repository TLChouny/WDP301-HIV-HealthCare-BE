// controllers/cronController.js
const Result = require('../models/Result');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

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

const formatTime = (date) => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

exports.runMedicationReminder = async (req, res) => {
  if (isProcessing) return res.status(200).json({ message: 'Task already running.' });
  isProcessing = true;

  console.log('🔔 Triggered medication reminder via API');

  try {
    const now = new Date();
    const currentTime = formatTime(now);

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
          times = slots.map(() => times[0]);
        } else {
          console.warn(`⚠️ Mismatch in times/slots for result ${result._id}`);
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

          const existed = await Notification.findOne({ uniqueKey });
          if (existed) {
            console.log(`⚠️ Duplicate detected: ${uniqueKey}`);
            continue;
          }

          await Notification.create({
            notiName: `Nhắc nhở uống thuốc (${SLOT_LABEL[slot]})`,
            notiDescription: `Đây là giờ uống thuốc buổi ${SLOT_LABEL[slot]} (${slotTime}). Vui lòng uống thuốc đúng giờ để đảm bảo hiệu quả điều trị.`,
            userId: booking.userId,
            bookingId: booking._id,
            resultId: result._id,
            uniqueKey,
          });

          console.log(`✅ Gửi nhắc nhở user ${booking.userId} - ${slot} lúc ${slotTime}`);
        }
      }
    }

    res.status(200).json({ message: 'Medication reminder completed.' });
  } catch (err) {
    console.error('❌ Cron error:', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    isProcessing = false;
  }
};

exports.reExaminationReminder = async (req, res) => {
  console.log('🔔 Triggered re-examination reminder via API');

  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(0, 0, 0, 0); // 00:00:00

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1); // range [targetDate, nextDate)

    const results = await Result.find({
      reExaminationDate: {
        $gte: targetDate,
        $lt: nextDate
      }
    });

    for (const result of results) {
      const booking = await Booking.findById(result.bookingId);

      if (booking && booking.userId) {
        await Notification.create({
          notiName: 'Nhắc lịch tái khám',
          notiDescription: `Bạn có lịch tái khám vào ngày ${result.reExaminationDate.toLocaleDateString('vi-VN')}. Đặt lịch ngay để đảm bảo sức khoẻ.`,
          userId: booking.userId,
          bookingId: booking._id,
          resultId: result._id
        });

        console.log(`✅ Nhắc tái khám gửi cho userId ${booking.userId}`);
      }
    }

    res.status(200).json({ message: 'Re-examination reminders sent successfully' });
  } catch (error) {
    console.error('❌ Cron error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
