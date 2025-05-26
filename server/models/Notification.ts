import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'verification', 'urgent', 'general'],
    default: 'general'
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  actions: [{
    label: String,
    onClick: String
  }]
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema); 