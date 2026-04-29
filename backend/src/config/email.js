import nodemailer from 'nodemailer';

// Only create transporter if email credentials are configured
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  // Create email transporter
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    timeout: 10000, // 10 second timeout
    connectionTimeout: 10000, // 10 second connection timeout
  });

  // Verify transporter connection asynchronously (non-blocking)
  // Don't wait for it - allow the server to start even if email config fails
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email configuration error:', error.message);
      console.warn('⚠️  Email service may not work. Check EMAIL_* environment variables.');
    } else {
      console.log('✅ Email service is ready to send messages');
    }
  });
} else {
  console.warn('⚠️  Email credentials not configured (EMAIL_USER/EMAIL_PASSWORD). Email sending is disabled.');
  // Create a no-op transporter that won't send emails
  transporter = {
    sendMail: async (options) => {
      console.log('Email would be sent to:', options.to, 'but email is not configured');
      return { messageId: 'mock-id' };
    }
  };
}

export default transporter;
