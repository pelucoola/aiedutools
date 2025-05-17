import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  updatePassword,
  getUserStats
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 公开路由
router.post('/register', registerUser);
router.post('/login', loginUser);

// 受保护路由
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updatePassword);
router.get('/stats', protect, getUserStats);

export default router;