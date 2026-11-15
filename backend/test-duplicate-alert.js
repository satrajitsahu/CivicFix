import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import Complaint from './models/Complaint.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDuplicateAlertVerification() {
  console.log('================================================================');
  console.log('   CivicFix: End-to-End Community Duplicate Alert Verification  ');
  console.log('================================================================\n');

  let mongod;
  let server;
  const PORT = 5099;
  const BASE_URL = `http://127.0.0.1:${PORT}/api`;

  try {
    // 1. Setup in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, { dbName: 'civicfix_test' });
    console.log('[Setup] Connected to test database successfully.');

    // 2. Setup Express test app instance
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const uploadsDir = path.join(__dirname, 'uploads');
    app.use('/uploads', express.static(uploadsDir));

    app.use('/api/auth', authRoutes);
    app.use('/api/complaints', complaintRoutes);
    app.use('/api/admin', adminRoutes);
    app.use(notFound);
    app.use(errorHandler);

    await new Promise((resolve) => {
      server = app.listen(PORT, resolve);
    });
    console.log(`[Setup] Test Express API server listening on port ${PORT}.\n`);

    // 3. Register citizen user and get JWT
    console.log('[Setup] Registering test citizen...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Sharma',
        email: 'aarav.citizen@example.com',
        password: 'Password@123',
      }),
    });
    const regData = await registerRes.json();
    if (!regData.success || !regData.token) {
      throw new Error(`Citizen registration failed: ${JSON.stringify(regData)}`);
    }
    const token = regData.token;
    console.log('  Citizen registered with token.');

    // Also create admin for testing status updates
    const adminUser = await User.create({
      name: 'Test Administrator',
      email: 'admin.test@example.com',
      password: 'hashed_admin_pass',
      role: 'admin',
    });

    const testResults = [];

    // -------------------------------------------------------------
    // TEST 1: Submit a complaint with a category and location
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Submit Initial Complaint ---');
    const complaint1Payload = {
      title: 'Deep pothole causing accidents near Metro Pillar 140',
      description: 'Massive pothole on the main carriageway. Two two-wheelers skidded yesterday.',
      category: 'Roads & Potholes',
      location: 'MG Road, Metro Pillar 140',
    };

    const res1 = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(complaint1Payload),
    });

    const data1 = await res1.json();
    const test1Passed =
      res1.status === 201 &&
      data1.success === true &&
      data1.complaint?.status === 'Pending' &&
      data1.complaint?.location === complaint1Payload.location;

    console.log(`Status: ${res1.status}`);
    console.log(`Response:`, data1.message || data1);
    testResults.push({
      test: '1. Submit complaint with category and location',
      passed: test1Passed,
      detail: `Created ID: ${data1.complaint?._id}, Status: ${data1.complaint?.status}`,
    });

    const initialComplaintId = data1.complaint?._id;

    // -------------------------------------------------------------
    // TEST 2 & 3: Submit another complaint with same category & similar location
    // Verify duplicate warning appears
    // -------------------------------------------------------------
    console.log('\n--- TEST 2 & 3: Duplicate Warning on Similar Location & Category ---');
    const complaint2SimilarPayload = {
      title: 'Large crater near pillar 140 on MG Road',
      description: 'Pothole getting bigger due to recent rain, dangerous for pedestrians.',
      category: 'Roads & Potholes',
      location: 'Near Metro Pillar 140, MG Road', // Similar location
    };

    // First test pre-submission check endpoint: GET /api/complaints/check-duplicate
    const checkParams = new URLSearchParams({
      category: complaint2SimilarPayload.category,
      location: complaint2SimilarPayload.location,
    });
    const checkRes = await fetch(`${BASE_URL}/complaints/check-duplicate?${checkParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const checkData = await checkRes.json();
    console.log(`GET /api/complaints/check-duplicate status: ${checkRes.status}`);
    console.log(`Check result: isDuplicate=${checkData.isDuplicate}, message="${checkData.message}"`);

    const warningFound =
      checkData.isDuplicate === true &&
      checkData.existingComplaint?._id === initialComplaintId &&
      typeof checkData.message === 'string' &&
      checkData.message.includes('similar complaint may already exist');

    testResults.push({
      test: '2 & 3. Duplicate warning appears for similar location & category',
      passed: warningFound,
      detail: `Flagged duplicate of complaint ID ${checkData.existingComplaint?._id} with message: "${checkData.message}"`,
    });

    // -------------------------------------------------------------
    // TEST 4: Verify submission is BLOCKED until confirmation is checked
    // Direct submission without allowDuplicate=true should return HTTP 409
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Verify Submission is Blocked Without Confirmation ---');
    const resBlocked = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(complaint2SimilarPayload),
    });
    const dataBlocked = await resBlocked.json();
    console.log(`POST /api/complaints status: ${resBlocked.status}`);
    console.log(`Response:`, dataBlocked);

    const countBeforeConfirm = await Complaint.countDocuments({ category: 'Roads & Potholes' });
    const blockedPassed =
      resBlocked.status === 409 &&
      dataBlocked.isDuplicateWarning === true &&
      dataBlocked.existingComplaint?._id === initialComplaintId &&
      countBeforeConfirm === 1; // Still only 1 complaint in database

    testResults.push({
      test: '4. Submission is blocked until confirmation is checked (HTTP 409)',
      passed: blockedPassed,
      detail: `Blocked with 409 Conflict. Database count remained ${countBeforeConfirm}.`,
    });

    // -------------------------------------------------------------
    // TEST 5: Verify checking confirmation allows submission
    // Submission with allowDuplicate=true should succeed (HTTP 201)
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Verify Confirmation Allows Submission ---');
    const resAllowed = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...complaint2SimilarPayload,
        allowDuplicate: true, // Citizen confirmed: submit anyway
      }),
    });
    const dataAllowed = await resAllowed.json();
    console.log(`POST /api/complaints (allowDuplicate=true) status: ${resAllowed.status}`);
    console.log(`Response:`, dataAllowed.message || dataAllowed);

    const countAfterConfirm = await Complaint.countDocuments({ category: 'Roads & Potholes' });
    const allowPassed =
      resAllowed.status === 201 &&
      dataAllowed.success === true &&
      dataAllowed.complaint?.title === complaint2SimilarPayload.title &&
      countAfterConfirm === 2;

    testResults.push({
      test: '5. Checking confirmation allows submission (allowDuplicate=true)',
      passed: allowPassed,
      detail: `Complaint created with ID: ${dataAllowed.complaint?._id}. Database count is now ${countAfterConfirm}.`,
    });

    // -------------------------------------------------------------
    // TEST 6: Verify that resolved complaints are ignored
    // Update initial complaint to 'Resolved', then test duplicate check
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Verify Resolved Complaints are Ignored ---');
    // Set initial complaint to Resolved
    await Complaint.findByIdAndUpdate(initialComplaintId, { status: 'Resolved' });
    // Also remove or resolve the second one so only Resolved exists
    await Complaint.findByIdAndUpdate(dataAllowed.complaint._id, { status: 'Resolved' });

    const checkResolvedParams = new URLSearchParams({
      category: 'Roads & Potholes',
      location: 'MG Road, Metro Pillar 140',
    });

    const resResolvedCheck = await fetch(
      `${BASE_URL}/complaints/check-duplicate?${checkResolvedParams}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const dataResolvedCheck = await resResolvedCheck.json();
    console.log(`Check result after resolving existing complaints:`, dataResolvedCheck);

    // Direct submit without allowDuplicate should now be accepted because previous issues are resolved
    const newAfterResolvedPayload = {
      title: 'New fresh pothole at MG Road Pillar 140 after repair',
      description: 'The repaired road has sunk again after heavy rain.',
      category: 'Roads & Potholes',
      location: 'MG Road, Metro Pillar 140',
    };

    const resSubmitAfterResolved = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newAfterResolvedPayload), // no allowDuplicate
    });
    const dataSubmitAfterResolved = await resSubmitAfterResolved.json();
    console.log(`Submit after resolved status: ${resSubmitAfterResolved.status}`);

    const resolvedIgnoredPassed =
      dataResolvedCheck.isDuplicate === false &&
      resSubmitAfterResolved.status === 201 &&
      dataSubmitAfterResolved.success === true;

    testResults.push({
      test: '6. Resolved complaints are ignored',
      passed: resolvedIgnoredPassed,
      detail: `isDuplicate returned false; New report accepted with HTTP 201.`,
    });

    // -------------------------------------------------------------
    // TEST 7: Verify backend validation cannot be bypassed by direct API calls
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Verify Backend Validation Cannot be Bypassed ---');
    // Now there is a Pending complaint at 'MG Road, Metro Pillar 140' from step 6.
    // Try to bypass via direct raw fetch without allowDuplicate flag
    const directBypassAttempt = {
      title: 'Sneaky duplicate attempt without flag',
      description: 'Trying to bypass duplicate check via curl/fetch directly',
      category: 'Roads & Potholes',
      location: 'MG Road, Metro Pillar 140',
      allowDuplicate: false, // Explicit false
    };

    const bypassRes = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(directBypassAttempt),
    });
    const bypassData = await bypassRes.json();
    console.log(`Bypass attempt HTTP status: ${bypassRes.status}`);
    console.log(`Bypass response:`, bypassData);

    const bypassPrevented =
      bypassRes.status === 409 &&
      bypassData.isDuplicateWarning === true &&
      bypassData.success === false;

    testResults.push({
      test: '7. Backend validation cannot be bypassed by directly calling API',
      passed: bypassPrevented,
      detail: `Direct API call rejected with HTTP 409 Conflict (isDuplicateWarning: true).`,
    });

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('                      TEST RESULTS SUMMARY                      ');
    console.log('================================================================');
    let allPassed = true;
    for (const r of testResults) {
      const mark = r.passed ? '✓ PASSED' : '✗ FAILED';
      if (!r.passed) allPassed = false;
      console.log(`${mark} : ${r.test}`);
      console.log(`         Detail: ${r.detail}`);
    }
    console.log('================================================================');
    console.log(`FINAL OUTCOME: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    console.log('================================================================\n');

    return { allPassed, testResults };
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }
}

runDuplicateAlertVerification()
  .then(({ allPassed }) => {
    process.exit(allPassed ? 0 : 1);
  })
  .catch((err) => {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  });
