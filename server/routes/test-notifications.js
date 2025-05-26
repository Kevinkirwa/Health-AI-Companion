const express = require('express');

function initializeTestNotificationsRoutes() {
  const router = express.Router();
  const { sendWhatsAppMessage } = require('../utils/whatsapp');

  // Test route to verify WhatsApp functionality
  router.post('/whatsapp-test', async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required"
        });
      }

      // Default message if none provided
      const testMessage = message || "This is a test message from HealthAI Companion. Your WhatsApp notifications are working correctly!";
      
      console.log(`🧪 TEST: Attempting to send WhatsApp message to ${phoneNumber}`);
      
      // Try to send the message
      try {
        const result = await sendWhatsAppMessage(phoneNumber, testMessage);
        console.log('✅ TEST: WhatsApp message sent successfully:', result.sid);
        
        return res.json({
          success: true,
          message: "Test WhatsApp message sent successfully. Check your phone!",
          messageId: result.sid
        });
      } catch (sendError) {
        console.error('❌ TEST: Error sending WhatsApp message:', sendError);
        
        return res.status(500).json({
          success: false,
          message: "Failed to send WhatsApp message",
          error: sendError.message,
          twilioCode: sendError.code,
          twilioStatus: sendError.status,
          // Include helpful information if this is a common Twilio error
          help: sendError.code === 63007 ? 
            "Your WhatsApp account may not be set up correctly with Twilio. Make sure you've joined their WhatsApp sandbox." : 
            "Check your Twilio credentials and make sure WhatsApp messaging is enabled for your account."
        });
      }
    } catch (error) {
      console.error('❌ TEST: Unexpected error:', error);
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
        error: error.message
      });
    }
  });

  // Test route to verify appointment notification templates
  router.post('/appointment-test', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      const { sendAppointmentConfirmation } = require('../utils/whatsapp');
      
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required"
        });
      }

      // Create mock data for testing
      const mockAppointment = {
        date: new Date(),
        time: "14:00",
        reason: "General checkup"
      };
      
      const mockDoctor = {
        userId: { name: "Dr. John Smith" },
        whatsappNumber: phoneNumber  // Use the provided number for testing
      };
      
      const mockPatient = {
        name: "Test Patient",
        whatsappNumber: phoneNumber, // Use the provided number for testing
        preferences: {
          notificationChannels: { 
            whatsapp: true 
          }
        }
      };
      
      const mockHospital = {
        name: "General Hospital",
        address: "123 Medical Center Drive, Nairobi"
      };
      
      console.log(`🧪 TEST: Sending test appointment notifications to ${phoneNumber}`);
      
      // Try to send the notifications
      try {
        const results = await sendAppointmentConfirmation(
          mockAppointment, 
          mockDoctor,
          mockPatient,
          mockHospital
        );
        
        console.log('✅ TEST: Appointment notifications sent successfully');
        
        return res.json({
          success: true,
          message: "Test appointment notifications sent successfully. Check your WhatsApp!",
          results
        });
      } catch (sendError) {
        console.error('❌ TEST: Error sending appointment notifications:', sendError);
        
        return res.status(500).json({
          success: false,
          message: "Failed to send appointment notifications",
          error: sendError.message
        });
      }
    } catch (error) {
      console.error('❌ TEST: Unexpected error:', error);
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { initializeTestNotificationsRoutes };
