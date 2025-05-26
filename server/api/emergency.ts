import { Router } from 'express';
import { z } from 'zod';
import { findNearestHospitals, getEmergencySpecificHospitals } from '../utils/hospitalUtils';

const router = Router();

const locationSchema = z.object({
  county: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const emergencyTypeSchema = z.object({
  type: z.enum(['cardiac', 'trauma', 'pediatric', 'obstetric', 'general']),
  severity: z.enum(['critical', 'urgent', 'stable']),
});

// Get nearest hospitals based on location and emergency type
router.post('/nearest-hospitals', async (req, res) => {
  try {
    const { location, emergencyType } = req.body;
    
    // Validate input
    const validatedLocation = locationSchema.parse(location);
    const validatedEmergencyType = emergencyType ? emergencyTypeSchema.parse(emergencyType) : undefined;

    // Find nearest hospitals
    const hospitals = findNearestHospitals(validatedLocation, validatedEmergencyType);

    res.json({
      success: true,
      data: hospitals,
      message: hospitals.length > 0 
        ? 'Found nearest hospitals' 
        : 'No hospitals found in the area'
    });
  } catch (error) {
    console.error('Error finding nearest hospitals:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to find nearest hospitals'
    });
  }
});

// Get emergency-specific hospitals
router.post('/emergency-hospitals', async (req, res) => {
  try {
    const { emergencyType } = req.body;
    
    // Validate input
    const validatedEmergencyType = emergencyTypeSchema.parse(emergencyType);

    // Get emergency-specific hospitals
    const hospitals = getEmergencySpecificHospitals(validatedEmergencyType);

    res.json({
      success: true,
      data: hospitals,
      message: hospitals.length > 0 
        ? 'Found emergency-specific hospitals' 
        : 'No hospitals found for this emergency type'
    });
  } catch (error) {
    console.error('Error finding emergency hospitals:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to find emergency hospitals'
    });
  }
});

export default router; 