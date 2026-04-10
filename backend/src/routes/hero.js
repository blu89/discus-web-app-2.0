import express from 'express';
import {
  getAllHero,
  createHero,
  updateHero,
  deleteHero
} from '../controllers/heroController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllHero);

// Admin routes
router.post('/', verifyToken, verifyAdmin, createHero);
router.put('/:id', verifyToken, verifyAdmin, updateHero);
router.delete('/:id', verifyToken, verifyAdmin, deleteHero);

export default router;
