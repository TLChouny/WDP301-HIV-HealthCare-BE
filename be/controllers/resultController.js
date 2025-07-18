const mongoose = require('mongoose');
const Result = require('../models/Result');
const Booking = require('../models/Booking');
const ARVRegimen = require('../models/ARVRegimen');
const Notification = require('../models/Notification');
const ObjectId = mongoose.Types.ObjectId;

exports.create = async (req, res) => {
  try {
    const {
      resultName,
      resultDescription,
      reExaminationDate,
      medicationTime,
      bookingId,
      arvregimenId
    } = req.body;

    // ⚠️ Validate required fields
    if (!resultName || !reExaminationDate || !bookingId || !arvregimenId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔥 Convert IDs to ObjectId if needed
    const convertedBookingId = typeof bookingId === 'string' ? new ObjectId(bookingId) : bookingId;
    const convertedArvregimenId = typeof arvregimenId === 'string' ? new ObjectId(arvregimenId) : arvregimenId;

    // 🔥 1. Tạo result mới
    const newResult = new Result({
      resultName,
      resultDescription,
      reExaminationDate,
      medicationTime, // Thêm trường medicationTime
      bookingId: convertedBookingId,
      arvregimenId: convertedArvregimenId
    });

    const savedResult = await newResult.save();

    // 🔥 2. Cập nhật status của booking thành 'completed'
    const booking = await Booking.findByIdAndUpdate(
      convertedBookingId,
      { status: 'completed' }, // tuỳ logic: 'completed' hoặc 're-examination'
      { new: true }
    );

    // 🔥 3. Tạo notification nếu booking có userId
    if (booking && booking.userId) {
      await Notification.create({
        notiName: 'Kết quả khám đã sẵn sàng',
        notiDescription: `Kết quả "${resultName}" đã được cập nhật. Vui lòng kiểm tra hồ sơ.`,
        userId: booking.userId,
        bookingId: booking._id,
        resultId: savedResult._id
      });
    }

    res.status(201).json(savedResult);
  } catch (error) {
    console.error('Error creating result:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getAll = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('bookingId')
      .populate('arvregimenId')
      .exec();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error getting all results:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // 🔥 Step 1: Find all bookings by userId
    const bookings = await Booking.find({ userId: userId }).select('_id');
    const bookingIds = bookings.map(b => b._id);

    if (bookingIds.length === 0) {
      // ✅ Không có booking → trả array rỗng
      return res.status(200).json([]);
    }

    // 🔥 Step 2: Find results with bookingId in user's bookings
    const results = await Result.find({ bookingId: { $in: bookingIds } })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'serviceId', model: 'Service' },
          { path: 'userId', model: 'User' } // Thêm dòng này để populate user
        ]
      })
      .populate('arvregimenId')
      .exec();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error in getAllByUserId:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({
        path: 'bookingId',
        populate: {
          path: 'serviceId',
          model: 'Service'
        }
      })
      .populate('arvregimenId')
      .exec();

    if (!result) return res.status(404).json({ message: 'Result not found' });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting result by id:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!result) return res.status(404).json({ message: 'Result not found' });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating result:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });

    res.status(200).json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllByDoctorName = async (req, res) => {
  try {
    const doctorName = req.params.doctorName;
    if (!doctorName) {
      return res.status(400).json({ message: 'doctorName is required' });
    }

    // 🔥 Step 1: Find all bookings with this doctorName
    const bookings = await Booking.find({ doctorName: doctorName }).select('_id');
    const bookingIds = bookings.map(b => b._id);

    if (bookingIds.length === 0) {
      // ✅ Không có booking → trả array rỗng
      return res.status(200).json([]);
    }

    // 🔥 Step 2: Find results with bookingId in these bookings
    const results = await Result.find({ bookingId: { $in: bookingIds } })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'serviceId', model: 'Service' },
          { path: 'userId', model: 'User' } // Thêm dòng này để populate user
        ]
      })
      .populate('arvregimenId')
      .exec();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error in getAllByDoctorName:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.createNotiResult = async (req, res) => {
  try {
    const {
      resultName,
      resultDescription,
      reExaminationDate,
      bookingId,
      arvregimenId
    } = req.body;

    // ⚠️ Validate input
    if (!resultName || !reExaminationDate || !bookingId || !arvregimenId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔥 1. Tạo result mới
    const newResult = new Result({
      resultName,
      resultDescription,
      reExaminationDate,
      bookingId,
      arvregimenId
    });

    const savedResult = await newResult.save();

    // 🔥 2. Tìm booking để lấy userId
    const booking = await Booking.findById(bookingId);

    // 🔥 3. Tạo notification nếu booking có userId
    if (booking && booking.userId) {
      await Notification.create({
        notiName: 'Kết quả khám đã sẵn sàng',
        notiDescription: `Kết quả "${resultName}" đã được cập nhật. Vui lòng kiểm tra hồ sơ.`,
        userId: booking.userId,
        bookingId: booking._id,
        resultId: savedResult._id
      });
    }

    res.status(201).json(savedResult);
  } catch (error) {
    console.error('Error creating result:', error);
    res.status(500).json({ message: error.message });
  }
};

