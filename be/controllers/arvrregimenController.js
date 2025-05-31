const  ARVRregimen  = require('../models/ARVRegimen');

exports.create = async (req, res) => {
  try {
    const arvrregimen = new ARVRregimen(req.body);
    const savedARVRregimen = await arvrregimen.save();
    res.status(201).json(savedARVRregimen);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const arvrregimens = await ARVRregimen.find();
    res.status(200).json(arvrregimens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const arvrregimen = await ARVRregimen.findById(req.params.id);
    if (!arvrregimen) return res.status(404).json({ message: 'ARVRregimen not found' });
    res.status(200).json(arvrregimen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    const arvrregimen = await ARVRregimen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!arvrregimen) return res.status(404).json({ message: 'ARVRregimen not found' });
    res.status(200).json(arvrregimen);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const arvrregimen = await ARVRregimen.findByIdAndDelete(req.params.id);
    if (!arvrregimen) return res.status(404).json({ message: 'ARVRregimen not found' });
    res.status(200).json({ message: 'ARVRregimen deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};