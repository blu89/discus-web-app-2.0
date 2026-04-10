import express from 'express';

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
