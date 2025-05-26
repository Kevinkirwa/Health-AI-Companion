const express = require('express');
const jwt = require('jsonwebtoken');

function initializeDoctorRoutes(db) {
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

  // Get all doctors
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const doctors = await db.getAllDoctors();
      res.json(doctors);
    } catch (error) {
      console.error('Error getting doctors:', error);
      res.status(500).json({ message: 'Error getting doctors' });
    }
  });

  // Get doctor by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const doctor = await db.getDoctor(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      res.json(doctor);
    } catch (error) {
      console.error('Error getting doctor:', error);
      res.status(500).json({ message: 'Error getting doctor' });
    }
  });

  // Create doctor (admin only)
  router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
      const doctor = await db.createDoctor(req.body);
      res.status(201).json(doctor);
    } catch (error) {
      console.error('Error creating doctor:', error);
      res.status(500).json({ message: 'Error creating doctor' });
    }
  });

  // Update doctor (admin only)
  router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const doctor = await db.updateDoctor(req.params.id, req.body);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      res.json(doctor);
    } catch (error) {
      console.error('Error updating doctor:', error);
      res.status(500).json({ message: 'Error updating doctor' });
    }
  });

  // Delete doctor (admin only)
  router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const success = await db.deleteDoctor(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
      console.error('Error deleting doctor:', error);
      res.status(500).json({ message: 'Error deleting doctor' });
    }
  });

  // Get doctors by hospital
  router.get('/hospital/:hospitalId', authenticateToken, async (req, res) => {
    try {
      const doctors = await db.getDoctorsByHospital(req.params.hospitalId);
      res.json(doctors);
    } catch (error) {
      console.error('Error getting doctors by hospital:', error);
      res.status(500).json({ message: 'Error getting doctors by hospital' });
    }
  });

  return router;
}

module.exports = { initializeDoctorRoutes }; 