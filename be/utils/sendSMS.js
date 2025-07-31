// const twilio = require('twilio');

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// const client = new twilio(accountSid, authToken);

// const sendSMS = async (to, message) => {
//   try {
//     await client.messages.create({
//       body: message,
//       from: twilioPhoneNumber,
//       to: to
//     });
//     console.log(`SMS sent successfully to ${to}`);
//   } catch (error) {
//     console.error('Error sending SMS:', error.message);
//     throw new Error('Failed to send SMS: ' + error.message);
//   }
// };

// module.exports = { sendSMS };
// sendSMS.js
// sendSMS.js
// utils/sendSMS.js

// 📁 be/utils/smsService.js
// require('dotenv').config();
// const { Vonage } = require('@vonage/server-sdk');
// const SmsLog = require('../models/SmsLog');

// const vonage = new Vonage({
//   apiKey: process.env.VONAGE_API_KEY,
//   apiSecret: process.env.VONAGE_API_SECRET,
// });

// const normalizePhone = (phone) => {
//   const raw = phone.replace(/\s+/g, '').replace(/^(\+|00)/, '');
//   if (raw.startsWith('84')) return `+${raw}`;
//   if (raw.startsWith('0')) return `+84${raw.slice(1)}`;
//   return `+84${raw}`;
// };

// const sendSMS = async ({ to, text }) => {
//   const normalizedTo = normalizePhone(to); // 🧠 sử dụng phiên bản mới
//   try {
//     const response = await vonage.sms.send({
//       to: normalizedTo,
//       from: process.env.VONAGE_BRAND_NAME,
//       text,
//     });

//     const message = response.messages[0];
//     console.log('✅ SMS sent:', message);
//     return message;
//   } catch (err) {
//     console.error('❌ Error sending SMS:', err);
//     throw err;
//   }
// };


// module.exports = { sendSMS };
