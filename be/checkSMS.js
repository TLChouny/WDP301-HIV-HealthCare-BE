const { getSMSStatus } = require('./utils/getSMSStatus');

const run = async () => {
  const messageId = '0B00000012345678'; // <-- messageId bạn lấy từ response hoặc webhook
  await getSMSStatus(messageId);
};

run();
