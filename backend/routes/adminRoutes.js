import express from 'express';
import { 
  getAdminStats, 
  getAllUsers, 
  getAllProviders, 
  getEarningsReport 
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here are admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/providers', getAllProviders);
router.get('/earnings', getEarningsReport);

export default router;
