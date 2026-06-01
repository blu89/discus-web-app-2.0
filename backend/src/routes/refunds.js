import express from 'express';
import {
  submitRefund,
  approveRefund,
  rejectRefund,
  completeRefund,
  getRefundById,
  getAllRefunds,
  getRefundStats
} from '../controllers/refundController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Middleware to verify external API key
const verifyExternalApiKey = (req, res, next) => {
  const apiKey = req.headers['x-refund-api-key'] || req.query.api_key;
  const validApiKey = process.env.EXTERNAL_REFUND_API_KEY;

  if (!validApiKey) {
    console.warn('EXTERNAL_REFUND_API_KEY not configured in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key. Provide x-refund-api-key header or api_key query parameter' });
  }

  if (apiKey !== validApiKey) {
    console.warn('Invalid API key attempt for refund API');
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
};

// External API endpoint (requires API key)
// POST /refunds/submit - Submit a refund from external system
router.post('/submit', verifyExternalApiKey, submitRefund);

// Admin endpoints (require authentication)
// GET /refunds - Get all refunds with optional filters (admin only)
router.get('/', verifyToken, verifyAdmin, getAllRefunds);

// GET /refunds/stats - Get refund statistics (admin only)
router.get('/stats', verifyToken, verifyAdmin, getRefundStats);

// GET /refunds/:id - Get specific refund (admin only)
router.get('/:id', verifyToken, verifyAdmin, getRefundById);

// PUT /refunds/:id/approve - Approve refund (admin only)
router.put('/:id/approve', verifyToken, verifyAdmin, approveRefund);

// PUT /refunds/:id/reject - Reject refund (admin only)
router.put('/:id/reject', verifyToken, verifyAdmin, rejectRefund);

// PUT /refunds/:id/complete - Mark refund as completed (admin only)
router.put('/:id/complete', verifyToken, verifyAdmin, completeRefund);

export default router;
