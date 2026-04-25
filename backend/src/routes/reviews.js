import express from 'express';
import {
  getAllReviews,
  getReviewsByProduct,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  getStoreReviews
} from '../controllers/reviewController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/store', getStoreReviews);
router.get('/product/:productId', getReviewsByProduct);
router.get('/user/:userId', getUserReviews);

// User routes
router.post('/', verifyToken, createReview);

// Admin routes
router.get('/', verifyToken, verifyAdmin, getAllReviews);
router.put('/:reviewId', verifyToken, verifyAdmin, updateReview);
router.delete('/:reviewId', verifyToken, verifyAdmin, deleteReview);

export default router;
