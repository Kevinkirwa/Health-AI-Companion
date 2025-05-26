const express = require('express');
const { Doctor } = require('../models/Doctor');
const { User } = require('../models/User');

function initializeAdminUtilsRoutes() {
  const router = express.Router();

  // This is an administrative route - in production you would want to secure this properly
  router.get('/fix-doctor-profile/:doctorId/:userId', async (req, res) => {
    try {
      const { doctorId, userId } = req.params;
      
      console.log(`Attempting to fix doctor profile: doctorId=${doctorId}, userId=${userId}`);
      
      // Verify doctor exists
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ 
          success: false, 
          message: `Doctor with ID ${doctorId} not found` 
        });
      }
      
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: `User with ID ${userId} not found` 
        });
      }
      
      // Update the doctor record with the userId
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { userId: userId },
        { new: true }
      );
      
      console.log('Updated doctor record:', updatedDoctor);
      
      // Verify the link works by finding the doctor by userId
      const verifyDoctor = await Doctor.findOne({ userId });
      
      if (verifyDoctor) {
        console.log('Doctor can now be found by userId:', verifyDoctor._id);
        return res.json({
          success: true,
          message: 'Doctor profile successfully linked to user account',
          doctor: updatedDoctor
        });
      } else {
        console.log('Error: Doctor still cannot be found by userId after update');
        return res.status(500).json({
          success: false,
          message: 'Failed to link doctor profile to user account'
        });
      }
    } catch (error) {
      console.error('Error fixing doctor profile:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fixing doctor profile: ' + error.message 
      });
    }
  });

  return router;
}

module.exports = { initializeAdminUtilsRoutes };
