require('dotenv').config();
const express = require('express');
const { serveStatic } = require('./static.js');
const { startReminderWorker } = require('./workers/reminder-worker.js');
const connectDatabase = require('./config/db.js');
const { MongoStorage } = require('./storage/mongodb.js');
const cors = require('cors');
const session = require('express-session');
const { Hospital } = require('./models/Hospital.js');
const { kenyanHospitals } = require('./data/kenyanHospitals.js');
const { startScheduler } = require('./scheduler.js');
const { MongoClient } = require('mongodb');
const { initializeAuthRoutes } = require('./routes/auth');
const { initializeUserRoutes } = require('./routes/users');
const { initializeDoctorRoutes } = require('./routes/doctors');
const { initializeHospitalRoutes } = require('./routes/hospitals');
const { initializeAppointmentRoutes } = require('./routes/appointments');
const { initializeDoctorDashboardRoutes } = require('./routes/doctor-dashboard');
const { initializeAIRoutes } = require('./routes/ai');
const { initializeNotificationRoutes } = require('./routes/notifications');
const { initializeAdminUtilsRoutes } = require('./routes/admin-utils');
const { initializeTestNotificationsRoutes } = require('./routes/test-notifications');
const NotificationStorage = require('./storage/notifications');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken');

// Verify required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'SESSION_SECRET'
];

// Optional environment variables for Twilio (will disable features if missing)
const optionalEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_NUMBER'
];

const missingRequiredEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingRequiredEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingRequiredEnvVars);
  process.exit(1);
}

const missingOptionalEnvVars = optionalEnvVars.filter(envVar => !process.env[envVar]);
if (missingOptionalEnvVars.length > 0) {
  console.log('Missing optional environment variables:', missingOptionalEnvVars);
}

const app = express();
const port = process.env.PORT || 3000;

// Set up basic CORS middleware for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  try {
    // Wait for database connection
    await connectDatabase();
    
    // Initialize storage with mongoose connection
    const storage = new MongoStorage();
    const notificationStorage = new NotificationStorage(mongoose.connection.db);

    // Configure session after storage is initialized
    app.use(session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      }
    }));
    
    // Initialize routes
    app.use('/api/auth', initializeAuthRoutes(storage));
    app.use('/api/users', initializeUserRoutes(storage));
    app.use('/api/doctors', initializeDoctorRoutes(storage));
    app.use('/api/hospitals', initializeHospitalRoutes(storage));
    app.use('/api/appointments', initializeAppointmentRoutes(storage));
    app.use('/api/doctor-dashboard', initializeDoctorDashboardRoutes(storage));
    app.use('/api/ai', initializeAIRoutes(storage));
    app.use('/api/notifications', initializeNotificationRoutes(notificationStorage));
    app.use('/api/admin-utils', initializeAdminUtilsRoutes());
    app.use('/api/test', initializeTestNotificationsRoutes()); // Testing route for WhatsApp notifications

    await seedDatabase();

    // Request logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse = undefined;
      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };
      res.on('finish', () => {
        const duration = Date.now() - start;
        if (path.startsWith('/api')) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }
          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + '…';
          }
          console.log(logLine);
        }
      });
      next();
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      startReminderWorker(storage);
      if (process.env.NODE_ENV === 'production') {
        serveStatic(app);
      }
      startScheduler();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

async function seedDatabase() {
  try {
    const hospitalCount = await Hospital.countDocuments();
    if (hospitalCount === 0) {
      console.log('Seeding hospitals...');
      const hospitals = kenyanHospitals.map(hospital => ({
        name: hospital.name,
        address: hospital.address,
        latitude: hospital.coordinates.latitude,
        longitude: hospital.coordinates.longitude,
        phone: hospital.contact.phone,
        email: hospital.contact.email,
        website: hospital.contact.website,
        openHours: '24/7',
        specialties: hospital.facilities,
        rating: 4.5,
        county: hospital.county,
        subCounty: hospital.subCounty,
        isVerified: hospital.isVerified,
        facilities: hospital.facilities,
        emergencyServices: hospital.emergencyServices,
        insuranceAccepted: hospital.insuranceAccepted
      }));
      await Hospital.insertMany(hospitals);
      console.log(`Successfully seeded ${hospitals.length} hospitals`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
} 