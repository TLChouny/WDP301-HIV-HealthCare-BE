const Result = require('../models/Result');
const Booking = require('../models/Booking');

exports.create = async (req, res) => {
  try {
    const result = new Result(req.body);
    const savedResult = await result.save();

    // Cập nhật status của booking thành 'completed'
    if (savedResult.bookingId) {
      await Booking.findByIdAndUpdate(
        savedResult.bookingId,
        { status: 'completed' || 're-examination' }, // Cập nhật status tùy theo yêu cầu
        { new: true }
      );
    }

    res.status(201).json(savedResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const results = await Result.find().populate('bookingId');
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllByUserId = async (req, res) => {
  try {
    const userId = req.params.userId; // Sử dụng req.params.userId thay vì req.query.userId
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const results = await Result.find()
      .populate({
        path: 'bookingId',
        match: { 'userId': userId }, // Lọc booking theo userId
        populate: { path: 'userId' } // Populate thông tin user nếu cần
      })
      .exec();

    // Lọc bỏ các result không có bookingId khớp với userId (nếu populate không trả về)
    const filteredResults = results.filter(result => result.bookingId && result.bookingId.userId && result.bookingId.userId._id.toString() === userId);

    res.status(200).json(filteredResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate('bookingId');
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.status(200).json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};