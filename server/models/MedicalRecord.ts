import mongoose, { Schema } from 'mongoose';

const medicalRecordSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  prescription: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: true
});

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema); 