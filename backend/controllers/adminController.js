import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

// @desc    Get all complaints for administration with filters and search
// @route   GET /api/admin/complaints
// @access  Private (Admin only)
export const getAllComplaintsAdmin = async (req, res, next) => {
  try {
    const { category, status, search, sortBy } = req.query;

    const query = {};

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
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    } else if (sortBy === 'status') {
      sort = { status: 1, createdAt: -1 };
    }

    const complaints = await Complaint.find(query)
      .populate('user', 'name email createdAt')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id/status
// @access  Private (Admin only)
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    complaint.status = status;
    const updated = await complaint.save();

    res.status(200).json({
      success: true,
      message: `Status updated to '${status}' successfully.`,
      complaint: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time system statistics for Admin Dashboard
// @route   GET /api/admin/statistics
// @access  Private (Admin only)
export const getAdminStatistics = async (req, res, next) => {
  try {
    // Counts from MongoDB
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const rejectedComplaints = await Complaint.countDocuments({ status: 'Rejected' });
    const totalCitizens = await User.countDocuments({ role: 'citizen' });

    // Category distribution using Mongoose Aggregation
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent 5 complaints activity
    const recentActivity = await Complaint.find()
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      statistics: {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        rejectedComplaints,
        totalCitizens,
        categoryStats,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
