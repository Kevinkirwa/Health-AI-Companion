const express = require('express');
const { authenticateToken } = require('../middleware/auth');

function setupDoctorRoutes(app, storage) {
  const router = express.Router();

  // Get all doctors
  router.get('/', async (req, res) => {
    try {
      const doctors = await storage.getAllDoctors();
      res.json({ doctors });
    } catch (error) {
      console.error('Get doctors error:', error);
      res.status(500).json({ message: 'Error getting doctors' });
    }
  });

  // Get doctor by ID
  router.get('/:id', async (req, res) => {
    try {
      const doctor = await storage.getDoctor(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      res.json({ doctor });
    } catch (error) {
      console.error('Get doctor error:', error);
      res.status(500).json({ message: 'Error getting doctor' });
    }
  });

  // Get doctors by hospital
  router.get('/hospital/:hospitalId', async (req, res) => {
    try {
      const doctors = await storage.getDoctorsByHospital(req.params.hospitalId);
      res.json({ doctors });
    } catch (error) {
      console.error('Get doctors by hospital error:', error);
      res.status(500).json({ message: 'Error getting doctors by hospital' });
    }
  });

  // Get doctor's schedule
  router.get('/:id/schedule', async (req, res) => {
    try {
      const schedule = await storage.getDoctorSchedule(req.params.id);
      res.json({ schedule });
    } catch (error) {
      console.error('Get doctor schedule error:', error);
      res.status(500).json({ message: 'Error getting doctor schedule' });
    }
  });

  // Get doctor's patients
  router.get('/:id/patients', async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const patients = await storage.getDoctorPatients(req.params.id);
      res.json({ patients });
    } catch (error) {
      console.error('Get doctor patients error:', error);
      res.status(500).json({ message: 'Error getting doctor patients' });
    }
  });

  // Get doctor's appointments
  router.get('/:id/appointments', async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const appointments = await storage.getDoctorAppointments(req.params.id);
      res.json({ appointments });
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      res.status(500).json({ message: 'Error getting doctor appointments' });
    }
  });

  // Update doctor's availability
  router.put('/:id/availability', async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const doctor = await storage.updateDoctor(req.params.id, {
        availability: req.body.availability
      });

      res.json({
        message: 'Availability updated successfully',
        doctor
      });
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({ message: 'Error updating availability' });
    }
  });

  // Update doctor's profile
  router.put('/:id/profile', async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const doctor = await storage.updateDoctor(req.params.id, req.body);
      res.json({
        message: 'Profile updated successfully',
        doctor
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  });

  // Hospital verifies doctor - PUT endpoint
  router.put('/:doctorId/verify', authenticateToken, async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { status } = req.body;
      
      console.log(`PUT verify request for doctor ${doctorId} with status ${status}`);
      
      // Verify that the user is an admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can verify doctors'
        });
      }
      
      // Get the doctor
      const doctor = await storage.getDoctorById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }
      
      // Update verification status
      const updatedDoctor = await storage.updateDoctor(doctorId, {
        verificationStatus: status,
        verificationDate: new Date(),
        updatedAt: new Date()
      });
      
      res.json({
        success: true,
        message: `Doctor ${status === 'verified' ? 'verified' : 'unverified'} successfully`,
        doctor: updatedDoctor
      });
    } catch (error) {
      console.error('Error verifying doctor:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to verify doctor'
      });
    }
  });
  
  // Hospital verifies doctor - POST endpoint (for service worker compatibility)
  router.post('/:doctorId/verify', authenticateToken, async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { status } = req.body;
      
      console.log(`POST verify request for doctor ${doctorId} with status ${status}`);
      
      // Verify that the user is an admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can verify doctors'
        });
      }
      
      // Get the doctor
      const doctor = await storage.getDoctorById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }
      
      // Update verification status
      const updatedDoctor = await storage.updateDoctor(doctorId, {
        verificationStatus: status,
        verificationDate: new Date(),
        updatedAt: new Date()
      });
      
      res.json({
        success: true,
        message: `Doctor ${status === 'verified' ? 'verified' : 'unverified'} successfully`,
        doctor: updatedDoctor
      });
    } catch (error) {
      console.error('Error verifying doctor:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to verify doctor'
      });
    }
  });

  app.use('/api/doctors', router);
}

module.exports = { setupDoctorRoutes }; 