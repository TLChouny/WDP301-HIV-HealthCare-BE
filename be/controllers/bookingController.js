const Booking = require('../models/Booking');
const Service = require('../models/Service');

// Generate 6-digit random booking code
const generateRandomSixDigitNumber = () => {
  return String(Math.floor(Math.random() * 900000) + 100000);
};

// Calculate end time based on start time + duration
const calculateEndTime = (startTime, duration) => {
  const [hour, minute] = startTime.split(':').map(Number);
  const total = hour * 60 + minute + duration;
  const endHour = Math.floor(total / 60) % 24; // prevent 24:xx
  const endMinute = total % 60;
  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
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
      fullName,
      phone,
      email,
      notes,
      isAnonymous,
      status
    } = req.body;

    if (!serviceId || !bookingDate || !startTime || (!isAnonymous && (!fullName || !phone))) {
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
      customerName: isAnonymous ? undefined : fullName,
      customerPhone: isAnonymous ? undefined : phone,
      customerEmail: isAnonymous ? undefined : email,
      notes,
      isAnonymous: !!isAnonymous,
      status: status || "pending",
      bookingCode
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 📌 Get all bookings
exports.getAll = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('serviceId').populate('userId');
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
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
