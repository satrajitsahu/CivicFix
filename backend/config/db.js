import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend/.env is loaded
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.error('[MongoDB Atlas Error] MONGODB_URI is not defined in backend/.env');
    console.error('Please configure your MongoDB Atlas connection string in backend/.env');
    process.exit(1);
  }

  if (uri.includes('<username>') || uri.includes('<password>')) {
    console.error('[MongoDB Atlas Error] MONGODB_URI in backend/.env contains placeholder <username> or <password>.');
    console.error('Please replace placeholders with your actual Atlas database credentials.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'civicfix',
    });

    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB Atlas] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Atlas Connection Error] ${error.message}`);
    // Explicitly fail and exit without any silent local fallback
    process.exit(1);
  }
};

export default connectDB;
