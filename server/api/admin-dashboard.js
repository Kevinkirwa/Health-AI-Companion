const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { User } = require('../models/User');
const { Doctor } = require('../models/Doctor');
const { Hospital } = require('../models/Hospital');
const { Appointment } = require('../models/Appointment');

function setupAdminDashboardRoutes(app) {
  const router = express.Router();

  // Get admin dashboard overview
  router.get('/overview', authenticateToken, isAdmin, async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalDoctors = await Doctor.countDocuments();
      const totalHospitals = await Hospital.countDocuments();
      const totalAppointments = await Appointment.countDocuments();

      res.json({
        success: true,
        data: {
          totalUsers,
          totalDoctors,
          totalHospitals,
          totalAppointments
        }
      });
    } catch (error) {
      console.error('Error fetching admin overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admin overview'
      });
    }
  });

  // Get all users
  router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.json({
        success: true,
        users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  });

  // Get all doctors
  router.get('/doctors', authenticateToken, isAdmin, async (req, res) => {
    try {
      const doctors = await Doctor.find().populate('userId', 'name email');
      res.json({
        success: true,
        doctors
      });
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch doctors'
      });
    }
  });

  // Get all hospitals
  router.get('/hospitals', authenticateToken, isAdmin, async (req, res) => {
    try {
      const hospitals = await Hospital.find();
      res.json({
        success: true,
        hospitals
      });
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hospitals'
      });
    }
  });

  // Get all appointments
  router.get('/appointments', authenticateToken, isAdmin, async (req, res) => {
    try {
      const appointments = await Appointment.find()
        .populate('userId', 'name email')
        .populate('doctorId', 'userId')
        .populate('hospitalId', 'name address');
      
      res.json({
        success: true,
        appointments
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch appointments'
      });
    }
  });

  app.use('/api/admin', router);
}

module.exports = { setupAdminDashboardRoutes }; 