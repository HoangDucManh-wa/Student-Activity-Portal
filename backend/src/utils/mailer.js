const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
const sendEmail = async ({ to, subject, html }) => {
  try {
    // Skip if email credentials not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Email not configured, skipping email send");
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Student Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email send error: ${error.message}`);
  }
};

// Email templates
const emailTemplates = {
  registrationConfirmation: (userName, eventName) => `
    <h2>Đăng ký thành công!</h2>
    <p>Xin chào ${userName},</p>
    <p>Bạn đã đăng ký thành công sự kiện: <strong>${eventName}</strong></p>
    <p>Vui lòng đến đúng giờ và mang theo thẻ sinh viên.</p>
    <p>Trân trọng,<br/>Ban tổ chức</p>
  `,

  cancellationNotice: (userName, eventName) => `
    <h2>Hủy đăng ký</h2>
    <p>Xin chào ${userName},</p>
    <p>Bạn đã hủy đăng ký sự kiện: <strong>${eventName}</strong></p>
    <p>Nếu có thay đổi, bạn có thể đăng ký lại nếu còn chỗ.</p>
    <p>Trân trọng,<br/>Ban tổ chức</p>
  `,
};

module.exports = {
  sendEmail,
  emailTemplates,
};
