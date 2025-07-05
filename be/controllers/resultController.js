const Result = require('../models/Result');
const Booking = require('../models/Booking'); // Thêm dòng này

exports.create = async (req, res) => {
  try {
    const result = new Result(req.body);
    const savedResult = await result.save();

    // Cập nhật status của booking thành 'completed'
    if (savedResult.bookingId) {
      await Booking.findByIdAndUpdate(
        savedResult.bookingId,
        { status: 'completed' | 're-examination' }, // Cập nhật status tùy theo yêu cầu
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