import express from 'express';
import {
  getAllComplaintsAdmin,
  updateComplaintStatus,
  getAdminStatistics,
} from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth and admin middleware to all admin endpoints
router.use(protect, requireAdmin);

router.get('/complaints', getAllComplaintsAdmin);
router.put('/complaints/:id/status', updateComplaintStatus);
router.get('/statistics', getAdminStatistics);

export default router;
