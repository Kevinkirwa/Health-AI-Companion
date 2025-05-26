const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { Appointment } = require('../models/Appointment');
const { Doctor } = require('../models/Doctor');
const { Hospital } = require('../models/Hospital');
const User = require('../models/User');
const { sendAppointmentConfirmation } = require('../utils/whatsapp');

function setupAppointmentRoutes(app) {
  const router = express.Router();

  // Get all appointments for a user
  router.get('/user', authenticateToken, async (req, res) => {
    try {
      const appointments = await Appointment.find({ userId: req.user._id })
        .populate('doctorId', 'userId')
        .populate('hospitalId', 'name address');
      
      res.json({
        success: true,
        appointments
      });
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch appointments'
      });
    }
  });

  // Create a new appointment
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { doctorId, hospitalId, date, time, reason } = req.body;

      const appointment = new Appointment({
        userId: req.user._id,
        doctorId,
        hospitalId,
        date,
        time,
        reason,
        status: 'pending'
      });

      await appointment.save();

      res.status(201).json({
        success: true,
        appointment
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create appointment'
      });
    }
  });

  // Update appointment status
  router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
      const { status } = req.body;
      const appointment = await Appointment.findById(req.params.id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      // Update the appointment status
      appointment.status = status;
      await appointment.save();

      // If the appointment is confirmed, send WhatsApp notifications
      if (status === 'confirmed') {
        try {
          // Fetch related data for the notifications
          const [doctor, patient, hospital] = await Promise.all([
            Doctor.findById(appointment.doctorId).populate('userId'),
            User.findById(appointment.userId),
            Hospital.findById(appointment.hospitalId)
          ]);

          // Send the WhatsApp notifications
          if (doctor && patient && hospital) {
            await sendAppointmentConfirmation(appointment, doctor, patient, hospital);
            console.log('WhatsApp notifications sent successfully for appointment:', appointment._id);
          } else {
            console.error('Could not send WhatsApp notifications - missing data:', {
              hasDoctor: !!doctor,
              hasPatient: !!patient,
              hasHospital: !!hospital
            });
          }
        } catch (notificationError) {
          // Log the error but don't fail the request
          console.error('Error sending WhatsApp notifications:', notificationError);
        }
      }

      res.json({
        success: true,
        appointment,
        notificationSent: status === 'confirmed'
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update appointment status'
      });
    }
  });

  // Cancel appointment
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const appointment = await Appointment.findById(req.params.id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      // Only allow cancellation if the appointment is pending
      if (appointment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a non-pending appointment'
        });
      }

      await appointment.deleteOne();

      res.json({
        success: true,
        message: 'Appointment cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel appointment'
      });
    }
  });

  app.use('/api/appointments', router);
}

module.exports = { setupAppointmentRoutes }; 