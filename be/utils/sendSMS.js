const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });
    console.log(`SMS sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    throw new Error('Failed to send SMS: ' + error.message);
  }
};

module.exports = { sendSMS };