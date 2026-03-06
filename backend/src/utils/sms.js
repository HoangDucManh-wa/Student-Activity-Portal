const twilio = require("twilio");

const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
};

const sendSMS = async ({ to, body }) => {
  const client = createTwilioClient();
  if (!client) {
    throw new Error("Twilio chưa được cấu hình");
  }

  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
};

module.exports = { sendSMS };
