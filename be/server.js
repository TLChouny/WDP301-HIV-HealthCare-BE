require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes/routes');

const app = express();

// Connect to MongoDB
connectDB();

// Cấu hình CORS
const allowedOrigins = [
  'http://localhost:5173', // Cho môi trường phát triển
  'https://wdp-301-hiv-health-care-web.vercel.app',
  'https://wdp301-hiv-healthcare-web.onrender.com', // Thêm URL của ứng dụng web đã deploy
];

require('../be/cron/reExaminationReminder'); // Import cron job
require('../be/cron/medicationReminder'); // Import cron job

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép yêu cầu không có origin (như từ Postman hoặc các công cụ không phải trình duyệt)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api', routes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});