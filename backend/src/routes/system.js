import express from 'express';
import supabase from '../config/supabase.js';

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
