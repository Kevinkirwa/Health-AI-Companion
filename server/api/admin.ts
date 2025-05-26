import { Express, Request, Response } from 'express';
import { IStorage } from '../storage';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/User';
import { Hospital } from '../models/Hospital';
import { Doctor } from '../models/Doctor';
import { Appointment } from '../models/Appointment';

export function setupAdminRoutes(app: Express, storage: IStorage) {
  // Admin stats
  app.get('/api/admin/stats', authenticateToken, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        });
      }

      const stats = await storage.getAdminStats();
      res.json({ 
        success: true, 
        stats 
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch admin stats' 
      });
    }
  });

  // Get all users
  app.get('/api/users', authenticateToken, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        });
      }

      const users = await User.find({})
        .select('-password -__v');
      
      res.json({ 
        success: true, 
        users 
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch users' 
      });
    }
  });

  // Get all appointments
  app.get('/api/appointments/all', authenticateToken, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        });
      }

      const appointments = await Appointment.find({})
        .populate('userId', 'name email')
        .populate('hospitalId', 'name address')
        .select('-__v');
      
      res.json({ 
        success: true, 
        appointments 
      });
    } catch (error) {
      console.error('Error fetching all appointments:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch appointments' 
      });
    }
  });
} 