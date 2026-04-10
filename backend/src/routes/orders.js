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

// Admin routes (must come before /:id)
router.get('/', verifyToken, verifyAdmin, getAllOrders);

// User authenticated routes (must come before /:id)
router.get('/user/orders', verifyToken, getUserOrders);

// Public/Specific routes
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.put('/:id/status', verifyToken, verifyAdmin, updateOrderStatus);

export default router;
