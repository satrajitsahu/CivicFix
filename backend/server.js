import dns from 'node:dns';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load backend/.env regardless of invoking directory
dotenv.config({ path: path.join(__dirname, '.env') });
dns.setServers(['8.8.8.8', '1.1.1.1']);

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import User from './models/User.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Connect to MongoDB Atlas (fails loudly if Atlas is not reachable)
const initDB = async () => {
  await connectDB();
  // Ensure default demo admin account exists in Atlas
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@civicfix.local').toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await User.create({
        name: process.env.ADMIN_NAME || 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`[CivicFix Server] Default Admin seeded: ${adminEmail} (password: ${adminPassword})`);
    }
  } catch (err) {
    console.warn('[CivicFix Server] Admin auto-seed skipped:', err.message);
  }
};
initDB();

const app = express();

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    project: 'CivicFix - Smart Civic Complaint Reporting System',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[CivicFix Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
