const mongoose = require('mongoose');
const Result = require('../models/Result');
const Booking = require('../models/Booking');
const ARVRegimen = require('../models/ARVRegimen');
const Notification = require('../models/Notification');

/**
 * Auto-generate interpretation note
 */
const generateInterpretationNote = ({ testResult, viralLoad, cd4Count, p24Antigen, hivAntibody }) => {
  if (testResult === 'positive') return 'Kết quả dương tính';
  if (testResult === 'negative') return 'Kết quả âm tính';

  if (viralLoad != null) {
    if (viralLoad < 20) return 'Tải lượng virus không phát hiện';
    if (viralLoad < 1000) return 'Tải lượng virus thấp';
    return 'Tải lượng virus cao';
  }

  if (cd4Count != null) {
    if (cd4Count > 500) return 'CD4 bình thường';
    if (cd4Count > 200) return 'CD4 thấp';
    return 'CD4 rất thấp, cần theo dõi đặc biệt';
  }

  if (p24Antigen != null || hivAntibody != null) return 'Có dấu hiệu nhiễm HIV';

  return '';
};

/**
 * CREATE RESULT + UPDATE BOOKING + CREATE NOTIFICATION
 */
exports.create = async (req, res) => {
  try {
    const {
      resultName,
      resultDescription,
      testerName,
      notes,
      symptoms,
      weight,
      height,
      bmi,
      bloodPressure,
      pulse,
      temperature,
      sampleType,
      testMethod,
      testResult,
      viralLoad,
      viralLoadReference,
      viralLoadInterpretation,
      cd4Count,
      cd4Reference,
      cd4Interpretation,
      unit,
      coInfections,
      p24Antigen,
      hivAntibody,
      interpretationNote, // optional override
      reExaminationDate,
      medicationTime,
      medicationSlot,
      bookingId,
      arvregimenId
    } = req.body;

    // Validate
    if (!resultName || !bookingId) {
      return res.status(400).json({ message: "Missing required fields: resultName, bookingId" });
    }

    const convertedBookingId = new mongoose.Types.ObjectId(bookingId);
    const convertedArvregimenId = arvregimenId ? new mongoose.Types.ObjectId(arvregimenId) : undefined;

    // Auto-generate interpretationNote nếu không có
    const finalInterpretationNote =
      interpretationNote ||
      generateInterpretationNote({
        testResult,
        viralLoad,
        cd4Count,
        p24Antigen,
        hivAntibody,
      });

    // Create result
    const newResult = new Result({
      resultName,
      resultDescription,
      testerName,
      notes,
      symptoms,
      weight,
      height,
      bmi,
      bloodPressure,
      pulse,
      temperature,
      sampleType,
      testMethod,
      testResult,
      viralLoad,
      viralLoadReference,
      viralLoadInterpretation,
      cd4Count,
      cd4Reference,
      cd4Interpretation,
      unit,
      coInfections,
      p24Antigen,
      hivAntibody,
      interpretationNote: finalInterpretationNote,
      reExaminationDate,
      medicationTime,
      medicationSlot,
      bookingId: convertedBookingId,
      arvregimenId: convertedArvregimenId,
    });

    const savedResult = await newResult.save();

    // Update booking status
    const booking = await Booking.findByIdAndUpdate(
      convertedBookingId,
      { status: 'completed' },
      { new: true }
    );

    // Notify user
    if (booking?.userId) {
      await Notification.create({
        notiName: 'Kết quả khám đã sẵn sàng',
        notiDescription: `Kết quả "${resultName}" đã được cập nhật. Vui lòng kiểm tra hồ sơ.`,
        userId: booking.userId,
        bookingId: booking._id,
        resultId: savedResult._id,
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
          { path: 'userId', model: 'User' },
        ],
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
 * GET RESULTS BY USER ID
 */
exports.getAllByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const bookings = await Booking.find({ userId }).select('_id');
    const bookingIds = bookings.map((b) => b._id);

    if (!bookingIds.length) return res.status(200).json([]);

    const results = await Result.find({ bookingId: { $in: bookingIds } })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'serviceId', model: 'Service' },
          { path: 'userId', model: 'User' },
        ],
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
          { path: 'userId', model: 'User' },
        ],
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
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

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
 * GET RESULTS BY DOCTOR NAME
 */
exports.getAllByDoctorName = async (req, res) => {
  try {
    const doctorName = req.params.doctorName;
    if (!doctorName) return res.status(400).json({ message: 'doctorName is required' });

    const bookings = await Booking.find({ doctorName }).select('_id');
    const bookingIds = bookings.map((b) => b._id);

    if (!bookingIds.length) return res.status(200).json([]);

    const results = await Result.find({ bookingId: { $in: bookingIds } })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'serviceId', model: 'Service' },
          { path: 'userId', model: 'User' },
        ],
      })
      .populate('arvregimenId')
      .exec();

    res.status(200).json(results);
  } catch (error) {
    console.error('Error in getAllByDoctorName:', error);
    res.status(500).json({ message: error.message });
  }
};
