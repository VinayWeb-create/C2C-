import express from 'express';
import {
  createBooking, getMyBookings, getProviderBookings,
  updateBookingStatus, getBookingById,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post  ('/',          protect, authorize('user', 'admin'),     createBooking);
router.get   ('/my',        protect,                                  getMyBookings);
router.get   ('/provider',  protect, authorize('provider', 'admin'), getProviderBookings);
router.get   ('/:id',       protect,                                  getBookingById);
router.put   ('/:id/status',protect,                                  updateBookingStatus);

export default router;
