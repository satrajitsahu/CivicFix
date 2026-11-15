import Complaint from '../models/Complaint.js';

// Helper to escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Common civic address stop words that should not trigger duplicate alerts on their own
const STOP_WORDS = new Set([
  'road', 'rd', 'street', 'st', 'lane', 'avenue', 'ave', 'cross', 'main',
  'near', 'opp', 'opposite', 'behind', 'beside', 'front', 'next', 'by',
  'ward', 'city', 'area', 'block', 'sector', 'phase', 'colony', 'nagar',
  'the', 'and', 'at', 'in', 'on', 'to', 'for', 'of', 'with'
]);

// Helper function to find similar complaints by category and location
const findDuplicateComplaint = async (category, location) => {
  if (!category || !location) return null;

  const trimmedLoc = location.trim();
  if (!trimmedLoc) return null;

  // 1. Direct or case-insensitive exact / substring match
  const escapedExact = escapeRegex(trimmedLoc);
  const directMatch = await Complaint.findOne({
    category,
    location: { $regex: new RegExp(escapedExact, 'i') },
    status: { $in: ['Pending', 'In Progress'] },
  });

  if (directMatch) return directMatch;

  // 2. Extract clean significant tokens (words >= 2 chars, excluding generic stop words)
  const tokens = trimmedLoc
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  if (tokens.length === 0) {
    // If only generic words exist (e.g. "Main Road"), match exact full string case-insensitively
    return await Complaint.findOne({
      category,
      location: { $regex: new RegExp(`^${escapedExact}$`, 'i') },
      status: { $in: ['Pending', 'In Progress'] },
    });
  }

  // 3. Search for existing complaints with same category and pending/in-progress status
  // matching any of the significant location tokens
  const escapedTokens = tokens.map(escapeRegex);
  const regexPattern = escapedTokens.join('|');

  return await Complaint.findOne({
    category,
    location: { $regex: new RegExp(regexPattern, 'i') },
    status: { $in: ['Pending', 'In Progress'] },
  });
};

// @desc    Check for potential duplicate complaints in the same area
// @route   GET /api/complaints/check-duplicate
// @access  Private (Citizen)
export const checkDuplicateComplaint = async (req, res, next) => {
  try {
    const { category, location } = req.query;

    if (!category || !location) {
      return res.status(200).json({ isDuplicate: false });
    }

    const existing = await findDuplicateComplaint(category, location);

    if (existing) {
      return res.status(200).json({
        isDuplicate: true,
        message:
          'A similar complaint may already exist in this area. Please check existing complaints before submitting.',
        existingComplaint: {
          _id: existing._id,
          title: existing.title,
          category: existing.category,
          location: existing.location,
          status: existing.status,
          createdAt: existing.createdAt,
        },
      });
    }

    return res.status(200).json({ isDuplicate: false });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, allowDuplicate } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, and location.',
      });
    }

    // Community Duplicate Alert check
    if (allowDuplicate !== 'true' && allowDuplicate !== true) {
      const duplicate = await findDuplicateComplaint(category, location);
      if (duplicate) {
        return res.status(409).json({
          success: false,
          isDuplicateWarning: true,
          message:
            'A similar complaint may already exist in this area. Please check existing complaints before submitting.',
          existingComplaint: {
            _id: duplicate._id,
            title: duplicate.title,
            category: duplicate.category,
            location: duplicate.location,
            status: duplicate.status,
          },
        });
      }
    }

    // Handle optional uploaded image
    let imagePath = '';
    if (req.file) {
      // Normalize path to forward slashes for cross-platform web serving
      imagePath = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create({
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      image: imagePath,
      user: req.user._id,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints submitted by the logged-in citizen
// @route   GET /api/complaints
// @access  Private (Citizen)
export const getMyComplaints = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;

    const query = { user: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    // Compute live user stats
    const total = await Complaint.countDocuments({ user: req.user._id });
    const pending = await Complaint.countDocuments({ user: req.user._id, status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ user: req.user._id, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ user: req.user._id, status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ user: req.user._id, status: 'Rejected' });

    res.status(200).json({
      success: true,
      count: complaints.length,
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        rejected,
      },
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint details
// @route   GET /api/complaints/:id
// @access  Private (Citizen / Admin)
export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Role check: Citizen can only view their own complaint unless they are admin
    if (
      req.user.role !== 'admin' &&
      complaint.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this complaint.',
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint details (Citizen can only update when status is Pending)
// @route   PUT /api/complaints/:id
// @access  Private (Citizen)
export const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Check ownership
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own complaints.',
      });
    }

    // Citizen can only edit if status is still Pending
    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Complaints with status '${complaint.status}' cannot be edited.`,
      });
    }

    const { title, description, category, location } = req.body;

    if (title) complaint.title = title.trim();
    if (description) complaint.description = description.trim();
    if (category) complaint.category = category;
    if (location) complaint.location = location.trim();

    if (req.file) {
      complaint.image = `/uploads/${req.file.filename}`;
    }

    const updatedComplaint = await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (Citizen: only when status is Pending)
// @route   DELETE /api/complaints/:id
// @access  Private (Citizen / Admin)
export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // If Admin, can delete any inappropriate/duplicate complaint
    if (req.user.role === 'admin') {
      await Complaint.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Complaint deleted by administrator.',
      });
    }

    // Citizen check
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own complaints.',
      });
    }

    // Rule: Delete their own complaints only when status is Pending
    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete complaint. Only complaints with 'Pending' status can be deleted (Current status: ${complaint.status}).`,
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public recent complaints (for Home page civic showcase)
// @route   GET /api/complaints/public
// @access  Public
export const getPublicComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title category location status createdAt image');

    // Aggregate overall community resolution stats
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const pending = await Complaint.countDocuments({ status: 'Pending' });

    res.status(200).json({
      success: true,
      stats: { total, resolved, inProgress, pending },
      complaints,
    });
  } catch (error) {
    next(error);
  }
};
