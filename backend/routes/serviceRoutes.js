import express from 'express';
import {
  getServices, getServiceById, createService,
  updateService, deleteService, getMyServices, getCategories,
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get  ('/',            getServices);
router.get  ('/categories',  getCategories);
router.get  ('/my',          protect, authorize('provider', 'admin'), getMyServices);
router.post ('/',            protect, authorize('provider', 'admin'), createService);
router.get  ('/:id',         getServiceById);
router.put  ('/:id',         protect, authorize('provider', 'admin'), updateService);
router.delete('/:id',        protect, authorize('provider', 'admin'), deleteService);

export default router;
