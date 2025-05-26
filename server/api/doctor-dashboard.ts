import { Express, Request, Response } from 'express';
import { IStorage } from '../storage';
import { authenticateToken } from '../middleware/auth';
import { Doctor } from '../models/Doctor';
import { Appointment } from '../models/Appointment';
import { Schedule } from '../models/Schedule';
import { MedicalRecord } from '../models/MedicalRecord';
import { Notification } from '../models/Notification';

export function setupDoctorDashboardRoutes(app: Express, storage: IStorage) {
  // Get doctor's appointments
  app.get('/api/doctors/appointments', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { hospitalId, date } = req.query;
      
      if (!hospitalId || !date) {
        return res.status(400).json({ 
          success: false, 
          message: "Hospital ID and date are required" 
        });
      }

      // Find the doctor
      const doctor = await Doctor.findOne({ 
        _id: req.user.id,
        hospitalId: hospitalId
      });

      if (!doctor) {
        return res.status(404).json({ 
          success: false, 
          message: "Doctor not found for this hospital" 
        });
      }

      // Find appointments for the doctor on the specified date
      const appointments = await Appointment.find({
        doctorId: doctor._id,
        hospitalId: hospitalId,
        date: {
          $gte: new Date(date as string),
          $lt: new Date(new Date(date as string).setDate(new Date(date as string).getDate() + 1))
        }
      }).populate('userId', 'name email');

      res.json({ 
        success: true, 
        appointments 
      });
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch appointments" 
      });
    }
  });

  // Get doctor's patients
  app.get('/api/doctors/patients', authenticateToken, async (req: Request, res: Response) => {
    try {
      const doctor = await Doctor.findById(req.user.id);
      if (!doctor) {
        return res.status(404).json({ 
          success: false, 
          message: "Doctor not found" 
        });
      }

      // Find all appointments for this doctor and get unique patients
      const appointments = await Appointment.find({ doctorId: doctor._id })
        .populate('userId', 'name email phone')
        .distinct('userId');

      res.json({ 
        success: true, 
        patients: appointments 
      });
    } catch (error) {
      console.error("Error fetching doctor patients:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch patients" 
      });
    }
  });

  // Get doctor's medical records
  app.get('/api/doctor-dashboard/medical-records', authenticateToken, async (req: Request, res: Response) => {
    try {
      const doctor = await Doctor.findById(req.user.id);
      if (!doctor) {
        return res.status(404).json({ 
          success: false, 
          message: "Doctor not found" 
        });
      }

      const records = await MedicalRecord.find({ doctorId: doctor._id })
        .populate('patientId', 'name email')
        .sort({ visitDate: -1 });

      res.json({ 
        success: true, 
        records: records.map(record => ({
          id: record._id,
          patientName: record.patientId?.name || 'Unknown',
          patientEmail: record.patientId?.email || 'Unknown',
          visitDate: record.visitDate,
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          notes: record.notes || ''
        }))
      });
    } catch (error) {
      console.error("Error fetching medical records:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch medical records" 
      });
    }
  });

  // Get doctor's notifications
  app.get('/api/doctor-dashboard/notifications', authenticateToken, async (req: Request, res: Response) => {
    try {
      const doctor = await Doctor.findById(req.user.id);
      if (!doctor) {
        return res.status(404).json({ 
          success: false, 
          message: "Doctor not found" 
        });
      }

      const notifications = await Notification.find({ 
        userId: doctor.userId,
        type: { $in: ['appointment', 'system'] }
      })
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({ 
        success: true, 
        notifications: notifications.map(notification => ({
          id: notification._id,
          type: notification.type,
          message: notification.message,
          read: notification.read,
          date: notification.createdAt
        }))
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch notifications" 
      });
    }
  });

  // Get doctor's verification status
  app.get('/api/doctors/verification', authenticateToken, async (req: Request, res: Response) => {
    try {
      const doctor = await Doctor.findById(req.user.id);
      if (!doctor) {
        return res.status(404).json({ 
          success: false, 
          message: "Doctor not found" 
        });
      }

      res.json({ 
        success: true, 
        status: doctor.isVerified ? 'verified' : 'pending',
        progress: doctor.isVerified ? 100 : 50,
        message: doctor.isVerified ? 'Your account is verified' : 'Your verification is pending review'
      });
    } catch (error) {
      console.error("Error fetching verification status:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch verification status" 
      });
    }
  });

  // Get doctor's schedule
  app.get('/api/doctor-dashboard/schedule', authenticateToken, async (req: Request, res: Response) => {
    try {
      const doctor = await Doctor.findById(req.user.id);
      if (!doctor) {
        return res.status(404).json({ 
          success: false, 
          message: "Doctor not found" 
        });
      }

      // Get the current week's schedule
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
      
      const schedule = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        // Get the doctor's schedule for this day of week
        const daySchedule = await Schedule.findOne({
          doctorId: doctor._id,
          dayOfWeek: date.getDay()
        });

        // Generate time slots for each day
        const timeSlots = [];
        if (daySchedule && daySchedule.isAvailable) {
          const startHour = parseInt(daySchedule.startTime.split(':')[0]);
          const endHour = parseInt(daySchedule.endTime.split(':')[0]);
          
          for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += daySchedule.appointmentDuration) {
              const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              const endTime = minute + daySchedule.appointmentDuration >= 60
                ? `${(hour + 1).toString().padStart(2, '0')}:00`
                : `${hour.toString().padStart(2, '0')}:${(minute + daySchedule.appointmentDuration).toString().padStart(2, '0')}`;
              
              // Check if this time slot is during break
              const isDuringBreak = daySchedule.breakStart && daySchedule.breakEnd
                ? startTime >= daySchedule.breakStart && startTime < daySchedule.breakEnd
                : false;

              // Check if this date is in exceptions
              const exception = daySchedule.exceptions?.find(e => 
                e.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
              );

              timeSlots.push({
                start: startTime,
                end: endTime,
                isAvailable: !isDuringBreak && (!exception || exception.isAvailable)
              });
            }
          }
        }

        schedule.push({
          id: date.toISOString(),
          hospitalId: doctor.hospitalId,
          date: date.toISOString().split('T')[0],
          timeSlots
        });
      }

      res.json({ 
        success: true, 
        schedule 
      });
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch schedule" 
      });
    }
  });
} 