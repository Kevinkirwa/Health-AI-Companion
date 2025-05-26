const express = require('express');
const jwt = require('jsonwebtoken');

function initializeUserRoutes(db) {
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

  // Get all users (admin only)
  router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
      const users = await db.getAllUsers();
      res.json(users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      })));
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ message: 'Error getting users' });
    }
  });

  // Get user by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      // Only allow users to access their own data unless they're admin
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const user = await db.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Error getting user' });
    }
  });

  // Update user
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      // Only allow users to update their own data unless they're admin
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { username, email, preferences } = req.body;
      const updateData = {};

      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (preferences) updateData.preferences = preferences;

      const user = await db.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user' });
    }
  });

  // Delete user
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      // Only allow users to delete their own account unless they're admin
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const success = await db.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  });

  // Get user's saved hospitals
  router.get('/:id/saved-hospitals', authenticateToken, async (req, res) => {
    try {
      // Only allow users to access their own data unless they're admin
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const savedHospitals = await db.getSavedHospitals(req.params.id);
      res.json(savedHospitals);
    } catch (error) {
      console.error('Error getting saved hospitals:', error);
      res.status(500).json({ message: 'Error getting saved hospitals' });
    }
  });

  // Save hospital for user
  router.post('/:id/saved-hospitals/:hospitalId', authenticateToken, async (req, res) => {
    try {
      // Only allow users to save hospitals for themselves
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const success = await db.saveHospital(req.params.id, req.params.hospitalId);
      if (!success) {
        return res.status(404).json({ message: 'Hospital not found' });
      }

      res.json({ message: 'Hospital saved successfully' });
    } catch (error) {
      console.error('Error saving hospital:', error);
      res.status(500).json({ message: 'Error saving hospital' });
    }
  });

  // Remove saved hospital for user
  router.delete('/:id/saved-hospitals/:hospitalId', authenticateToken, async (req, res) => {
    try {
      // Only allow users to remove their own saved hospitals
      if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const success = await db.removeSavedHospital(req.params.id, req.params.hospitalId);
      if (!success) {
        return res.status(404).json({ message: 'Saved hospital not found' });
      }

      res.json({ message: 'Hospital removed from saved list' });
    } catch (error) {
      console.error('Error removing saved hospital:', error);
      res.status(500).json({ message: 'Error removing saved hospital' });
    }
  });

  return router;
}

module.exports = { initializeUserRoutes }; 