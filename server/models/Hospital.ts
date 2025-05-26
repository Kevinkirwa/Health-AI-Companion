import mongoose from 'mongoose';
import { Hospital as HospitalType } from '@shared/schema';

export interface IHospital extends mongoose.Document {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  services: string[];
  county: string;
  subCounty: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isReferralHospital: boolean;
  level: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5' | 'Level 6';
  specialties: string[];
  facilities: string[];
  emergencyServices: boolean;
  doctors: mongoose.Types.ObjectId[];
}

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true,
    min: -4.7, // Southernmost point of Kenya
    max: 5.2   // Northernmost point of Kenya
  },
  longitude: {
    type: Number,
    required: true,
    min: 33.9, // Westernmost point of Kenya
    max: 41.9  // Easternmost point of Kenya
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  openHours: {
    type: String,
    required: true
  },
  specialties: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  imageUrl: {
    type: String,
    trim: true
  },
  distance: {
    type: Number,
    default: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  county: { type: String, required: true },
  subCounty: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  facilities: [{ type: String }],
  emergencyServices: { type: Boolean, default: false },
  insuranceAccepted: [{ type: String }],
  isReferralHospital: { type: Boolean, default: false },
  level: { type: String, enum: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'] },
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create a 2dsphere index for geospatial queries
hospitalSchema.index({ location: '2dsphere' });

// Pre-save middleware to ensure coordinates are within Kenya and set location
hospitalSchema.pre('save', function(next) {
  if (this.latitude < -4.7 || this.latitude > 5.2 || 
      this.longitude < 33.9 || this.longitude > 41.9) {
    next(new Error('Hospital location must be within Kenya'));
  }
  
  // Set the location coordinates from latitude and longitude
  this.location = {
    type: 'Point',
    coordinates: [this.longitude, this.latitude]
  };
  
  next();
});

export const Hospital = mongoose.model<IHospital>('Hospital', hospitalSchema); 