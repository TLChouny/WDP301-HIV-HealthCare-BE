const Service = require('../models/Service');
const mongoose = require('mongoose');

// ✅ Create Service
exports.create = async (req, res) => {
  try {
    const {
      serviceName,
      categoryId,
      price,
      serviceDescription,
      serviceImage,
      duration,
      isLabTest,
      isArvTest
    } = req.body;

    // 🔒 Validate required fields
    if (!serviceName || !categoryId || price == null) {
      return res.status(400).json({
        message: 'Missing required fields: serviceName, categoryId, or price'
      });
    }

    // ✅ Create new service
    const newService = new Service({
      serviceName,
      categoryId: new mongoose.Types.ObjectId(categoryId),
      price,
      serviceDescription,
      serviceImage,
      duration,
      isLabTest: isLabTest || false,
      isArvTest: isArvTest || false
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Get All Services
exports.getAll = async (req, res) => {
  try {
    const services = await Service.find().populate('categoryId');
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Service by ID
exports.getById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('categoryId');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Service by ID
exports.updateById = async (req, res) => {
  try {
    const updateData = req.body;

    // Nếu FE không truyền isLabTest hoặc isArvTest thì giữ nguyên, nếu truyền false cũng được update
    if (updateData.isLabTest == null) delete updateData.isLabTest;
    if (updateData.isArvTest == null) delete updateData.isArvTest;

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete Service by ID
exports.deleteById = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Services by Category ID
exports.getByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const services = await Service.find({
      $or: [
        { categoryId: categoryId }, // match string
        { categoryId: new mongoose.Types.ObjectId(categoryId) } // match ObjectId
      ]
    }).populate('categoryId');

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

