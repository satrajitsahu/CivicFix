import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  checkDuplicateComplaint,
  getPublicComplaints,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public route for landing page showcase
router.get('/public', getPublicComplaints);

// Protected routes for citizen
router.get('/check-duplicate', protect, checkDuplicateComplaint);
router.post('/', protect, upload.single('image'), createComplaint);
router.get('/', protect, getMyComplaints);
router.get('/:id', protect, getComplaintById);
router.put('/:id', protect, upload.single('image'), updateComplaint);
router.delete('/:id', protect, deleteComplaint);

export default router;
