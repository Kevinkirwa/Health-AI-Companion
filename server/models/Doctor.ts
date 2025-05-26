import mongoose, { Schema, Document } from 'mongoose';
import { Doctor as DoctorType } from '@shared/schema';
import { z } from 'zod';

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  specialty: string;
  hospitalId: mongoose.Types.ObjectId;
  licenseNumber: string;
  availability: string;
  rating: number;
  experience: number;
  education: string[];
  languages: string[];
  consultationFee: number;
  isVerified: boolean;
  verificationDocuments: string[];
  schedule: {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  availability: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  experience: {
    type: Number,
    default: 0
  },
  education: [String],
  languages: [String],
  consultationFee: {
    type: Number,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [String],
  schedule: {
    monday: {
      start: String,
      end: String
    },
    tuesday: {
      start: String,
      end: String
    },
    wednesday: {
      start: String,
      end: String
    },
    thursday: {
      start: String,
      end: String
    },
    friday: {
      start: String,
      end: String
    },
    saturday: {
      start: String,
      end: String
    },
    sunday: {
      start: String,
      end: String
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  },
  toObject: { 
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

// Create a 2dsphere index for geospatial queries
doctorSchema.index({ location: '2dsphere' });

// Index for efficient querying
doctorSchema.index({ specialty: 1, isVerified: 1 });
doctorSchema.index({ hospitalId: 1 });

export const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema);

export const doctorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  specialty: z.string(),
  licenseNumber: z.string(),
  hospitalId: z.string(),
  department: z.string(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']),
  verificationDate: z.date().optional(),
  verificationNotes: z.string().optional(),
  documents: z.array(z.object({
    type: z.string(),
    url: z.string(),
    verified: z.boolean(),
    verificationDate: z.date().optional()
  })),
  availability: z.array(z.object({
    dayOfWeek: z.number(), // 0-6 for Sunday-Saturday
    startTime: z.string(), // HH:mm format
    endTime: z.string(), // HH:mm format
    isAvailable: z.boolean()
  })),
  appointmentDuration: z.number(), // in minutes
  maxAppointmentsPerDay: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Doctor = z.infer<typeof doctorSchema>;

export const appointmentSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  patientId: z.string(),
  hospitalId: z.string(),
  department: z.string(),
  date: z.date(),
  startTime: z.string(), // HH:mm format
  endTime: z.string(), // HH:mm format
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']),
  type: z.enum(['in-person', 'telemedicine']),
  notes: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Appointment = z.infer<typeof appointmentSchema>; 