const express = require('express');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');

function initializeAuthRoutes(db) {
  const router = express.Router();

  // Register a new user
  router.post('/register', async (req, res) => {
    try {
      const { 
        username, 
        email, 
        password, 
        firstName,
        lastName,
        role = 'user' 
      } = req.body;

      console.log('Registration attempt for:', email);
      console.log('Registration details:', {
        username,
        email,
        hasPassword: !!password,
        passwordLength: password ? password.length : 0,
        passwordValue: password ? password.substring(0, 3) + '...' : 'None',
        firstName,
        lastName,
        role
      });

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        console.log('User already exists:', email);
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password before creating user
      const hashedPassword = await hashPassword(password);
      console.log('Password hashed successfully:', {
        originalLength: password.length,
        hashedLength: hashedPassword.length,
        hashedPrefix: hashedPassword.substring(0, 7) + '...'
      });

      // Create new user
      const user = await db.createUser({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role
      });

      console.log('User created successfully:', {
        id: user._id,
        email: user.email,
        username: user.username,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        passwordPrefix: user.password ? user.password.substring(0, 7) + '...' : 'None'
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  });

  // Login user
  router.post('/login', async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      console.log('Login attempt for:', usernameOrEmail);
      console.log('Login details:', {
        usernameOrEmail,
        hasPassword: !!password,
        passwordLength: password ? password.length : 0
      });
      
      // Find user by username or email using the User model
      const User = require('../models/User');
      const user = await User.findByEmailOrUsername(usernameOrEmail);
      console.log('User found:', user ? {
        id: user._id,
        email: user.email,
        username: user.username,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      } : 'No user found');
      
      if (!user) {
        console.log('No user found with username/email:', usernameOrEmail);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('Attempting password comparison for user:', user.email);
      // Verify password using the model's method
      const isValidPassword = await user.comparePassword(password);
      console.log('Password validation result:', isValidPassword);

      if (!isValidPassword) {
        console.log('Invalid password for user:', user.email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return user data without sensitive information
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        role: user.role
      };

      console.log('Login successful for user:', user.email);
      res.json({
        success: true,
        token,
        user: userResponse
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Logout user
  router.post('/logout', (req, res) => {
    // Since we're using JWT, we don't need to do anything server-side
    // The client should remove the token
    res.json({ message: 'Logged out successfully' });
  });

  // Get current user
  router.get('/me', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.getUserById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user data without sensitive information
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        role: user.role
      };

      res.json({ success: true, user: userResponse });
    } catch (error) {
      console.error('Error in /me endpoint:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Change password
  router.post('/change-password', async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.getUser(decoded.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(newPassword);
      await db.updateUser(user._id, { password: hashedPassword });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Error changing password' });
    }
  });

  // Request password reset
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await db.getUserByEmail(email);

      if (!user) {
        // Don't reveal that the user doesn't exist
        return res.json({ message: 'If an account exists, a password reset email will be sent' });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // TODO: Send reset email with token
      // For now, just return the token
      res.json({
        message: 'Password reset email sent',
        resetToken // Remove this in production
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Error processing password reset request' });
    }
  });

  // Reset password
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      // Verify reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.getUser(decoded.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(newPassword);
      await db.updateUser(user._id, { password: hashedPassword });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Error resetting password' });
    }
  });

  return router;
}

module.exports = { initializeAuthRoutes }; 