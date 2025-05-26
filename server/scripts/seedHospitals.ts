import { connectDB } from '../config/database.js';
import { Hospital } from '../models/Hospital.js';
import { kenyanHospitals } from '../data/kenyanHospitals.js';

async function seedHospitals() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Clearing existing hospitals...');
    await Hospital.deleteMany({});
    
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
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding hospitals:', error);
    process.exit(1);
  }
}

seedHospitals(); 