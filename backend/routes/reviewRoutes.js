import express from 'express';
import {
  addReview, getServiceReviews, respondToReview, deleteReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post  ('/',                      protect, authorize('user'),   addReview);
router.get   ('/service/:serviceId',             getServiceReviews);
router.put   ('/:id/respond',           protect, authorize('provider', 'admin'), respondToReview);
router.delete('/:id',                   protect, authorize('admin'),  deleteReview);

export default router;
