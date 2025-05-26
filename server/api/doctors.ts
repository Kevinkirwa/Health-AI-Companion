import { Express, Request, Response } from "express";
import { IStorage } from '../storage';
import { MongoStorage } from '../storage/mongodb';
import { z } from "zod";
import { Router } from 'express';
import { Doctor } from '../models/Doctor';
import { Hospital } from '../models/Hospital';
import { authenticateToken, isAdmin } from '../middleware/auth';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import { doctorSchema, appointmentSchema } from '../models/Doctor';
import { User } from '../models/User';

// Create storage instance
const storage = new MongoStorage();

// Schema for updating appointment status
const updateAppointmentStatusSchema = z.object({
  status: z.enum(["confirmed", "pending", "cancelled"])
});

// Schema for updating appointment notes
const updateAppointmentNotesSchema = z.object({
  notes: z.string()
});

const router = Router();

// Configure multer for file uploads
const storageMulter = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/doctors');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storageMulter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
    }
  }
});

// Doctor registration schema
const doctorRegistrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  specialization: z.string(),
  licenseNumber: z.string(),
  hospitalAffiliation: z.array(z.string()),
  availability: z.object({
    days: z.array(z.string()),
    startTime: z.string(),
    endTime: z.string()
  })
});

// Register as a doctor
router.post('/register', async (req, res) => {
  try {
    const doctorData = doctorSchema.parse(req.body);
    
    // Set initial verification status
    doctorData.verificationStatus = 'pending';
    doctorData.createdAt = new Date();
    doctorData.updatedAt = new Date();
    
    const doctor = await storage.addDoctor(doctorData);
    
    res.status(201).json({
      success: true,
      message: 'Doctor registration successful. Pending verification.',
      doctor
    });
  } catch (error) {
    console.error('Error registering doctor:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to register doctor'
    });
  }
});

// Hospital verifies doctor - supports both PUT and POST for compatibility
// PUT endpoint for REST standards
router.put('/:doctorId/verify', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;
    
    // Verify that the user is an admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can verify doctors'
      });
    }
    
    // Get the doctor
    const doctor = await storage.getDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Update verification status
    const updatedDoctor = await storage.updateDoctor(doctorId, {
      verificationStatus: status,
      verificationDate: new Date(),
      updatedAt: new Date()
    });
    
    // Also update the corresponding user record
    const userRecord = await User.findOne({ email: doctor.email });
    if (userRecord) {
      userRecord.isVerified = status === 'verified';
      await userRecord.save();
    }
    
    res.json({
      success: true,
      message: `Doctor ${status === 'verified' ? 'verified' : 'unverified'} successfully`,
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error('Error verifying doctor:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to verify doctor'
    });
  }
});

// POST endpoint for service worker compatibility
router.post('/:doctorId/verify', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;
    
    console.log(`POST verify request for doctor ${doctorId} with status ${status}`);
    
    // Verify that the user is an admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can verify doctors'
      });
    }
    
    // Get the doctor
    const doctor = await storage.getDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Update verification status
    const updatedDoctor = await storage.updateDoctor(doctorId, {
      verificationStatus: status,
      verificationDate: new Date(),
      updatedAt: new Date()
    });
    
    // Also update the corresponding user record
    const userRecord = await User.findOne({ email: doctor.email });
    if (userRecord) {
      userRecord.isVerified = status === 'verified';
      await userRecord.save();
    }
    
    res.json({
      success: true,
      message: `Doctor ${status === 'verified' ? 'verified' : 'unverified'} successfully`,
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error('Error verifying doctor:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to verify doctor'
    });
  }
});

// Get available doctors at a hospital
router.get('/hospital/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { department, specialization } = req.query;
    
    const doctors = await storage.getHospitalDoctors(hospitalId, {
      department: department as string,
      specialization: specialization as string,
      verifiedOnly: true
    });
    
    res.json({
      success: true,
      doctors
    });
  } catch (error) {
    console.error('Error fetching hospital doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors'
    });
  }
});

// Get doctor's verification status
router.get('/verification', authenticateToken, async (req, res) => {
  try {
    // Get doctor by user ID from the authenticated user
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found'
      });
    }

    // Find doctor by userId
    const doctor = await storage.Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      verificationStatus: doctor.verificationStatus,
      verificationDate: doctor.verificationDate
    });
  } catch (error) {
    console.error('Error fetching doctor verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification status'
    });
  }
});

// Get doctor's availability
router.get('/:doctorId/availability', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;
    
    const availability = await storage.getDoctorAvailability(
      doctorId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    res.json({
      success: true,
      availability
    });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability'
    });
  }
});

