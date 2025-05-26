const express = require('express');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const twilioService = require('../services/twilio');
const { MongoStorage } = require('../storage/mongodb');

function initializeNotificationRoutes(db) {
  const router = express.Router();

  // Initialize Twilio client
  let twilioClient = null;
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('Twilio client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Twilio client:', error);
    }
  }

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

  // Send appointment notification to patient
  router.post('/appointment/patient', authenticateToken, async (req, res) => {
    try {
      const { appointmentId, patientPhone, appointmentDetails } = req.body;

      if (!patientPhone || !appointmentDetails) {
        return res.status(400).json({
          message: "Patient phone and appointment details are required",
          success: false
        });
      }

      // Format phone number for Kenya
      const formattedPhone = patientPhone.startsWith("+") ? patientPhone : `+254${patientPhone.replace(/^0+/, "")}`;
      
      // Create appointment notification message
      const message = `Your appointment has been scheduled:\n\n` +
        `Date: ${appointmentDetails.date}\n` +
        `Time: ${appointmentDetails.time}\n` +
        `Doctor: ${appointmentDetails.doctorName}\n` +
        `Hospital: ${appointmentDetails.hospitalName}\n\n` +
        `Please arrive 15 minutes before your scheduled time.`;

      await twilioClient.messages.create({
        body: message,
        to: `whatsapp:${formattedPhone}`,
        from: 'whatsapp:+14155238886'
      });

      // Save notification to database
      await db.createNotification({
        userId: req.user.id,
        type: 'appointment',
        message,
        status: 'sent',
        appointmentId
      });

      res.json({
        message: "Appointment notification sent successfully",
        success: true
      });
    } catch (error) {
      console.error("Error sending appointment notification:", error);
      res.status(500).json({
        message: "Failed to send appointment notification",
        success: false,
        error: error.message
      });
    }
  });

  // Send appointment notification to doctor
  router.post('/appointment/doctor', authenticateToken, async (req, res) => {
    try {
      const { appointmentId, doctorPhone, appointmentDetails } = req.body;

      if (!doctorPhone || !appointmentDetails) {
        return res.status(400).json({
          message: "Doctor phone and appointment details are required",
          success: false
        });
      }

      // Format phone number for Kenya
      const formattedPhone = doctorPhone.startsWith("+") ? doctorPhone : `+254${doctorPhone.replace(/^0+/, "")}`;
      
      // Create appointment notification message for doctor
      const message = `New appointment scheduled:\n\n` +
        `Date: ${appointmentDetails.date}\n` +
        `Time: ${appointmentDetails.time}\n` +
        `Patient: ${appointmentDetails.patientName}\n` +
        `Hospital: ${appointmentDetails.hospitalName}\n` +
        `Reason: ${appointmentDetails.reason || 'Not specified'}`;

      await twilioClient.messages.create({
        body: message,
        to: `whatsapp:${formattedPhone}`,
        from: 'whatsapp:+14155238886'
      });

      // Save notification to database
      await db.createNotification({
        userId: appointmentDetails.doctorId,
        type: 'appointment',
        message,
        status: 'sent',
        appointmentId
      });

      res.json({
        message: "Doctor notification sent successfully",
        success: true
      });
    } catch (error) {
      console.error("Error sending doctor notification:", error);
      res.status(500).json({
        message: "Failed to send doctor notification",
        success: false,
        error: error.message
      });
    }
  });

  // Send reminder notification
  router.post('/reminder', authenticateToken, async (req, res) => {
    try {
      const { userId, phone, reminderDetails } = req.body;

      if (!phone || !reminderDetails) {
        return res.status(400).json({
          message: "Phone and reminder details are required",
          success: false
        });
      }

      // Format phone number for Kenya
      const formattedPhone = phone.startsWith("+") ? phone : `+254${phone.replace(/^0+/, "")}`;
      
      // Create reminder message
      const message = `Reminder: ${reminderDetails.title}\n\n` +
        `Date: ${reminderDetails.date}\n` +
        `Time: ${reminderDetails.time}\n` +
        `Description: ${reminderDetails.description || 'No description provided'}`;

      await twilioClient.messages.create({
        body: message,
        to: `whatsapp:${formattedPhone}`,
        from: 'whatsapp:+14155238886'
      });

      // Save notification to database
      await db.createNotification({
        userId,
        type: 'reminder',
        message,
        status: 'sent',
        reminderId: reminderDetails.id
      });

      res.json({
        message: "Reminder notification sent successfully",
        success: true
      });
    } catch (error) {
      console.error("Error sending reminder notification:", error);
      res.status(500).json({
        message: "Failed to send reminder notification",
        success: false,
        error: error.message
      });
    }
  });

  // Get user notifications
  router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
      const notifications = await db.getUserNotifications(req.params.userId);
      res.json({
        notifications,
        success: true
      });
    } catch (error) {
      console.error("Error getting user notifications:", error);
      res.status(500).json({
        message: "Failed to get user notifications",
        success: false
      });
    }
  });

  // Test WhatsApp messaging
  router.post('/test-whatsapp', async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and message are required'
        });
      }

      const result = await twilioService.sendWhatsAppMessage(phoneNumber, message);
      
      res.json({
        success: true,
        message: 'WhatsApp message sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp message',
        error: error.message
      });
    }
  });
  
  // Test follow-up reminder (for hackathon demo)
  router.post('/test-follow-up', async (req, res) => {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }
      
      // Create sample follow-up details
      const followUpDetails = {
        patientName: 'John Doe',
        doctorName: 'Dr. Sarah Smith',
        appointmentDate: new Date().toLocaleDateString(),
        followUpNeeded: true,
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        customMessage: 'Remember to take your medication three times a day after meals. Call if you experience any side effects.'
      };

      const result = await twilioService.sendFollowUpReminder(phoneNumber, followUpDetails);
      
      res.json({
        success: true,
        message: 'Follow-up reminder sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error sending follow-up reminder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send follow-up reminder',
        error: error.message
      });
    }
  });

  // Send appointment confirmation
  router.post('/appointment-confirmation', async (req, res) => {
    try {
      const { phoneNumber, appointmentDetails } = req.body;

      if (!phoneNumber || !appointmentDetails) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and appointment details are required'
        });
      }

      const result = await twilioService.sendAppointmentConfirmation(phoneNumber, appointmentDetails);
      
      res.json({
        success: true,
        message: 'Appointment confirmation sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error sending appointment confirmation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send appointment confirmation',
        error: error.message
      });
    }
  });

  // Send appointment reminder
  router.post('/appointment-reminder', async (req, res) => {
    try {
      const { phoneNumber, appointmentDetails } = req.body;

      if (!phoneNumber || !appointmentDetails) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and appointment details are required'
        });
      }

      const result = await twilioService.sendAppointmentReminder(phoneNumber, appointmentDetails);
      
      res.json({
        success: true,
        message: 'Appointment reminder sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send appointment reminder',
        error: error.message
      });
    }
  });

  // Send doctor notification
  router.post('/doctor-notification', async (req, res) => {
    try {
      const { phoneNumber, notificationDetails } = req.body;

      if (!phoneNumber || !notificationDetails) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and notification details are required'
        });
      }

      const result = await twilioService.sendDoctorNotification(phoneNumber, notificationDetails);
      
      res.json({
        success: true,
        message: 'Doctor notification sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error sending doctor notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send doctor notification',
        error: error.message
      });
    }
  });

  // Test appointment and reminders
  router.post('/test-appointment', async (req, res) => {
    try {
      const { patientPhone, doctorPhone, hospitalId } = req.body;

      if (!patientPhone || !doctorPhone || !hospitalId) {
        return res.status(400).json({
          success: false,
          message: 'Patient phone, doctor phone, and hospital ID are required'
        });
      }

      // Validate phone numbers format
      const phoneRegex = /^(\+254|0)[17]\d{8}$/;
      if (!phoneRegex.test(patientPhone) || !phoneRegex.test(doctorPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format. Must be a valid Kenyan number starting with +254 or 0'
        });
      }

      // Format phone numbers to E.164 format if needed
      const formatPhone = (phone) => {
        if (phone.startsWith('0')) {
          return '+254' + phone.slice(1);
        }
        return phone;
      };

      const formattedPatientPhone = formatPhone(patientPhone);
      const formattedDoctorPhone = formatPhone(doctorPhone);

      // Create test appointment 1 hour from now
      const appointmentDate = new Date();
      appointmentDate.setHours(appointmentDate.getHours() + 1);

      // Use provided user ID directly
      const userId = '6831ea12122aa7e147546b3c';

      const appointment = await db.createAppointment({
        userId: userId,
        doctorId: 'test-doctor-id',
        hospitalId: hospitalId,
        date: appointmentDate,
        time: appointmentDate.toLocaleTimeString(),
        status: 'confirmed',
        reason: 'Test appointment',
        type: 'consultation'
      });

      // Send immediate test messages
      const patientMessage = await twilioService.sendAppointmentReminder(formattedPatientPhone, {
        patientName: 'Test Patient',
        doctorName: 'Test Doctor',
        hospitalName: 'Test Hospital',
        date: appointmentDate.toLocaleDateString(),
        time: appointmentDate.toLocaleTimeString(),
        reason: 'Test appointment',
        reminderType: '1-hour'
      });

      const doctorMessage = await twilioService.sendDoctorNotification(formattedDoctorPhone, {
        doctorName: 'Test Doctor',
        message: 'Test: You have an appointment in 1 hour',
        date: appointmentDate.toLocaleDateString(),
        time: appointmentDate.toLocaleTimeString(),
        hospitalName: 'Test Hospital'
      });

      res.json({
        success: true,
        message: 'Test appointment created and notifications sent',
        appointment,
        notifications: {
          patient: patientMessage,
          doctor: doctorMessage
        }
      });
    } catch (error) {
      console.error('Error creating test appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test appointment',
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { initializeNotificationRoutes }; 