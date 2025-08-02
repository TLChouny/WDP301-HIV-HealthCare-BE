const Booking = require('../models/Booking'); // Điều chỉnh lại path đúng theo dự án của bạn
const Service = require('../models/Service'); // Đảm bảo model này tồn tại
const Notification = require('../models/Notification');
const User = require('../models/User'); 

const mongoose = require('mongoose');
// Generate 6-digit random booking code
const generateRandomSixDigitNumber = () => {
  return String(Math.floor(Math.random() * 900000) + 100000);
};

// Tính thời gian kết thúc dựa vào startTime và duration (phút)
const calculateEndTime = (startTime, duration) => {
  const [hour, minute] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setMinutes(date.getMinutes() + duration);
  return date.toTimeString().slice(0, 5); // Format: HH:mm
};

// Tạo danh sách slot theo khoảng thời gian
const generateTimeSlotsInRange = (startTime, endTime, interval = 30) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentTime = new Date();
  currentTime.setHours(startHour, startMinute, 0, 0);

  const endTimeDate = new Date();
  endTimeDate.setHours(endHour, endMinute, 0, 0);

  while (currentTime < endTimeDate) {
    slots.push(
      `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`
    );
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }

  return slots;
};

// 📌 API kiểm tra các khung giờ đã được đặt của bác sĩ trong ngày
exports.checkExistingBookings = async (req, res) => {
  try {
    const { doctorName, bookingDate } = req.query;

    if (!doctorName || !bookingDate) {
      return res.status(400).json({ message: 'Missing doctorName or bookingDate parameter' });
    }

    console.log('🔍 Received query:', { doctorName, bookingDate });

    const bookings = await Booking.find({ doctorName, bookingDate }).populate('serviceId');
    console.log('📦 Found bookings:', bookings.length);

    const bookedSlots = new Set();

    for (const booking of bookings) {
      let startTime = booking.startTime;
      let endTime = booking.endTime;

      // Ưu tiên lấy duration từ serviceId, fallback dùng booking.duration nếu có
      let duration =
        (booking.serviceId && booking.serviceId.duration) ||
        booking.duration;

      // Nếu không có endTime → tự tính từ startTime + duration
      if (!endTime && startTime && duration) {
        endTime = calculateEndTime(startTime, duration);
      }

      if (startTime && endTime) {
        const slots = generateTimeSlotsInRange(startTime, endTime);
        slots.forEach((slot) => bookedSlots.add(slot));
      } else {
        console.warn(`⚠️ Missing time data in booking ${booking._id}`);
      }
    }

    console.log('⏱️ Booked slots:', [...bookedSlots]);
    res.status(200).json([...bookedSlots]);
  } catch (error) {
    console.error('❌ Error in checkExistingBookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// 📌 Tạo booking mới
exports.create = async (req, res) => {
  try {
    const {
      userId,
      serviceId,
      doctorName,
      bookingDate,
      startTime,
      endTime,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      isAnonymous,
      status
    } = req.body;

    if (!serviceId || !bookingDate || !startTime || (!isAnonymous && (!customerName || !customerPhone || !customerEmail))) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // 💥 Kiểm tra xung đột lịch
    const isConflict = await Booking.findOne({
      doctorName,
      bookingDate,
      startTime
    });

    if (isConflict) {
      return res.status(409).json({
        message: "Doctor already has a booking at this time."
      });
    }

    const realEndTime = endTime || calculateEndTime(startTime, service.duration || 30);

    let bookingCode;
    let isUnique = false;
    while (!isUnique) {
      const code = `BOOK-${generateRandomSixDigitNumber()}`;
      const existing = await Booking.findOne({ bookingCode: code });
      if (!existing) {
        bookingCode = code;
        isUnique = true;
      }
    }

    const newBooking = new Booking({
      userId: userId || null,
      serviceId,
      serviceName: service.name,
      bookingDate,
      startTime,
      endTime: realEndTime,
      doctorName: doctorName || null,
      customerName: isAnonymous ? undefined : customerName,
      customerPhone: isAnonymous ? undefined : customerPhone,
      customerEmail: isAnonymous ? undefined : customerEmail,
      notes,
      isAnonymous: !!isAnonymous,
      status: status || "pending",
      bookingCode
    });

    const savedBooking = await newBooking.save();

    // Tạo notification tự động
    if (savedBooking._id) {
      await Notification.create({
        notiName: 'Đặt lịch thành công',
        notiDescription: 'Bạn đã đặt lịch thành công!',
        bookingId: savedBooking._id,
        userId: userId || null, // Gán userId nếu có
      }).catch(err => {
        console.error('❌ Error creating notification:', err);
      });
    }

    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('❌ Error in create booking:', error);
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get all bookings
exports.getAll = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('serviceId') // Lấy toàn bộ field của service
      .populate('userId');   // Lấy toàn bộ field của user

    // Trả về toàn bộ object serviceId và userId
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      bookingCode: booking.bookingCode,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      serviceId: booking.serviceId, // Trả về toàn bộ object service
      userId: booking.userId,       // Trả về toàn bộ object user
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      doctorName: booking.doctorName,
      status: booking.status,
      meetLink: booking.meetLink,
      doctorNote: booking.doctorNote,
      isAnonymous: booking.isAnonymous,
      notes: booking.notes
    }));

    res.status(200).json(transformedBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get bookings by UserID
exports.getBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId parameter" });
    }

    const bookings = await Booking.find({ userId })
      .populate('serviceId')
      .populate('userId');
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this user' });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get bookings by doctorName
exports.getBookingsByDoctorName = async (req, res) => {
  try {
    const { doctorName } = req.params;
    if (!doctorName) {
      return res.status(400).json({ message: "Missing doctorName parameter" });
    }

    const bookings = await Booking.find({ doctorName })
      .populate('serviceId')
      .populate('userId');
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this doctor' });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get booking by ID
exports.getById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('serviceId').populate('userId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Update booking
exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
    if (req.body.meetLink && !urlRegex.test(req.body.meetLink)) {
      return res.status(400).json({ message: 'Invalid meetLink URL' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // ✅ Khi staff cập nhật meetLink
    if (req.body.meetLink) {
      try {
        if (booking.userId) {
          await Notification.create({
            notiName: 'Link tư vấn đã sẵn sàng',
            notiDescription: `Link Google Meet: ${req.body.meetLink}`,
            userId: booking.userId,
            bookingId: booking._id
          });
        }

        if (booking.doctorName) {
          const doctorUser = await User.findOne({ doctorName: booking.doctorName });
          if (doctorUser) {
            await Notification.create({
              notiName: 'Lịch tư vấn mới',
              notiDescription: `Bạn có lịch tư vấn với link: ${req.body.meetLink}`,
              userId: doctorUser._id,
              bookingId: booking._id
            });
          } else {
            console.warn(`Doctor with name ${booking.doctorName} not found`);
          }
        }

        // Cập nhật status thành "checked-in"
        booking.status = "checked-in";
        await booking.save();
        console.log(`🔄 Status updated to "checked-in" for booking ${booking._id}`);

      } catch (notiError) {
        console.error('Notification creation failed:', notiError.message);
      }
    }
    // ✅ Nếu có doctorNote và booking đã checked-in → cập nhật status thành completed
if (req.body.doctorNote && booking.status === "checked-in") {
  booking.status = "completed";
  await booking.save();
  console.log(`✅ Đã cập nhật status => completed cho booking ${booking._id} vì đã có doctorNote`);
    // Gửi thông báo cho user
      if (booking.userId) {
        try {
          await Notification.create({
            notiName: 'Buổi tư vấn đã hoàn tất',
            notiDescription: 'Nội dung tư vấn đã được gửi. Cảm ơn bạn đã tham gia buổi tư vấn!',
            userId: booking.userId,
            bookingId: booking._id
          });
        } catch (err) {
          console.error("❌ Failed to create completion notification:", err.message);
        }
      }
}
    res.status(200).json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    res.status(400).json({ message: error.message || 'Internal server error' });
  }
};


// 📌 Delete booking
exports.deleteById = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};