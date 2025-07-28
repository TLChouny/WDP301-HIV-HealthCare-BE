require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes/routes');
const SmsLog = require('./models/SmsLog');

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
require('../be/cron/reminder.job');

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
app.use(express.urlencoded({ extended: true }));

app.post('/webhook/sms-status', async (req, res) => {
  const { messageId, to, status } = req.body;
    await SmsLog.create({ messageId, to, status });
  try {
    await SmsLog.create({ messageId, to, status });
    console.log('📩 DLR saved:', messageId, status);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Failed to save DLR:', err);
    res.sendStatus(500);
  }
});

app.get('/api/sms-logs', async (req, res) => {
  const logs = await SmsLog.find().sort({ timestamp: -1 }).limit(50);
  res.json(logs);
});

app.get('/webhook/sms-status', (req, res) => {
  res.send('✅ Webhook is live!');
});

// Routes
app.use('/api', routes);
app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});