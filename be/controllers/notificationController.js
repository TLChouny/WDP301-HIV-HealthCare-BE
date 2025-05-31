  const  Notification  = require('../models/Notification');

  exports.create = async (req, res) => {
    try {
      const notification = new Notification(req.body);
      const savedNotification = await notification.save();
      res.status(201).json(savedNotification);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  exports.getAll = async (req, res) => {
    try {
      const notifications = await Notification.find();
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  exports.getById = async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  exports.updateById = async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
      res.status(200).json(notification);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  exports.deleteById = async (req, res) => {
    try {
      const notification = await Notification.findByIdAndDelete(req.params.id);
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };