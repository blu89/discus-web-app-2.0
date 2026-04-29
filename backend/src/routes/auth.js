import express from 'express';
import { registerUser, loginUser, registerAdmin, loginAdmin, logout, verifyAuth } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);
router.post('/logout', logout);
router.get('/verify', verifyAuth);

export default router;