// Book appointment
router.post('/:doctorId/appointments', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointmentData = appointmentSchema.parse(req.body);
    
    // Check doctor availability
    const isAvailable = await storage.checkDoctorAvailability(
      doctorId,
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.endTime
    );
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available'
      });
    }
    
    // Create appointment
    const appointment = await storage.createAppointment({
      ...appointmentData,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
});

// Get verified doctors
router.get('/verified', async (req: Request, res: Response) => {
  try {
    const { specialization, hospitalId } = req.query;
    
    const query: any = { isVerified: true };
    if (specialization) query.specialization = specialization;
    if (hospitalId) query.hospitalAffiliation = hospitalId;

    const doctors = await Doctor.find(query)
      .populate('hospitalAffiliation', 'name address')
      .select('-verificationDocuments');

    res.json({
      doctors,
      success: true
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      message: 'Failed to fetch doctors',
      success: false
    });
  }
});

// Get doctor profile
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('hospitalAffiliation', 'name address')
      .select('-verificationDocuments');

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found',
        success: false
      });
    }

    res.json({
      doctor,
      success: true
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor',
      success: false
    });
  }
});

// Get nearest hospitals with available doctors
router.get('/nearby-hospitals', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: Number(maxDistance)
        }
      }
    }).populate({
      path: 'doctors',
      match: { isVerified: true },
      select: 'name specialty availability rating'
    });

    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor's profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.session.doctorId)
      .select('-password')
      .populate('hospitalId', 'name address');
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update doctor's availability
router.put('/availability', authenticateToken, async (req, res) => {
  try {
    const { availability } = req.body;
    
    const doctor = await Doctor.findByIdAndUpdate(
      req.session.doctorId,
      { availability },
      { new: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor's verification status
router.get('/verification', authenticateToken, async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Calculate verification progress based on documents
    const progress = doctor.documents ? 
      (doctor.documents.filter(doc => doc.verified).length / doctor.documents.length) * 100 : 0;

    // Determine verification status and message
    const status = doctor.verificationStatus || 'pending';
    let message = '';
    
    switch (status) {
      case 'verified':
        message = 'Your account is verified.';
        break;
      case 'rejected':
        message = 'Your verification was rejected. Please contact support.';
        break;
      default:
        message = 'Your verification is pending. Please upload required documents.';
    }

    res.json({
      success: true,
      status,
      progress,
      message
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification status'
    });
  }
});

// Get doctor's notifications
router.get('/notifications', authenticateToken, async (req: Request, res: Response) => {
  try {
    const notifications = await storage.getDoctorNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get doctor's medical records
router.get('/medical-records', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Get doctor ID from the authenticated user
    const doctorId = req.user.id;
    if (!doctorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const records = await storage.getDoctorMedicalRecords(doctorId);
    res.json({
      success: true,
      records
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records'
    });
  }
});

// Get doctor's schedule
router.get('/schedule', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Get doctor ID from the authenticated user
    const doctorId = req.user.id;
    if (!doctorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const schedule = await storage.getDoctorSchedule(doctorId);
    res.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule'
    });
  }
});

// Get doctor's patients
router.get('/patients', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Get doctor ID from the authenticated user
    const doctorId = req.user.id;
    if (!doctorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const patients = await storage.getDoctorPatients(doctorId);
    res.json({
      success: true,
      patients
    });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
});

// Get doctor's appointments
router.get('/appointments', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Get doctor ID from the authenticated user
    const doctorId = req.user.id;
    if (!doctorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const appointments = await storage.getDoctorAppointments(doctorId);
    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Get all doctors (admin only)
router.get('/', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  console.log('GET /doctors request received');
  console.log('User from request:', req.user);
  
  try {
    // Verify that the user is an admin
    const user = await User.findById(req.user.id);
    console.log('Found user:', user ? { id: user._id, role: user.role } : 'Not found');
    
    if (!user || user.role !== 'admin') {
      console.log('Access denied - not an admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    console.log('Fetching all doctors...');
    const doctors = await Doctor.find({})
      .populate('hospitalAffiliation', 'name address')
      .select('-password -__v');
    
    console.log(`Found ${doctors.length} doctors`);
    
    res.json({ 
      success: true, 
      doctors 
    });
  } catch (error) {
    console.error('Error in GET /doctors:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch doctors' 
    });
  }
});

export function setupDoctorRoutes(app: Express) {
  // Mount the router with /api prefix
  app.use('/api/doctors', router);
} 