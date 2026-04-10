import express from 'express';
import {
  getAllProductTypes,
  createProductType,
  updateProductType,
  deleteProductType
} from '../controllers/productTypeController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllProductTypes);

// Admin routes
router.post('/', verifyToken, verifyAdmin, createProductType);
router.put('/:id', verifyToken, verifyAdmin, updateProductType);
router.delete('/:id', verifyToken, verifyAdmin, deleteProductType);

export default router;
