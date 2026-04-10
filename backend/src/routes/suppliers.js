import express from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);

// Admin routes
router.post('/', verifyToken, verifyAdmin, createSupplier);
router.put('/:id', verifyToken, verifyAdmin, updateSupplier);
router.delete('/:id', verifyToken, verifyAdmin, deleteSupplier);

export default router;
