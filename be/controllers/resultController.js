const mongoose = require('mongoose');
const Result = require('../models/Result');
const Booking = require('../models/Booking');
const ARVRegimen = require('../models/ARVRegimen');
const Notification = require('../models/Notification');
const ObjectId = mongoose.Types.ObjectId;

/**
 * CREATE RESULT + UPDATE BOOKING + CREATE NOTIFICATION
 */
exports.create = async (req, res) => {
  try {
    const {
      resultName,
      resultDescription,
      symptoms,
      weight,
      height,
      bmi,
      bloodPressure,
      pulse,
      temperature,
      sampleType,
      testMethod,
      resultType,
      testResult,
      testValue,
      unit,
      referenceRange,
      reExaminationDate,
      medicationTime,
      medicationSlot,
      bookingId,
      arvregimenId
    } = req.body;

    // ⚠️ Validate required fields
    if (!resultName || !bookingId) {
      return res.status(400).json({ message: "Missing required fields: resultName, bookingId" });
    }

    // 🔥 Convert IDs to ObjectId if needed
    const convertedBookingId = typeof bookingId === 'string' ? new mongoose.Types.ObjectId(bookingId) : bookingId;
    // const convertedArvregimenId = arvregimenId && typeof arvregimenId === 'string' ? new mongoose.Types.ObjectId(arvregimenId) : arvregimenId;
    let convertedArvregimenId = undefined;
    if (
      arvregimenId &&
      typeof arvregimenId === 'string' &&
      mongoose.Types.ObjectId.isValid(arvregimenId)
    ) {
      convertedArvregimenId = new mongoose.Types.ObjectId(arvregimenId);
    }

    // 🔥 Create new result
    const newResult = new Result({
      resultName,
      resultDescription,
      symptoms,
      weight,
      height,
      bmi,
      bloodPressure,
      pulse,
      temperature,
      sampleType,
      testMethod,
      resultType,
      testResult,
      testValue,
      unit,
      referenceRange,
      reExaminationDate,
      medicationTime,
      medicationSlot,
      bookingId: convertedBookingId,
      arvregimenId: convertedArvregimenId
    });

    const savedResult = await newResult.save();

    // 🔥 Update booking status to 'completed'
    const booking = await Booking.findByIdAndUpdate(
      convertedBookingId,
      { status: 'completed' },
      { new: true }
    );

    // 🔥 Create notification if booking has userId
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


/**
 * GET ALL RESULTS
 */
exports.getAll = async (req, res) => {
  try {
    const results = await Result.find()
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'serviceId', model: 'Service' },
          { path: 'userId', model: 'User' }
        ]
      })
      .populate('arvregimenId')
      .exec();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error getting all results:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL RESULTS BY USER ID
 */
exports.getAllByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const bookings = await Booking.find({ userId: userId }).select('_id');
    const bookingIds = bookings.map(b => b._id);

    if (bookingIds.length === 0) {
      return res.status(200).json([]);
    }

    const results = await Result.find({ bookingId: { $in: bookingIds } })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'serviceId', model: 'Service' },
          { path: 'userId', model: 'User' }
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

/**
 * GET RESULT BY ID
 */
exports.getById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'serviceId', model: 'Service' },
          { path: 'userId', model: 'User' }
        ]
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

/**
 * UPDATE RESULT BY ID
 */
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

/**
 * DELETE RESULT BY ID
 */
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

/**
 * GET ALL RESULTS BY DOCTOR NAME
 */
exports.getAllByDoctorName = async (req, res) => {
  try {
    const doctorName = req.params.doctorName;
    if (!doctorName) {
      return res.status(400).json({ message: 'doctorName is required' });
    }

    const bookings = await Booking.find({ doctorName: doctorName }).select('_id');
    const bookingIds = bookings.map(b => b._id);

    if (bookingIds.length === 0) {
      return res.status(200).json([]);
    }

    const results = await Result.find({ bookingId: { $in: bookingIds } })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'serviceId', model: 'Service' },
          { path: 'userId', model: 'User' }
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
