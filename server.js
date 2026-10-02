import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'UNLOAD Server is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root Route
app.get('/', (req, res) => {
  res.send('UNLOAD API Server - Digital Guardian & Screen Addiction Prevention');
});

// MongoDB Connection Setup (Non-blocking so server starts even before DB is active)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unload_db';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(' Successfully connected to MongoDB database.');
  })
  .catch((err) => {
    console.warn(' MongoDB connection notice: Could not connect to MongoDB at', MONGODB_URI);
    console.warn('   (The server is running fine. Connect MongoDB when you are ready to use database features.)');
  });

// Start Server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(` UNLOAD Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`===========================================`);
});
