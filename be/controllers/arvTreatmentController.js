// controllers/arvTreatmentController.js
const ARVTreatment = require('../models/ARVTreatment');

exports.addARVTreatment = async (req, res) => {
  const { startDate, medication, dosage, nextVisit, userId } = req.body;
  try {
    const arvTreatment = new ARVTreatment({ startDate, medication, dosage, nextVisit, userId });
    await arvTreatment.save();
    res.status(201).json(arvTreatment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getARVTreatment = async (req, res) => {
  try {
    const arvTreatment = await ARVTreatment.findOne({ userId: req.params.userId });
    res.status(200).json(arvTreatment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};