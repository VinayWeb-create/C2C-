import express from 'express';
import { chat, getRecommendations, trending } from '../controllers/aiController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/chat',            aiLimiter, protect,       chat);
router.get ('/recommendations', aiLimiter, protect,       getRecommendations);
router.get ('/trending',                   optionalAuth,  trending);

export default router;
