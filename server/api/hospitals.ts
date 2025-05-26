import { Express, Request, Response } from "express";
import { IStorage } from "../storage";
import { MongoStorage } from "../storage/mongodb";
import { z } from "zod";
import { insertHospitalSchema, insertDoctorSchema } from "@shared/schema";
import { Router } from 'express';
import { Hospital } from '../models/Hospital';
import { authenticateToken } from '../middleware/auth';
import axios from "axios";
import { kenyanHospitals } from '../data/kenyanHospitals';
import twilio from "twilio";

const router = Router();

// Create storage instance
const storage = new MongoStorage();

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Setup hospital routes
export function setupHospitalRoutes(app: Express): void {
  app.use('/api/hospitals', router);
}

// Search hospitals - Public endpoint
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { query, county, specialty } = req.query;
    
    // Build search query
    const searchQuery: any = {};
    
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
    const hospitals = await Hospital.find(searchQuery)
      .populate('doctors', 'name specialty availability rating')
      .select('-__v')
      .limit(50);
    
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
router.get("/", async (req: Request, res: Response) => {
  try {
    console.log('Fetching all hospitals...');
    const hospitals = await Hospital.find()
      .select('-__v');
    
    console.log(`Found ${hospitals.length} hospitals`);
    
    res.json({
      success: true,
      hospitals: hospitals.map(hospital => ({
        _id: hospital._id,
        name: hospital.name,
        address: hospital.address,
        county: hospital.county,
        specialties: hospital.specialties,
        isVerified: hospital.isVerified
      }))
    });
  } catch (error) {
    console.error("Error fetching all hospitals:", error);
    res.status(500).json({ 
      message: "Failed to fetch hospitals. Please try again.",
      success: false 
    });
  }
});

// Get hospital by ID - Public endpoint
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate('doctors', 'name specialty availability rating')
      .select('-__v');

    if (!hospital) {
      return res.status(404).json({ 
        message: "Hospital not found",
        success: false 
      });
    }

    res.json({
      hospital,
      success: true
    });
  } catch (error) {
    console.error("Error fetching hospital:", error);
    res.status(500).json({ 
      message: "Failed to fetch hospital. Please try again.",
      success: false 
    });
  }
});

// Save hospital - Protected endpoint
router.post("/:id/save", authenticateToken, async (req: Request, res: Response) => {
  try {
    const success = await storage.saveHospital(req.user.id, req.params.id);
    
    if (!success) {
      return res.status(404).json({ 
        message: "Hospital not found",
        success: false 
      });
    }
    
    res.json({ 
      message: "Hospital saved successfully",
      success: true 
    });
  } catch (error) {
    console.error("Error saving hospital:", error);
    res.status(500).json({ 
      message: "Failed to save hospital",
      success: false 
    });
  }
});

// Remove saved hospital - Protected endpoint
router.delete("/:id/save", authenticateToken, async (req: Request, res: Response) => {
  try {
    const success = await storage.removeSavedHospital(req.user.id, req.params.id);
    
    if (!success) {
      return res.status(404).json({ 
        message: "Hospital not found",
        success: false 
      });
    }
    
    res.json({ 
      message: "Hospital removed from saved list",
      success: true 
    });
  } catch (error) {
    console.error("Error removing saved hospital:", error);
    res.status(500).json({ 
      message: "Failed to remove saved hospital",
      success: false 
    });
  }
});

// Get nearby hospitals
router.get("/nearby", async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: "Latitude and longitude are required",
        success: false 
      });
    }
    
    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const rad = parseFloat(radius as string);
    
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      return res.status(400).json({ 
        message: "Invalid coordinates or radius",
        success: false 
      });
    }
    
    // Validate Kenyan coordinates
    if (lat < -4.7 || lat > 5.2 || lng < 33.9 || lng > 41.9) {
      return res.status(400).json({ 
        message: "Location must be within Kenya",
        success: false 
      });
    }
    
    const hospitals = await storage.getNearbyHospitals(lat, lng, rad);
    
    res.json({
      hospitals,
      message: hospitals.length > 0 ? "Nearby hospitals found" : "No hospitals found in the specified area",
      success: true
    });
    } catch (error) {
    console.error("Error fetching nearby hospitals:", error);
    res.status(500).json({ 
      message: "Failed to fetch nearby hospitals. Please try again.",
      success: false 
    });
  }
});

