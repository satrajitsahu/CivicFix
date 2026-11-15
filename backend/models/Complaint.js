import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a complaint category'],
      enum: [
        'Roads & Potholes',
        'Garbage Accumulation',
        'Broken Streetlights',
        'Water Leakage',
        'Drainage Problems',
        'Other Civic Issues',
      ],
    },
    location: {
      type: String,
      required: [true, 'Location details are required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for duplicate check optimization
complaintSchema.index({ category: 1, location: 'text' });

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
