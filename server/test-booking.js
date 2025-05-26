// Simple test script to create an appointment directly
// Run with: node test-booking.js

require('dotenv').config();
const { MongoStorage } = require('./storage/mongodb.js');
const { ObjectId } = require('mongodb');

async function createTestAppointment() {
  try {
    console.log('🚀 Starting test appointment creation');
    
    // Initialize MongoDB connection
    const storage = new MongoStorage();
    await storage.ensureConnection();
    console.log('✅ Connected to MongoDB');

    // Get a doctor ID and a hospital ID from the database
    const doctors = await storage.getDoctors();
    if (!doctors || doctors.length === 0) {
      throw new Error('No doctors found in database');
    }
    
    const hospitals = await storage.getAllHospitals();
    if (!hospitals || hospitals.length === 0) {
      throw new Error('No hospitals found in database');
    }
    
    // Get or create a test patient
    let testPatient = await storage.User.findOne({ email: 'testpatient@example.com' });
    if (!testPatient) {
      console.log('Creating test patient...');
      testPatient = await storage.createUser({
        email: 'testpatient@example.com',
        password: 'password123',
        name: 'Test Patient',
        role: 'patient'
      });
      console.log('Test patient created with ID:', testPatient._id);
    } else {
      console.log('Using existing test patient with ID:', testPatient._id);
    }
    
    const doctor = doctors[0];
    const hospital = hospitals[0];
    
    console.log(`Using doctor: ${doctor.name || doctor._id}`);
    console.log(`Using hospital: ${hospital.name || hospital._id}`);
    
    // Create a test appointment
    const appointmentData = {
      userId: testPatient._id,
      doctorId: doctor._id,
      hospitalId: hospital._id,
      date: new Date(), // Today
      time: '14:00',
      status: 'pending',
      type: 'consultation',
      reason: 'Test appointment for WhatsApp notification',
      notes: 'This is a test appointment created via script',
      phoneNumber: process.env.TEST_PHONE_NUMBER || '+254712345678', // Replace with your actual phone for testing
      reminderPreferences: {
        sms: true,
        whatsapp: true,
        email: true,
        intervals: [24, 1]
      }
    };
    
    console.log('Creating appointment with data:', JSON.stringify(appointmentData, null, 2));
    
    const appointment = await storage.createAppointment(appointmentData);
    console.log('✅ Test appointment created successfully:', appointment);
    
    // Update the appointment status to trigger notifications
    if (appointment._id) {
      const updatedAppointment = await storage.updateAppointment(
        appointment._id.toString(),
        { status: 'confirmed' }
      );
      
      console.log('✅ Appointment confirmed:', updatedAppointment);
      console.log('Check server logs for WhatsApp notification details');
    }
    
    console.log('Test completed! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in test script:', error);
    process.exit(1);
  }
}

createTestAppointment();
