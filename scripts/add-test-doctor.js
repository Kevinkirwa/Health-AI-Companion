const mongoose = require('mongoose');
const { Doctor } = require('../server/models/Doctor');
const { Hospital } = require('../server/models/Hospital');
const Schedule = require('../server/models/Schedule');

async function addDoctorAndSchedule() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthaicompanion');
    console.log('Connected to MongoDB');
    
    // Get the hospital
    const hospitalId = '6831a72cdb5db113ca985772';
    const hospital = await Hospital.findById(hospitalId);
    
    if (!hospital) {
      console.log('Hospital not found. Please check the ID.');
      return;
    }
    
    console.log('Found hospital:', hospital.name);
    
    // Create a test doctor
    const doctor = new Doctor({
      name: 'Dr. John Smith',
      email: 'drsmith@example.com',
      phone: '+1234567890',
      specialization: 'General Medicine',
      hospitalId: hospitalId,
      yearsOfExperience: 10,
      bio: 'Experienced general practitioner',
      isAvailable: true
    });
    
    // Save the doctor
    await doctor.save();
    console.log('Created doctor:', doctor.name, 'with ID:', doctor._id);
    
    // Create a schedule for this doctor
    const schedule = new Schedule({
      doctorId: doctor._id,
      hospitalId: hospitalId,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      appointmentDuration: 30,
      isAvailable: true
    });
    
    // Save the schedule
    await schedule.save();
    console.log('Created schedule for doctor on Monday');
    
    // Add more schedules for other days
    const daysOfWeek = [2, 3, 4, 5]; // Tuesday through Friday
    
    for (const day of daysOfWeek) {
      const additionalSchedule = new Schedule({
        doctorId: doctor._id,
        hospitalId: hospitalId,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        appointmentDuration: 30,
        isAvailable: true
      });
      
      await additionalSchedule.save();
      console.log(`Created schedule for doctor on day ${day}`);
    }
    
    console.log('Successfully added doctor and schedules!');
    console.log('Try booking an appointment now.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

addDoctorAndSchedule();
