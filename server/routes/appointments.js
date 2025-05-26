const express = require('express');
const jwt = require('jsonwebtoken');

function initializeAppointmentRoutes(db) {
  const router = express.Router();

  // Middleware to verify JWT token
  const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };

  // Middleware to check if user is admin
  const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };

  // Get all appointments (admin only)
  router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
      const appointments = await db.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      console.error('Error getting appointments:', error);
      res.status(500).json({ message: 'Error getting appointments' });
    }
  });

  // Get appointment by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const appointment = await db.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      res.json(appointment);
    } catch (error) {
      console.error('Error getting appointment:', error);
      res.status(500).json({ message: 'Error getting appointment' });
    }
  });

  // Create appointment (user or admin)
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const appointment = await db.createAppointment(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ message: 'Error creating appointment' });
    }
  });

  // Update appointment (admin only)
  router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const appointment = await db.updateAppointment(req.params.id, req.body);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      res.json(appointment);
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ message: 'Error updating appointment' });
    }
  });

  // Delete appointment (admin only)
  router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const success = await db.deleteAppointment(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ message: 'Error deleting appointment' });
    }
  });

  // Get appointments for a user
  router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
      // Only allow users to access their own appointments unless they're admin
      if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      const appointments = await db.getUserAppointments(req.params.userId);
      res.json(appointments);
    } catch (error) {
      console.error('Error getting user appointments:', error);
      res.status(500).json({ message: 'Error getting user appointments' });
    }
  });

  // Get appointments for a doctor
  router.get('/doctor/:doctorId', authenticateToken, async (req, res) => {
    try {
      // Only allow doctors to access their own appointments unless they're admin
      if (req.user.id !== req.params.doctorId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      const appointments = await db.getDoctorAppointments(req.params.doctorId);
      res.json(appointments);
    } catch (error) {
      console.error('Error getting doctor appointments:', error);
      res.status(500).json({ message: 'Error getting doctor appointments' });
    }
  });

  return router;
}

module.exports = { initializeAppointmentRoutes }; 