import { connectDB } from '../config/database.js';
import { Hospital } from '../models/Hospital.js';

async function checkHospitals() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Checking hospitals in database...');
    const hospitals = await Hospital.find({});
    console.log(`Found ${hospitals.length} hospitals in database`);
    
    if (hospitals.length > 0) {
      console.log('Sample hospital:', hospitals[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking hospitals:', error);
    process.exit(1);
  }
}

checkHospitals(); 