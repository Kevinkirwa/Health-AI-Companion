require('dotenv').config();
const mongoose = require('mongoose');
const { Doctor } = require('../server/models/Doctor');
const { User } = require('../server/models/User');

async function main() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all doctors
    const doctors = await Doctor.find().lean();
    console.log(`Found ${doctors.length} doctors in the database`);

    // Print detailed information about each doctor
    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      console.log(`\nDoctor #${i + 1}:`);
      console.log(`  ID: ${doctor._id}`);
      console.log(`  userId: ${doctor.userId || 'NOT SET'}`);
      console.log(`  Name: ${doctor.name || 'Not provided'}`);
      console.log(`  Specialization: ${doctor.specialization || 'Not provided'}`);
      console.log(`  Hospital ID: ${doctor.hospitalId || 'Not provided'}`);
      console.log(`  License: ${doctor.licenseNumber || 'Not provided'}`);
      console.log(`  Phone: ${doctor.phone || 'Not provided'}`);
    }

    // Get the specific user
    const userId = '683241c8f7be89bf929b0c6d';
    const user = await User.findById(userId).lean();
    if (user) {
      console.log(`\nFound user with ID ${userId}:`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
    } else {
      console.log(`\nNo user found with ID ${userId}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

main();
