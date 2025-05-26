const { Schema, model } = require('mongoose');

const firstAidTipSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['emergency', 'injury', 'illness', 'prevention', 'other']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  steps: [{
    type: String,
    required: true
  }],
  warnings: [{
    type: String
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
firstAidTipSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const FirstAidTip = model('FirstAidTip', firstAidTipSchema);

module.exports = FirstAidTip; 