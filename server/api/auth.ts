import { Express, Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Registration schema
const registrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string(),
  role: z.enum(['patient', 'doctor']).default('patient')
});

// Login schema
const loginSchema = z.object({
  usernameOrEmail: z.string().min(3),
  password: z.string()
});

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registrationSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered',
        success: false
      });
    }

    // Create new user
    const user = new User(data);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      success: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid registration data',
        errors: error.errors,
        success: false
      });
    }
    console.error('Error registering user:', error);
    res.status(500).json({
      message: 'Failed to register user',
      success: false
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: data.usernameOrEmail },
        { email: data.usernameOrEmail }
      ]
    });
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
        success: false
      });
    }

    // Check if user is verified
    if (!user.isVerified && user.role === 'doctor') {
      return res.status(401).json({
        message: 'Account pending verification',
        success: false
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(data.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid credentials',
        success: false
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      success: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid login data',
        errors: error.errors,
        success: false
      });
    }
    console.error('Error logging in:', error);
    res.status(500).json({
      message: 'Error logging in',
      success: false
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        message: 'User not authenticated',
        success: false
      });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      success: true
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      message: 'Failed to get user information',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Since we're using JWT, we don't need to do anything server-side
    // The client will handle removing the token
    res.json({
      message: 'Logged out successfully',
      success: true
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      message: 'Failed to logout',
      success: false
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { name, phone },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user,
      success: true
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      success: false
    });
  }
});

export function setupAuthRoutes(app: Express): void {
  app.use('/api/auth', router);
} 