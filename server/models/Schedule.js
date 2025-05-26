const { Schema, model } = require('mongoose');

const scheduleSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  // Can be either a specific day of the week OR a specific date
  dayOfWeek: {
    type: Number,
    min: 0, // Sunday
    max: 6  // Saturday
  },
  // New field for specific available dates
  specificDates: [{
    date: {
      type: Date,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  breakStart: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  breakEnd: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  appointmentDuration: {
    type: Number, // in minutes
    required: true,
    default: 30
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  exceptions: [{
    date: {
      type: Date,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: false
    },
    reason: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
scheduleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
scheduleSchema.index({ doctorId: 1, dayOfWeek: 1 });
scheduleSchema.index({ doctorId: 1, 'exceptions.date': 1 });

const Schedule = model('Schedule', scheduleSchema);

module.exports = Schedule; 