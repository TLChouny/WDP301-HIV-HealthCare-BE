// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const testResultRoutes = require('./routes/testResultRoutes');
const arvTreatmentRoutes = require('./routes/arvTreatmentRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', doctorRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', testResultRoutes);
app.use('/api', arvTreatmentRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});