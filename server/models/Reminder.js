const { Schema, model } = require('mongoose');

const reminderSchema = new Schema({
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  type: {
    type: String,
    enum: ['24-hour', '2-hour', '1-hour'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  sentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
reminderSchema.index({ appointmentId: 1, type: 1 });
reminderSchema.index({ status: 1, sentAt: 1 });

const Reminder = model('Reminder', reminderSchema);

module.exports = Reminder; 