import { Express, Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { Appointment } from '../models/Appointment';
import { authenticateToken } from '../middleware/auth';
import { ReminderService } from '../services/reminderService';

const router = Router();

// Appointment creation schema
const appointmentSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  hospitalId: z.string(),
  date: z.string(),
  time: z.string(),
  type: z.string(),
  notes: z.string().optional(),
  reminderChannel: z.enum(['sms', 'whatsapp', 'email'])
});

// Create a new appointment
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const data = appointmentSchema.parse(req.body);
    
    const appointment = new Appointment({
      ...data,
      status: 'scheduled',
      reminderStatus: 'pending'
    });

    await appointment.save();

    // Send initial confirmation
    await ReminderService.sendReminder(appointment);

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
      success: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid appointment data',
        errors: error.errors,
        success: false
      });
    }
    console.error('Error creating appointment:', error);
    res.status(500).json({
      message: 'Failed to create appointment',
      success: false
    });
  }
});

// Get appointments for a patient
router.get('/patient/:patientId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name specialty')
      .populate('hospitalId', 'name address')
      .sort({ date: 1 });

    res.json({
      appointments,
      success: true
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      message: 'Failed to fetch appointments',
      success: false
    });
  }
});

// Get appointments for a doctor
router.get('/doctor/:doctorId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'name phone email')
      .populate('hospitalId', 'name address')
      .sort({ date: 1 });

    res.json({
      appointments,
      success: true
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      message: 'Failed to fetch appointments',
      success: false
    });
  }
});

// Update appointment status
router.patch('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        success: false
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        success: false
      });
    }

    // If appointment is cancelled, send notification
    if (status === 'cancelled') {
      await ReminderService.sendReminder(appointment);
    }

    res.json({
      message: 'Appointment status updated',
      appointment,
      success: true
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      message: 'Failed to update appointment',
      success: false
    });
  }
});

// Reschedule appointment
router.patch('/:id/reschedule', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { date, time } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({
        message: 'Date and time are required',
        success: false
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        date,
        time,
        reminderSent: false,
        reminderStatus: 'pending'
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        success: false
      });
    }

    // Send rescheduling notification
    await ReminderService.sendReminder(appointment);

    res.json({
      message: 'Appointment rescheduled',
      appointment,
      success: true
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({
      message: 'Failed to reschedule appointment',
      success: false
    });
  }
});

export function setupAppointmentRoutes(app: Express): void {
  app.use('/api/appointments', router);
} 