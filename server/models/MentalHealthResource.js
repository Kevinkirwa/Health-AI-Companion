const { Schema, model } = require('mongoose');

const mentalHealthResourceSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['anxiety', 'depression', 'stress', 'trauma', 'general', 'other']
  },
  type: {
    type: String,
    required: true,
    enum: ['article', 'video', 'audio', 'exercise', 'tool', 'other']
  },
  content: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  tags: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
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
mentalHealthResourceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const MentalHealthResource = model('MentalHealthResource', mentalHealthResourceSchema);

module.exports = MentalHealthResource; 