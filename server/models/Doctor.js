const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic phone number validation for Kenya
        return /^(\+254|0)[17]\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Kenyan phone number!`
    }
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic phone number validation for Kenya
        return /^(\+254|0)[17]\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Kenyan phone number!`
    }
  },
  yearsOfExperience: {
    type: Number,
    min: 0
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  languages: [{
    type: String,
    trim: true
  }],
  consultationFee: {
    type: Number,
    min: 0
  },
  availability: {
    type: Map,
    of: [{
      start: { type: String, required: true },
      end: { type: String, required: true }
    }],
    default: new Map([
      ['monday', []],
      ['tuesday', []],
      ['wednesday', []],
      ['thursday', []],
      ['friday', []],
      ['saturday', []],
      ['sunday', []]
    ])
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  notificationPreferences: {
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
      default: true
    }
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

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = { Doctor }; 