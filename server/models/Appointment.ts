import mongoose from 'mongoose';

export interface IAppointment extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: 'scheduled' }
});

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema); 