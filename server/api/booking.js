const express = require('express');

function setupBookingRoutes(app, storage) {
  const router = express.Router();

  // Get all appointments for a user
  router.get('/appointments', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const appointments = await storage.getUserAppointments(req.user.id);
      res.json({ appointments });
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ message: 'Error getting appointments' });
    }
  });

  // Create new appointment
  router.post('/appointments', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { doctorId, hospitalId, date, time, reason, type } = req.body;
      const appointment = await storage.createAppointment({
        userId: req.user.id,
        doctorId,
        hospitalId,
        date,
        time,
        reason,
        type
      });

      // Create reminder for the appointment
      await storage.createReminder({
        appointmentId: appointment.id,
        userId: req.user.id,
        type: 'email', // Default to email
        scheduledFor: new Date(date),
        message: `Reminder: You have an appointment on ${date} at ${time}`
      });

      res.status(201).json({
        message: 'Appointment created successfully',
        appointment
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({ message: 'Error creating appointment' });
    }
  });

  // Update appointment
  router.put('/appointments/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const updatedAppointment = await storage.updateAppointment(req.params.id, req.body);
      res.json({
        message: 'Appointment updated successfully',
        appointment: updatedAppointment
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ message: 'Error updating appointment' });
    }
  });

  // Cancel appointment
  router.post('/appointments/:id/cancel', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await storage.updateAppointmentStatus(req.params.id, 'cancelled');
      res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      res.status(500).json({ message: 'Error cancelling appointment' });
    }
  });

  // Get appointment details
  router.get('/appointments/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      res.json({ appointment });
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({ message: 'Error getting appointment' });
    }
  });

  app.use('/api/booking', router);
}

module.exports = { setupBookingRoutes }; 