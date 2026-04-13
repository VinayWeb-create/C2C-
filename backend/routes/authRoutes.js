import express from 'express';
import {
  register, login, getMe, addBadge,
  becomeProvider,
  updateProfile, changePassword, logout,
  forgotPassword, verifyOTP, resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   protect,     logout);
router.get ('/me',       protect,     getMe);
router.put ('/profile',  protect,     updateProfile);
router.put ('/add-badge', protect,     addBadge);
router.put ('/become-provider', protect, becomeProvider);
router.put ('/change-password', protect, changePassword);

// Password Reset (Public)
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp',      verifyOTP);
router.post('/reset-password',   resetPassword);

export default router;
