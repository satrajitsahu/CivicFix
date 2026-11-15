import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.error('Error: Please configure MONGODB_URI in backend/.env before running the admin seeder.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: 'civicfix' });
    console.log('[Seed] Connected to MongoDB Atlas.');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@civicfix.local').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Admin user already exists with email: ${adminEmail}`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('----------------------------------------------------');
    console.log('[Seed] Administrator account created successfully!');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('Role:     admin');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
