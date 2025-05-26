import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { MongoStorage } from '../storage/mongodb';

const router = Router();
const storage = new MongoStorage();

// Configure multer for file uploads
const storageMulter = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents');
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

// Document upload schema
const documentUploadSchema = z.object({
  type: z.enum(['license', 'id', 'specialization', 'affiliation']),
  doctorId: z.string(),
  description: z.string().optional()
});

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const documentData = documentUploadSchema.parse(req.body);
    
    const document = await storage.addDocument({
      ...documentData,
      url: req.file.path,
      verified: false,
      uploadedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
});

// Verify document
router.post('/:documentId/verify', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { verified, notes } = req.body;

    const document = await storage.verifyDocument(documentId, {
      verified,
      notes,
      verifiedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Document verification status updated',
      document
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to verify document'
    });
  }
});

// Get doctor's documents
router.get('/doctor/:doctorId', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const documents = await storage.getDoctorDocuments(doctorId);
    
    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
});

export default router; 