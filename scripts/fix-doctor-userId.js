const mongoose = require('mongoose');
const { Doctor } = require('../server/models/Doctor');
const { User } = require('../server/models/User');

async function fixDoctorUserIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthaicompanion');
    console.log('Connected to MongoDB');
    
    // Get all doctors
    const doctors = await Doctor.find();
    console.log(`Found ${doctors.length} doctor records`);
    
    // Find the specific doctor by ID
    const specificDoctorId = '683241c8f7be89bf929b0c6f'; // Your doctor ID
    const specificUserId = '683241c8f7be89bf929b0c6d';   // Your user ID
    
    const specificDoctor = await Doctor.findById(specificDoctorId);
    if (specificDoctor) {
      console.log('Found your doctor record:', specificDoctor);
      
      // Update your doctor record with the correct userId
      const result = await Doctor.findByIdAndUpdate(
        specificDoctorId,
        { userId: specificUserId },
        { new: true }
      );
      
      console.log('Updated your doctor record with userId:', result);
      
      // Verify the update
      const verifyDoctor = await Doctor.findOne({ userId: specificUserId });
      if (verifyDoctor) {
        console.log('✅ Success! Doctor can now be found by userId:', verifyDoctor);
      } else {
        console.log('❌ Update failed - doctor still cannot be found by userId');
      }
    } else {
      console.log(`Doctor with ID ${specificDoctorId} not found`);
    }
    
    // Get doctor records missing userId
    const doctorsWithoutUserId = await Doctor.find({ 
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    });
    
    console.log(`Found ${doctorsWithoutUserId.length} doctors without userId`);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

fixDoctorUserIds();
