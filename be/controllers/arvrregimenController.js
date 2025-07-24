const ARVRegimen = require('../models/ARVRegimen');
const mongoose = require('mongoose');

// ✅ Create ARVRegimen
exports.create = async (req, res) => {
  try {
    const {
      arvName,
      arvDescription,
      regimenCode,
      treatmentLine,
      recommendedFor,
      drugs,
      dosages,
      frequency,
      contraindications,
      sideEffects,
    } = req.body;

    const userId = req.user._id; // req.user từ middleware auth

    const newARVRegimen = new ARVRegimen({
      arvName,
      arvDescription,
      regimenCode,
      treatmentLine,
      recommendedFor,
      drugs,
      dosages,
      frequency,
      contraindications,
      sideEffects,
      userId: userId || null,
    });

    const savedARVRegimen = await newARVRegimen.save();
    res.status(201).json(savedARVRegimen);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ✅ Get All ARVRegimens
exports.getAll = async (req, res) => {
  try {
    const arvrregimens = await ARVRegimen.find();
    res.status(200).json(arvrregimens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get ARVRegimen by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ARVRegimen ID' });
    }

    const arvrregimen = await ARVRegimen.findById(id);
    if (!arvrregimen) {
      return res.status(404).json({ message: 'ARVRegimen not found' });
    }
    res.status(200).json(arvrregimen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update ARVRegimen by ID
exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ARVRegimen ID' });
    }

    const updatedARVRegimen = await ARVRegimen.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedARVRegimen) {
      return res.status(404).json({ message: 'ARVRegimen not found' });
    }

    res.status(200).json(updatedARVRegimen);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete ARVRegimen by ID
exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ARVRegimen ID' });
    }

    const deletedARVRegimen = await ARVRegimen.findByIdAndDelete(id);
    if (!deletedARVRegimen) {
      return res.status(404).json({ message: 'ARVRegimen not found' });
    }

    res.status(200).json({ message: 'ARVRegimen deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
