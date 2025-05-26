import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  preferences?: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
    };
  };
}

export interface IDoctor extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  specialization: string;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export interface IAppointment extends Document {
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reminderChannel: 'email' | 'sms' | 'whatsapp';
}

export interface IStorage {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  // Add other storage methods as needed
} 