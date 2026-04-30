import express from 'express';
import supabase from '../config/supabase.js';
import cache from '../utils/cache.js';
import transporter from '../config/email.js';

const router = express.Router();

export const systemRoutes = (app) => {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API version
  app.get('/api/version', (req, res) => {
    res.json({ version: '1.0.0', api: 'ecommerce-api' });
  });

  // Debug endpoint - check email configuration status
  // NEVER CACHED - Used to diagnose email connectivity issues
  app.get('/api/debug/email', (req, res) => {
    const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    const hasTransporter = !!transporter;
    const isNoOpTransporter = transporter?.sendMail?.toString().includes('would be sent');
    
    res.json({
      status: 'Email configuration check',
      configured: emailConfigured,
      hasTransporter,
      isNoOpTransporter,
      settings: {
        email_user_set: !!process.env.EMAIL_USER,
        email_password_set: !!process.env.EMAIL_PASSWORD,
        email_host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        email_port: process.env.EMAIL_PORT || 587,
        email_secure: process.env.EMAIL_SECURE === 'true' ? 'true' : 'false',
        admin_email_set: !!process.env.ADMIN_EMAIL
      },
      warnings: [],
      recommendations: emailConfigured ? [] : [
        'Set EMAIL_USER environment variable',
        'Set EMAIL_PASSWORD environment variable',
        'Set EMAIL_HOST (default: smtp.gmail.com)',
        'Set EMAIL_PORT (default: 587)',
        'Set ADMIN_EMAIL for notifications',
        'For Gmail: Enable "Less secure app access" or use App Passwords'
      ]
    });
  });

  // Debug endpoint - check database
  app.get('/api/debug/db', async (req, res) => {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(5);

      const { data: count, error: countError } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });

      res.json({
        status: 'Database check',
        ordersCount: count?.length || 0,
        sampleOrders: orders || [],
        errors: {
          ordersError,
          countError
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Debug endpoint - check IP addresses of orders
  app.get('/api/debug/orders-ip', async (req, res) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, ip_address, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({
        status: 'Orders with IP addresses',
        total: orders?.length || 0,
        orders: orders || [],
        note: 'IP addresses help track customer locations and detect fraud'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cache control endpoint - for debugging
  app.post('/api/debug/clear-cache', (req, res) => {
    try {
      // Clear backend cache
      cache.flushAll();
      
      res.json({
        status: 'Cache cleared',
        message: 'Backend cache has been cleared. Client-side caches will update on next reload.',
        note: 'Frontend Service Worker caches are cleared automatically on version update'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      path: req.path,
      method: req.method 
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ 
      error: err.message || 'Internal server error',
      status: err.status || 500
    });
  });
};

export default router;
