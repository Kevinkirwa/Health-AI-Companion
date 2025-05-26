const express = require('express');

function setupAdminRoutes(app, storage) {
  const router = express.Router();

  // Middleware to check if user is admin
  const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };

  // Get all users
  router.get('/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Error getting users' });
    }
  });

  // Get user by ID
  router.get('/users/:id', isAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Error getting user' });
    }
  });

  // Update user
  router.put('/users/:id', isAdmin, async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Error updating user' });
    }
  });

  // Delete user
  router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  });

  // Get all hospitals
  router.get('/hospitals', isAdmin, async (req, res) => {
    try {
      const hospitals = await storage.getAllHospitals();
      res.json({ hospitals });
    } catch (error) {
      console.error('Get hospitals error:', error);
      res.status(500).json({ message: 'Error getting hospitals' });
    }
  });

  // Create hospital
  router.post('/hospitals', isAdmin, async (req, res) => {
    try {
      const hospital = await storage.createHospital(req.body);
      res.status(201).json({
        message: 'Hospital created successfully',
        hospital
      });
    } catch (error) {
      console.error('Create hospital error:', error);
      res.status(500).json({ message: 'Error creating hospital' });
    }
  });

  // Update hospital
  router.put('/hospitals/:id', isAdmin, async (req, res) => {
    try {
      const hospital = await storage.updateHospital(req.params.id, req.body);
      res.json({
        message: 'Hospital updated successfully',
        hospital
      });
    } catch (error) {
      console.error('Update hospital error:', error);
      res.status(500).json({ message: 'Error updating hospital' });
    }
  });

  // Delete hospital
  router.delete('/hospitals/:id', isAdmin, async (req, res) => {
    try {
      await storage.deleteHospital(req.params.id);
      res.json({ message: 'Hospital deleted successfully' });
    } catch (error) {
      console.error('Delete hospital error:', error);
      res.status(500).json({ message: 'Error deleting hospital' });
    }
  });

  // Get all doctors
  router.get('/doctors', isAdmin, async (req, res) => {
    try {
      const doctors = await storage.getAllDoctors();
      res.json({ doctors });
    } catch (error) {
      console.error('Get doctors error:', error);
      res.status(500).json({ message: 'Error getting doctors' });
    }
  });

  // Create doctor
  router.post('/doctors', isAdmin, async (req, res) => {
    try {
      const doctor = await storage.createDoctor(req.body);
      res.status(201).json({
        message: 'Doctor created successfully',
        doctor
      });
    } catch (error) {
      console.error('Create doctor error:', error);
      res.status(500).json({ message: 'Error creating doctor' });
    }
  });

  // Update doctor
  router.put('/doctors/:id', isAdmin, async (req, res) => {
    try {
      const doctor = await storage.updateDoctor(req.params.id, req.body);
      res.json({
        message: 'Doctor updated successfully',
        doctor
      });
    } catch (error) {
      console.error('Update doctor error:', error);
      res.status(500).json({ message: 'Error updating doctor' });
    }
  });

  // Delete doctor
  router.delete('/doctors/:id', isAdmin, async (req, res) => {
    try {
      await storage.deleteDoctor(req.params.id);
      res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
      console.error('Delete doctor error:', error);
      res.status(500).json({ message: 'Error deleting doctor' });
    }
  });

  // Get all appointments
  router.get('/appointments', isAdmin, async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json({ appointments });
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ message: 'Error getting appointments' });
    }
  });

  // Update appointment
  router.put('/appointments/:id', isAdmin, async (req, res) => {
    try {
      const appointment = await storage.updateAppointment(req.params.id, req.body);
      res.json({
        message: 'Appointment updated successfully',
        appointment
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ message: 'Error updating appointment' });
    }
  });

  // Delete appointment
  router.delete('/appointments/:id', isAdmin, async (req, res) => {
    try {
      await storage.deleteAppointment(req.params.id);
      res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({ message: 'Error deleting appointment' });
    }
  });

  app.use('/api/admin', router);
}

module.exports = { setupAdminRoutes }; 