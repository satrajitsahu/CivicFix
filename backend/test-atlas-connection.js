import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load backend/.env regardless of current working directory
dotenv.config({ path: path.join(__dirname, '.env') });
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function verifyAtlas() {
  console.log('================================================================');
  console.log('            CivicFix: MongoDB Atlas Verification Suite          ');
  console.log('================================================================\n');

  // 1. Verify MONGODB_URI is loaded without exposing credentials
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('FAIL: MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  const isAtlas = uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net');
  console.log(`[1] Environment Check:`);
  console.log(`    - MONGODB_URI loaded: YES`);
  console.log(`    - Points to MongoDB Atlas: ${isAtlas ? 'YES' : 'NO'}`);
  console.log(`    - Length: ${uri.length} chars (Credentials concealed)\n`);

  // 2. Connect to Atlas
  console.log(`[2] Establishing Mongoose connection to MongoDB Atlas...`);
  const conn = await connectDB();
  console.log(`    - Connected to Host: ${conn.connection.host}`);
  console.log(`    - Database Name: ${conn.connection.name}`);
  console.log(`    - ReadyState: ${conn.connection.readyState} (1 = Connected)\n`);

  // 3. Verify Collections & Schemas
  console.log(`[3] Verifying Models against Atlas 'civicfix' database...`);
  
  // Test User Model
  const testEmail = `atlas.test.${Date.now()}@example.com`;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('TestPass@123', salt);

  const testUser = await User.create({
    name: 'Atlas Test Citizen',
    email: testEmail,
    password: hashedPassword,
    role: 'citizen',
  });
  console.log(`    - User Model: Created test citizen successfully (ID: ${testUser._id})`);

  // Verify User was saved in Atlas
  const fetchedUser = await User.findById(testUser._id);
  if (!fetchedUser || fetchedUser.email !== testEmail) {
    throw new Error('User record could not be retrieved from Atlas!');
  }
  console.log(`    - User Model: Retrieved and verified from Atlas.`);

  // Test Complaint Model
  const testComplaint = await Complaint.create({
    title: 'Atlas Verification: Broken streetlights on 5th Avenue',
    description: 'This is an end-to-end automated test record verifying actual storage in Atlas.',
    category: 'Broken Streetlights',
    location: '5th Avenue, Crossroad 2, Ward 9',
    user: testUser._id,
    status: 'Pending',
  });
  console.log(`    - Complaint Model: Created complaint successfully (ID: ${testComplaint._id})`);

  // Verify Complaint was saved in Atlas
  const fetchedComplaint = await Complaint.findById(testComplaint._id).populate('user', 'name email');
  if (!fetchedComplaint || fetchedComplaint.title !== testComplaint.title) {
    throw new Error('Complaint record could not be retrieved from Atlas!');
  }
  console.log(`    - Complaint Model: Retrieved and verified from Atlas with populated user.`);

  // Check actual collections present in the Atlas database
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);
  console.log(`    - Atlas Collections in 'civicfix': [${collectionNames.join(', ')}]\n`);

  // Check total document counts in Atlas
  const totalUsers = await User.countDocuments();
  const totalComplaints = await Complaint.countDocuments();
  console.log(`[4] Atlas Database Statistics:`);
  console.log(`    - Total Users in Atlas: ${totalUsers}`);
  console.log(`    - Total Complaints in Atlas: ${totalComplaints}\n`);

  // 4. Clean up test records (optional, but keep one verified record or clean up test)
  await Complaint.findByIdAndDelete(testComplaint._id);
  await User.findByIdAndDelete(testUser._id);
  console.log(`[5] Cleanup: Temporary test records removed cleanly from Atlas.`);

  console.log('\n================================================================');
  console.log('       RESULT: MONGODB ATLAS IS FULLY CONNECTED & WORKING       ');
  console.log('================================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

verifyAtlas().catch((err) => {
  console.error('\nFAIL: Atlas Verification Error:', err.message);
  process.exit(1);
});
