/**
 * EMAIL CONFIGURATION MODULE
 * 
 * ⚠️  ENVIRONMENT VARIABLE PROTECTION
 * This module handles email credentials. Environment variables are:
 * - Loaded from .env file at module initialization
 * - NEVER cached or stored globally
 * - NEVER exposed in API responses
 * - NEVER logged with actual values
 * - Only used to create transporter instance
 * 
 * All email-related endpoints (/api/debug/email, etc.) are protected by cache
 * middleware to prevent caching of credentials or configuration.
 * 
 * 📧 Cache Protection:
 * - Email cache is automatically cleared on module initialization
 * - Email cache is cleared via /api/admin/cache/clear-email endpoint
 * - Email endpoints are protected by 5-layer cache defense system
 */

import nodemailer from 'nodemailer';
import { clearEmailCache } from '../utils/cache.js';

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
    timeout: 20000, // 20 second timeout (increased for slow SMTP servers)
    connectionTimeout: 20000, // 20 second connection timeout
    logger: false, // Set to true for detailed debug info
    debug: false // Set to true for connection debugging
  });

  // Verify transporter connection asynchronously (non-blocking)
  // Don't wait for it - allow the server to start even if email config fails
  // Use Promise-based approach with timeout to prevent hanging
  Promise.race([
    new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          reject(error);
        } else {
          resolve(success);
        }
      });
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email verification timeout - SMTP server not responding')), 25000)
    )
  ])
    .then(() => {
      console.log('✅ Email service is ready to send messages');
    })
    .catch((error) => {
      console.error('Email configuration error:', error.message);
      console.warn('⚠️  Email service may not work. Check EMAIL_* environment variables.');
      console.warn('📧 Common issues:');
      console.warn('   - SMTP credentials incorrect or expired');
      console.warn('   - Firewall or network blocking SMTP connection');
      console.warn('   - SMTP server timeout (try increasing timeout value)');
      console.warn('   - Gmail: Enable "App Passwords" or "Less secure app access"');
      console.warn('📧 For Gmail users: Use app-specific passwords, not your Gmail password');
      console.warn('📧 Check /api/debug/email endpoint for configuration status');
    });
} else {
  console.warn('⚠️  Email credentials not configured (EMAIL_USER/EMAIL_PASSWORD). Email sending is disabled.');
  console.warn('📧 To enable: Set EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT in .env');
  console.warn('📧 Check /api/debug/email endpoint for configuration status');
  // Create a no-op transporter that won't send emails
  transporter = {
    sendMail: async (options) => {
      console.log('Email would be sent to:', options.to, 'but email is not configured');
      return { messageId: 'mock-id' };
    }
  };
}

// Clear email cache on module initialization to ensure fresh config
// This ensures the latest email configuration is always available
clearEmailCache();

export default transporter;