// Get hospitals by specialty
router.get("/specialty/:specialty", async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    let hospitals;
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const rad = parseFloat(radius as string);
      
      if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
        return res.status(400).json({ 
          message: "Invalid coordinates or radius",
          success: false 
        });
      }
      
      // Validate Kenyan coordinates
      if (lat < -4.7 || lat > 5.2 || lng < 33.9 || lng > 41.9) {
        return res.status(400).json({ 
          message: "Location must be within Kenya",
          success: false 
        });
      }
      
      hospitals = await storage.getHospitalsBySpecialtyWithLocation(
        req.params.specialty,
        lat,
        lng,
        rad
      );
    } else {
      hospitals = await storage.getHospitalsBySpecialty(req.params.specialty);
    }
    
    res.json({
      hospitals,
      message: hospitals.length > 0 ? "Hospitals found" : "No hospitals found with the specified specialty",
      success: true
    });
  } catch (error) {
    console.error("Error fetching hospitals by specialty:", error);
    res.status(500).json({ 
      message: "Failed to fetch hospitals by specialty. Please try again.",
      success: false 
    });
  }
});

// Hospital registration schema
const hospitalRegistrationSchema = z.object({
  name: z.string().min(2),
  address: z.string(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()])
  }),
  phone: z.string(),
  email: z.string().email(),
  website: z.string().optional(),
  openHours: z.string(),
  specialties: z.array(z.string()),
  county: z.string(),
  subCounty: z.string(),
  facilities: z.array(z.string()),
  emergencyServices: z.boolean(),
  insuranceAccepted: z.array(z.string())
});

// Register a new hospital
router.post('/register', async (req, res) => {
  try {
    const data = hospitalRegistrationSchema.parse(req.body);
    
    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({
      $or: [
        { email: data.email },
        { phone: data.phone }
      ]
    });

    if (existingHospital) {
      return res.status(400).json({ error: 'Hospital already registered' });
    }

    const hospital = new Hospital({
      ...data,
      isVerified: false // Requires admin verification
    });

    await hospital.save();

    res.status(201).json({ message: 'Hospital registered successfully. Awaiting verification.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all verified hospitals
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all hospitals from database...');
    const { location, specialty } = req.query;
    let hospitals = [];
    
    // Try to find hospitals in the database first
    const query: any = { isVerified: true };
    if (specialty) query.specialties = specialty;
    if (location) {
      query.$or = [
        { name: { $regex: location, $options: 'i' } },
        { address: { $regex: location, $options: 'i' } },
        { county: { $regex: location, $options: 'i' } },
        { subCounty: { $regex: location, $options: 'i' } }
      ];
    }

    console.log('Database query:', query);
    hospitals = await Hospital.find(query)
      .populate('doctors', 'name specialty availability rating')
      .select('-__v');
    
    console.log(`Found ${hospitals.length} hospitals in database`);

    // If no hospitals found in database, use static data
    if (hospitals.length === 0) {
      console.log('No hospitals found in database, using static data...');
      hospitals = kenyanHospitals.filter(hospital => {
        // Filter by specialty if provided
        if (specialty) {
          const specialtyLower = (specialty as string).toLowerCase();
          if (!hospital.specialties.some(s => s.toLowerCase().includes(specialtyLower))) {
            return false;
          }
        }
        
        // Filter by location if provided
        if (location) {
          const locationLower = (location as string).toLowerCase();
          return (
            hospital.name.toLowerCase().includes(locationLower) ||
            hospital.address.toLowerCase().includes(locationLower) ||
            hospital.county.toLowerCase().includes(locationLower) ||
            hospital.subCounty.toLowerCase().includes(locationLower)
          );
        }
        
        return true;
      });
      console.log(`Found ${hospitals.length} hospitals in static data`);
    }

    res.json({
      hospitals,
      message: hospitals.length > 0 ? "Hospitals found" : "No hospitals found",
      success: true
    });
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    res.status(500).json({ 
      message: "Failed to fetch hospitals. Please try again.",
      success: false 
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get hospital by ID
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate('doctors', 'name specialty availability rating')
      .select('-__v');

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update hospital details (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const data = hospitalRegistrationSchema.partial().parse(req.body);
    
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    ).select('-__v');

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test WhatsApp notification
router.post("/test-whatsapp", async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        message: "Phone number is required",
        success: false 
      });
    }

    // Format phone number for Kenya (add +254 if not present)
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+254${phoneNumber.replace(/^0+/, "")}`;
    
    // Send test message
    const message = "This is a test message from HealthAI Companion. If you receive this, WhatsApp notifications are working correctly!";
    
    await twilioClient.messages.create({
      body: message,
      to: `whatsapp:${formattedPhone}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
    });

    res.json({
      message: "Test WhatsApp message sent successfully",
      success: true
    });
  } catch (error) {
    console.error("Error sending test WhatsApp message:", error);
    res.status(500).json({ 
      message: "Failed to send test WhatsApp message",
      success: false 
    });
  }
});

// Export the router
export default router;
