const mongoose = require('mongoose');
const Result = require('../models/Result');
const Booking = require('../models/Booking');
const ARVRegimen = require('../models/ARVRegimen'); // Nếu cần sử dụng ARVRegimen

const ObjectId = mongoose.Types.ObjectId;

exports.create = async (req, res) => {
  try {
    // Convert bookingId to ObjectId nếu là string
    if (req.body.bookingId && typeof req.body.bookingId === 'string') {
      req.body.bookingId = new ObjectId(req.body.bookingId);
    }

    // Convert arvregimenId to ObjectId nếu là string
    if (req.body.arvregimenId && typeof req.body.arvregimenId === 'string') {
      req.body.arvregimenId = new ObjectId(req.body.arvregimenId);
    }

    const result = new Result(req.body);
    const savedResult = await result.save();

    // Cập nhật status của booking thành 'completed'
    if (savedResult.bookingId) {
      await Booking.findByIdAndUpdate(
        savedResult.bookingId,
        { status: 'completed' || 're-examination' }, // hoặc 're-examination' tuỳ logic
        { new: true }
      );
    }

    res.status(201).json(savedResult);
  } catch (error) {
    console.error('Error creating result:', error);
    res.status(400).json({ message: error.message });
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
        populate: {
          path: 'serviceId',
          model: 'Service'
        }
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
        populate: {
          path: 'serviceId',
          model: 'Service'
        }
      })
      .populate('arvregimenId')
      .exec();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error in getAllByDoctorName:', error);
    res.status(500).json({ message: error.message });
  }
};

