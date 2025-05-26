import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token required',
        success: false
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Verify user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
        success: false
      });
    }

    req.user = {
      id: decoded.id,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: 'Invalid token',
        success: false
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: 'Token expired',
        success: false
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      message: 'Authentication failed',
      success: false
    });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Checking admin access...');
  console.log('User from request:', req.user);
  
  try {
    if (!req.user) {
      console.log('No user in request');
      return res.status(401).json({
        message: 'Authentication required',
        success: false
      });
    }

    const user = await User.findById(req.user.id);
    console.log('Found user:', user ? { id: user._id, role: user.role } : 'Not found');
    
    if (!user || user.role !== 'admin') {
      console.log('Access denied - not an admin');
      return res.status(403).json({
        message: 'Admin access required',
        success: false
      });
    }

    console.log('Admin access granted');
    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};

export const isDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
        success: false
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Doctor access required',
        success: false
      });
    }

    next();
  } catch (error) {
    console.error('Error in doctor middleware:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
}; 