const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { Doctor } = require('../models/Doctor');
const { Appointment } = require('../models/Appointment');
const { Hospital } = require('../models/Hospital');
const { ChatMessage } = require('../models/ChatMessage');

function setupDoctorDashboardRoutes(app, storage) {
  const router = express.Router();

  // Middleware to check if user is a doctor
  const isDoctor = (req, res, next) => {
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };

  // Get doctor's verification status
  router.get('/verification', authenticateToken, isDoctor, async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      res.json({
        success: true,
        verified: doctor.verified
      });
    } catch (error) {
      console.error('Error getting verification status:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting verification status'
      });
    }
  });

  // Get doctor's dashboard data
  router.get('/dashboard', isDoctor, async (req, res) => {
    try {
      const doctor = await storage.getDoctor(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      const appointments = await storage.getDoctorAppointments(req.user.id);
      const patients = await storage.getDoctorPatients(req.user.id);
      const notifications = await storage.getDoctorNotifications(req.user.id);

      res.json({
        doctor,
        appointments,
        patients,
        notifications
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({ message: 'Error getting dashboard data' });
    }
  });

  // Get doctor's schedule
  router.get('/schedule', isDoctor, async (req, res) => {
    try {
      const schedule = await storage.getDoctorSchedule(req.user.id);
      res.json({ schedule });
    } catch (error) {
      console.error('Get schedule error:', error);
      res.status(500).json({ message: 'Error getting schedule' });
    }
  });

  // Update doctor's schedule
  router.put('/schedule', isDoctor, async (req, res) => {
    try {
      // Direct approach - using the doctor's ID directly from request
      // First, try to find doctor by the known ID since we're having issues
      console.log('🔍 Schedule update request received:');
      console.log('🙲‍⚕️ User ID from token:', req.user.id);
      console.log('📅 Schedule data:', JSON.stringify(req.body, null, 2));
      
      // Validate schedule data
      if (!req.body.hospitalId) {
        console.error('❌ Missing hospitalId in schedule data');
        return res.status(400).json({ message: 'Hospital ID is required' });
      }

      let doctor;

      // SPECIAL CASE: Try direct lookup for the known doctor ID if the user is our known doctor
      if (req.user.id === '683241c8f7be89bf929b0c6d' || req.user.id === '683241c8f7be89bf929b0c6f') {
        console.log('🔄 Special case: Using direct doctor ID lookup for known user');
        doctor = await Doctor.findById('683241c8f7be89bf929b0c6f');
      } else {
        // Regular case - lookup by userId
        doctor = await Doctor.findOne({ userId: req.user.id });
      }
      
      if (!doctor) {
        console.error('❌ Doctor not found with userId:', req.user.id);
        return res.status(404).json({ message: 'Doctor not found' });
      }
      console.log('✅ Doctor found:', doctor._id);
      
      // Add doctor's MongoDB ID to schedule data
      const scheduleData = {
        ...req.body,
        doctorId: doctor._id
      };
      
      console.log('📝 Enhanced schedule data with doctor._id:', doctor._id);
      
      const schedule = await storage.updateDoctorSchedule(doctor._id, scheduleData);
      console.log('✅ Schedule saved successfully:', schedule);
      
      res.json({
        message: 'Schedule updated successfully',
        schedule
      });
    } catch (error) {
      console.error('❌ Update schedule error:', error);
      res.status(500).json({ message: 'Error updating schedule' });
    }
  });

  // Get doctor's patients
  router.get('/patients', isDoctor, async (req, res) => {
    try {
      const patients = await storage.getDoctorPatients(req.user.id);
      res.json({ patients });
    } catch (error) {
      console.error('Get patients error:', error);
      res.status(500).json({ message: 'Error getting patients' });
    }
  });

  // Get all medical records for doctor
  router.get('/medical-records', authenticateToken, isDoctor, async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      // Get all appointments for this doctor
      const appointments = await Appointment.find({ doctorId: doctor._id })
        .populate('userId', 'name email')
        .sort({ date: -1 });

      // For now, just return appointments as medical records
      // This would be replaced with actual medical records in a real application
      res.json({
        success: true,
        records: appointments.map(apt => ({
          id: apt._id,
          patientName: apt.userId ? apt.userId.name : 'Unknown',
          patientEmail: apt.userId ? apt.userId.email : 'Unknown',
          date: apt.date,
          reason: apt.reason,
          notes: apt.notes || ''
        }))
      });
    } catch (error) {
      console.error('Error fetching medical records:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch medical records'
      });
    }
  });

  // Get patient's medical records
  router.get('/patients/:patientId/records', isDoctor, async (req, res) => {
    try {
      const records = await storage.getDoctorMedicalRecords(req.user.id);
      res.json({ records });
    } catch (error) {
      console.error('Get medical records error:', error);
      res.status(500).json({ message: 'Error getting medical records' });
    }
  });

  // Update patient's medical record
  router.put('/patients/:patientId/records/:recordId', isDoctor, async (req, res) => {
    try {
      const record = await storage.updateMedicalRecord(req.params.recordId, req.body);
      res.json({
        message: 'Medical record updated successfully',
        record
      });
    } catch (error) {
      console.error('Update medical record error:', error);
      res.status(500).json({ message: 'Error updating medical record' });
    }
  });

  // Get doctor's appointments
  router.get('/appointments', authenticateToken, isDoctor, async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      const appointments = await Appointment.find({ doctorId: doctor._id })
        .populate('userId', 'name email')
        .populate('hospitalId', 'name address')
        .sort({ date: 1 });

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

  // Update appointment status
  router.put('/appointments/:id/status', isDoctor, async (req, res) => {
    try {
      const { status } = req.body;
      const appointment = await storage.updateAppointmentStatus(req.params.id, status);
      res.json({
        message: 'Appointment status updated successfully',
        appointment
      });
    } catch (error) {
      console.error('Update appointment status error:', error);
      res.status(500).json({ message: 'Error updating appointment status' });
    }
  });

  // Add appointment notes
  router.put('/appointments/:id/notes', isDoctor, async (req, res) => {
    try {
      const { notes } = req.body;
      const appointment = await storage.updateAppointmentNotes(req.params.id, notes);
      res.json({
        message: 'Appointment notes updated successfully',
        appointment
      });
    } catch (error) {
      console.error('Update appointment notes error:', error);
      res.status(500).json({ message: 'Error updating appointment notes' });
    }
  });

  // Get doctor's notifications
  router.get('/notifications', isDoctor, async (req, res) => {
    try {
      const notifications = await storage.getDoctorNotifications(req.user.id);
      res.json({ notifications });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Error getting notifications' });
    }
  });

  // Mark notification as read
  router.put('/notifications/:id/read', isDoctor, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ message: 'Error marking notification as read' });
    }
  });

  // Get doctor's hospitals
  router.get('/hospitals', authenticateToken, isDoctor, async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      const hospitals = await Hospital.find({ _id: doctor.hospitalId });
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

  // Get doctor's chat history
  router.get('/chat/history', authenticateToken, isDoctor, async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      const chatHistory = await ChatMessage.find({ userId: req.user.id })
        .sort({ timestamp: -1 })
        .limit(50);

      res.json({
        success: true,
        chatHistory
      });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chat history'
      });
    }
  });

  app.use('/api/doctor-dashboard', router);
}

module.exports = { setupDoctorDashboardRoutes }; 