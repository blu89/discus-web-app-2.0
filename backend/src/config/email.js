import nodemailer from 'nodemailer';

// Only create transporter if email credentials are configured
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  // Create email transporter with connection pooling for better performance
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Connection pooling settings for better performance
    pool: {
      maxConnections: 5, // Max simultaneous connections
      maxMessages: 100, // Max messages per connection
      rateDelta: 1000, // Time window for rate limit (ms)
      rateLimit: 14, // Max messages per rate window
    },
    timeout: 15000, // 15 second timeout
    connectionTimeout: 15000, // 15 second connection timeout
  });

  // Verify transporter connection asynchronously (non-blocking)
  // Don't wait for it - allow the server to start even if email config fails
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email configuration error:', error.message);
      console.warn('⚠️  Email service may not work. Check EMAIL_* environment variables.');
      console.warn('📧 Common issues: SMTP credentials, firewall blocking, or network timeout');
    } else {
      console.log('✅ Email service is ready to send messages');
    }
  });
} else {
  console.warn('⚠️  Email credentials not configured (EMAIL_USER/EMAIL_PASSWORD). Email sending is disabled.');
  console.warn('📧 To enable: Set EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT in .env');
  // Create a no-op transporter that won't send emails
  transporter = {
    sendMail: async (options) => {
      console.log('Email would be sent to:', options.to, 'but email is not configured');
      return { messageId: 'mock-id' };
    }
  };
}

export default transporter;
