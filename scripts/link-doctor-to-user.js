require('dotenv').config();
const mongoose = require('mongoose');
const { Doctor } = require('../server/models/Doctor');

async function main() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Doctor and User IDs from the data provided
    const doctorId = '683241c8f7be89bf929b0c6f'; // Kevin's doctor record
    const userId = '683241c8f7be89bf929b0c6d';   // langatemmy6 user account
    
    console.log(`Attempting to link doctor ${doctorId} to user ${userId}`);
    
    // Update the doctor record with the userId
    const result = await Doctor.updateOne(
      { _id: doctorId },
      { $set: { userId: userId } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Successfully linked the doctor profile to the user account!');
    } else {
      console.log('❌ No document was modified. Check that the IDs are correct.');
    }
    
    // Verify the link
    const doctor = await Doctor.findById(doctorId);
    if (doctor && doctor.userId === userId) {
      console.log('✅ Verification successful! Doctor now has the correct userId');
      console.log('Doctor details:');
      console.log(` - Name: ${doctor.name}`);
      console.log(` - Email: ${doctor.email}`);
      console.log(` - Specialization: ${doctor.specialty}`);
      console.log(` - UserId: ${doctor.userId}`);
    } else if (doctor) {
      console.log('❌ Verification failed. Doctor found but userId is:', doctor.userId);
    } else {
      console.log('❌ Verification failed. Could not find doctor with ID:', doctorId);
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
