import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /orders - Create order (public)
router.post('/', createOrder);

// GET /orders/user/orders - Get user's own orders (authenticated)
router.get('/user/orders', verifyToken, getUserOrders);

// Admin routes (must come before /:id)
// GET /orders - Get all orders (admin only)
router.get('/', verifyToken, verifyAdmin, getAllOrders);

// Specific routes (must come after named routes)
router.get('/:id', getOrderById);
router.put('/:id/status', verifyToken, verifyAdmin, updateOrderStatus);

export default router;
