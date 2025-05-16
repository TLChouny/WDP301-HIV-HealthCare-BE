// controllers/testResultController.js
const TestResult = require('../models/TestResult');

exports.addTestResult = async (req, res) => {
  const { date, type, result, userId } = req.body;
  try {
    const testResult = new TestResult({ date, type, result, userId });
    await testResult.save();
    res.status(201).json(testResult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTestResults = async (req, res) => {
  try {
    const testResults = await TestResult.find();
    res.status(200).json(testResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};