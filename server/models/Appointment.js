const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine'],
    default: 'consultation'
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  reminderPreferences: {
    sms: {
      type: Boolean,
      default: false
    },
    whatsapp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    intervals: {
      type: [Number],
      default: [24, 1]  // Default reminders at 24 hours and 1 hour before appointment
    }
  },
  remindersSent: [{
    type: {
      type: String,
      enum: ['sms', 'whatsapp', 'email']
    },
    sentAt: Date,
    successful: Boolean
  }],
  symptoms: [{
    type: String,
    trim: true
  }],
  diagnosis: {
    type: String
  },
  prescription: {
    type: String
  },
  followUpDate: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    min: 0
  },
  insuranceClaim: {
    type: Boolean,
    default: false
  },
  insuranceProvider: {
    type: String
  },
  insurancePolicyNumber: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for efficient querying
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = { Appointment }; 