/**
 * Cleanup script for orphaned schedules
 * 
 * This script removes schedule records that reference doctors or hospitals that no longer exist.
 * Run with: node cleanup-orphaned-schedules.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const { Doctor } = require('../models/Doctor');
const { Hospital } = require('../models/Hospital');

async function cleanupOrphanedSchedules() {
  try {
    // Connect to MongoDB with options to handle SRV URI
    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      directConnection: false
    };
    
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('Connected to MongoDB');

    // Find all schedules
    const schedules = await Schedule.find();
    console.log(`Found ${schedules.length} total schedules`);
    
    // Specifically look for the problematic schedule
    const targetSchedule = await Schedule.findOne({ 
      hospitalId: '6831a72cdb5db113ca985772',
      doctorId: '6833b427941edddb797ac005'
    });
    
    if (targetSchedule) {
      console.log(`Found the problematic schedule: ${targetSchedule._id}`);
      await Schedule.findByIdAndDelete(targetSchedule._id);
      console.log(`Deleted the problematic schedule`);
    } else {
      console.log('The specific problematic schedule was not found.');
    }
    
    let cleanedCount = 0;

    for (const schedule of schedules) {
      console.log(`Checking schedule ${schedule._id} with doctorId: ${schedule.doctorId} and hospitalId: ${schedule.hospitalId}`);
      
      // Check if doctor exists
      const doctor = await Doctor.findById(schedule.doctorId);
      if (!doctor) {
        console.log(`Removing schedule with missing doctor: ${schedule._id}, doctorId: ${schedule.doctorId}`);
        await Schedule.findByIdAndDelete(schedule._id);
        cleanedCount++;
        continue;
      }

      // Check if hospital exists
      const hospital = await Hospital.findById(schedule.hospitalId);
      if (!hospital) {
        console.log(`Removing schedule with missing hospital: ${schedule._id}, hospitalId: ${schedule.hospitalId}`);
        await Schedule.findByIdAndDelete(schedule._id);
        cleanedCount++;
      }
    }

    console.log(`Cleaned up ${cleanedCount} orphaned schedules`);
  } catch (error) {
    console.error('Error cleaning up orphaned schedules:', error);
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the cleanup function
cleanupOrphanedSchedules();
