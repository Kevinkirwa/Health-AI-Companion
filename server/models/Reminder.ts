import mongoose from 'mongoose';
import { Reminder as ReminderType } from '@shared/schema';

const reminderSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['sms', 'whatsapp', 'email']
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'confirmed', 'failed'],
    default: 'pending'
  },
  notificationPreferences: {
    sms: {
      type: Boolean,
      default: false
    },
    whatsapp: {
      type: Boolean,
      default: true
    }
  },
  message: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: null
  },
  response: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient querying
reminderSchema.index({ scheduledFor: 1, status: 1 });
reminderSchema.index({ appointmentId: 1 });
reminderSchema.index({ userId: 1 });
reminderSchema.index({ doctorId: 1 });

export const Reminder = mongoose.model<ReminderType>('Reminder', reminderSchema); 