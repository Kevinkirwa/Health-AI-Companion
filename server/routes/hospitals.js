const express = require('express');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

function initializeHospitalRoutes(db) {
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
  } else {
    console.log('Twilio credentials not provided - WhatsApp features will be disabled');
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

  // Middleware to check if user is admin
  const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };

  // Test WhatsApp notification - Public endpoint
  router.post('/test-whatsapp', async (req, res) => {
    try {
      if (!twilioClient) {
        return res.status(500).json({
          message: "WhatsApp service is not configured",
          success: false
        });
      }

      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ 
          message: "Phone number is required",
          success: false 
        });
      }

      if (!process.env.TWILIO_WHATSAPP_NUMBER) {
        return res.status(500).json({
          message: "WhatsApp number is not configured",
          success: false
        });
      }

      // Format phone number for Kenya (add +254 if not present)
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+254${phoneNumber.replace(/^0+/, "")}`;
      
      // Send test message
      const message = "This is a test message from HealthAI Companion. If you receive this, WhatsApp notifications are working correctly!";
      
      try {
        await twilioClient.messages.create({
          body: message,
          to: `whatsapp:${formattedPhone}`,
          from: 'whatsapp:+14155238886'  // Twilio's sandbox number
        });

        res.json({
          message: "Test WhatsApp message sent successfully. If you don't receive it, please send 'join <your-sandbox-code>' to +14155238886 first.",
          success: true
        });
      } catch (error) {
        if (error.code === 63007) {
          res.status(400).json({
            message: "To receive WhatsApp messages, you need to join the Twilio sandbox first. Send 'join <your-sandbox-code>' to +14155238886",
            success: false,
            error: error.message
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error sending test WhatsApp message:", error);
      res.status(500).json({ 
        message: "Failed to send test WhatsApp message: " + error.message,
        success: false 
      });
    }
  });

  // Search hospitals - Public endpoint
  router.get('/search', async (req, res) => {
    try {
      const { query, county, specialty } = req.query;
      
      // Build search query
      const searchQuery = {};
      
      if (query) {
        searchQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { address: { $regex: query, $options: 'i' } },
          { county: { $regex: query, $options: 'i' } },
          { subCounty: { $regex: query, $options: 'i' } }
        ];
      }
      
      if (county) {
        searchQuery.county = { $regex: county, $options: 'i' };
      }
      
      if (specialty) {
        searchQuery.specialties = { $regex: specialty, $options: 'i' };
      }
      
      // Execute search
      const hospitals = await db.getHospitalsByFilters(searchQuery);
      
      res.json({
        hospitals,
        message: hospitals.length > 0 ? "Hospitals found" : "No hospitals found",
        success: true
      });
    } catch (error) {
      console.error("Error searching hospitals:", error);
      res.status(500).json({ 
        message: "Failed to search hospitals. Please try again.",
        success: false 
      });
    }
  });

  // Get all hospitals - Public endpoint
  router.get('/', async (req, res) => {
    try {
      const hospitals = await db.getAllHospitals();
      res.json({
        hospitals,
        success: true
      });
    } catch (error) {
      console.error('Error getting hospitals:', error);
      res.status(500).json({ 
        message: 'Error getting hospitals',
        success: false 
      });
    }
  });

  // Get hospital by ID
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const hospital = await db.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
      res.json(hospital);
    } catch (error) {
      console.error('Error getting hospital:', error);
      res.status(500).json({ message: 'Error getting hospital' });
    }
  });
  
  // Get hospital schedules - Public endpoint
  router.get('/:id/schedules', async (req, res) => {
    try {
      // Get all schedules for this hospital
      const schedules = await db.getSchedulesByHospital(req.params.id);
      res.json({
        success: true,
        schedules: schedules || []
      });
    } catch (error) {
      console.error('Error getting hospital schedules:', error);
      res.status(500).json({ 
        message: 'Error getting hospital schedules',
        success: false 
      });
    }
  });

  // Get doctors by hospital ID
  router.get('/:id/doctors', authenticateToken, async (req, res) => {
    try {
      // First check if hospital exists
      const hospital = await db.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
      
      // Get doctors for this hospital
      const doctors = await db.getDoctorsByHospital(req.params.id);
      
      res.json({
        success: true,
        doctors: doctors || []
      });
    } catch (error) {
      console.error('Error getting doctors by hospital:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error getting doctors for this hospital' 
      });
    }
  });

  // Create hospital (admin only)
  router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
      const hospital = await db.createHospital(req.body);
      res.status(201).json(hospital);
    } catch (error) {
      console.error('Error creating hospital:', error);
      res.status(500).json({ message: 'Error creating hospital' });
    }
  });

  // Update hospital (admin only)
  router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const hospital = await db.updateHospital(req.params.id, req.body);
      if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
      res.json(hospital);
    } catch (error) {
      console.error('Error updating hospital:', error);
      res.status(500).json({ message: 'Error updating hospital' });
    }
  });

  // Delete hospital (admin only)
  router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const success = await db.deleteHospital(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
      res.json({ message: 'Hospital deleted successfully' });
    } catch (error) {
      console.error('Error deleting hospital:', error);
      res.status(500).json({ message: 'Error deleting hospital' });
    }
  });

  return router;
}

module.exports = { initializeHospitalRoutes }; 