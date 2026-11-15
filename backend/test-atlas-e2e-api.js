import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dns.setServers(['8.8.8.8', '1.1.1.1']);

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';

async function runEndToEndAtlasTest() {
  console.log('================================================================');
  console.log('     CivicFix: End-to-End MongoDB Atlas REST API Verification   ');
  console.log('================================================================\n');

  // 1. Connect directly to Atlas
  await connectDB();
  console.log('[Atlas] Connected successfully to:', mongoose.connection.host);

  // 2. Start Express on test port 5088
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/admin', adminRoutes);
  app.use(notFound);
  app.use(errorHandler);

  const PORT = 5088;
  const server = app.listen(PORT);
  const BASE_URL = `http://127.0.0.1:${PORT}/api`;

  try {
    const timestamp = Date.now();
    const citizenEmail = `citizen.atlas.${timestamp}@example.com`;
    const citizenPassword = 'Password@123';
    const citizenName = `Atlas Citizen ${timestamp % 1000}`;

    // -------------------------------------------------------------
    // STEP 1: Registration Test via POST /api/auth/register
    // -------------------------------------------------------------
    console.log('\n[Step 1] Testing Citizen Registration via REST API...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: citizenName,
        email: citizenEmail,
        password: citizenPassword,
      }),
    });
    const regData = await regRes.json();
    console.log(`    - HTTP Status: ${regRes.status}`);
    console.log(`    - Response: ${regData.message}`);
    if (regRes.status !== 201 || !regData.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }

    // Direct Atlas check for user
    const directUser = await User.findOne({ email: citizenEmail });
    if (!directUser) {
      throw new Error('Verification failed: User record was not found in MongoDB Atlas!');
    }
    console.log(`    - Atlas Storage Verified: User record stored in Atlas with ID: ${directUser._id}`);

    // -------------------------------------------------------------
    // STEP 2: Login Test via POST /api/auth/login
    // -------------------------------------------------------------
    console.log('\n[Step 2] Testing Citizen Login via REST API...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: citizenEmail,
        password: citizenPassword,
      }),
    });
    const loginData = await loginRes.json();
    console.log(`    - HTTP Status: ${loginRes.status}`);
    console.log(`    - Token Issued: ${Boolean(loginData.token)}`);
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    const token = loginData.token;

    // -------------------------------------------------------------
    // STEP 3: Complaint Submission via POST /api/complaints
    // -------------------------------------------------------------
    console.log('\n[Step 3] Testing Complaint Submission via REST API...');
    const complaintPayload = {
      title: `Atlas Verified: Clogged Storm Drain #${timestamp % 1000}`,
      description: 'Heavy water stagnation near residential entrance, needs desilting.',
      category: 'Drainage Problems',
      location: `Ward 14, 2nd Main Road, Sector ${timestamp % 10}`,
    };

    const submitRes = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(complaintPayload),
    });
    const submitData = await submitRes.json();
    console.log(`    - HTTP Status: ${submitRes.status}`);
    console.log(`    - Response: ${submitData.message}`);
    if (submitRes.status !== 201 || !submitData.complaint?._id) {
      throw new Error(`Submission failed: ${JSON.stringify(submitData)}`);
    }
    const complaintId = submitData.complaint._id;

    // Direct Atlas check for complaint
    const directComplaint = await Complaint.findById(complaintId);
    if (!directComplaint) {
      throw new Error('Verification failed: Complaint was not found in MongoDB Atlas!');
    }
    console.log(`    - Atlas Storage Verified: Complaint stored in Atlas with ID: ${directComplaint._id}`);
    console.log(`    - Complaint Category: "${directComplaint.category}" | Status: "${directComplaint.status}"`);

    // -------------------------------------------------------------
    // STEP 4: Complaint Retrieval via GET /api/complaints
    // -------------------------------------------------------------
    console.log('\n[Step 4] Testing Citizen Complaints Retrieval via REST API...');
    const getRes = await fetch(`${BASE_URL}/complaints`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const getData = await getRes.json();
    console.log(`    - HTTP Status: ${getRes.status}`);
    console.log(`    - Complaints Returned: ${getData.count}`);
    console.log(`    - Stats: ${JSON.stringify(getData.stats)}`);
    if (getRes.status !== 200 || getData.count < 1) {
      throw new Error(`Retrieval failed: ${JSON.stringify(getData)}`);
    }

    // -------------------------------------------------------------
    // STEP 5: Single Complaint Inspection via GET /api/complaints/:id
    // -------------------------------------------------------------
    console.log('\n[Step 5] Testing Single Complaint Details via REST API...');
    const detailRes = await fetch(`${BASE_URL}/complaints/${complaintId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const detailData = await detailRes.json();
    console.log(`    - HTTP Status: ${detailRes.status}`);
    console.log(`    - Complaint Title: "${detailData.complaint?.title}"`);
    console.log(`    - Reporter Populated: "${detailData.complaint?.user?.name}" (${detailData.complaint?.user?.email})`);
    if (detailRes.status !== 200 || !detailData.complaint) {
      throw new Error(`Single retrieval failed: ${JSON.stringify(detailData)}`);
    }

    // -------------------------------------------------------------
    // STEP 6: Verify Persistence in MongoDB Atlas
    // -------------------------------------------------------------
    console.log('\n[Step 6] Final Database Audit in Atlas:');
    const atlasUserCount = await User.countDocuments();
    const atlasComplaintCount = await Complaint.countDocuments();
    console.log(`    - Total Registered Users in Atlas: ${atlasUserCount}`);
    console.log(`    - Total Complaints in Atlas: ${atlasComplaintCount}`);

    console.log('\n================================================================');
    console.log('       ALL END-TO-END REST API TESTS PASSED IN ATLAS            ');
    console.log('================================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runEndToEndAtlasTest().catch((err) => {
  console.error('\nE2E Atlas Test Failed:', err);
  process.exit(1);
});
