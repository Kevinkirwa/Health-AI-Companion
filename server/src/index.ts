import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDatabase from '../config/db.js';
import { MongoStorage } from '../storage/mongodb.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database and initialize storage
const startServer = async () => {
  try {
    // Wait for database connection
    await connectDatabase();
    
    // Initialize storage with mongoose connection
    const storage = new MongoStorage();

    // Basic route
    app.get('/', (req, res) => {
      res.json({ message: 'Health AI Companion API is running' });
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 