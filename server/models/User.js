const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin'],
    default: 'user'
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        // Basic phone number validation for Kenya
        return /^(\+254|0)[17]\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Kenyan phone number!`
    }
  },
  whatsappNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        // Basic phone number validation for Kenya
        return /^(\+254|0)[17]\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Kenyan phone number!`
    }
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [{
    type: String,
    trim: true
  }],
  chronicConditions: [{
    type: String,
    trim: true
  }],
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String
  }],
  savedHospitals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  }],
  preferences: {
    darkMode: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    },
    notificationChannels: {
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
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    console.log('Password modification detected for user:', this.email);
    console.log('Password details:', {
      length: this.password ? this.password.length : 0,
      prefix: this.password ? this.password.substring(0, 7) + '...' : 'None',
      isModified: this.isModified('password')
    });
    
    // Password is already hashed by the auth routes
    next();
  } catch (error) {
    console.error('Error in password pre-save hook:', error);
    next(error);
  }
});

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = async function(emailOrUsername) {
  console.log('Finding user by email/username:', emailOrUsername);
  const user = await this.findOne({
    $or: [
      { email: emailOrUsername.toLowerCase() },
      { username: emailOrUsername }
    ]
  });
  console.log('Found user:', user ? {
    id: user._id,
    email: user.email,
    username: user.username,
    hasPassword: !!user.password,
    passwordLength: user.password ? user.password.length : 0
  } : 'No user found');
  return user;
};

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing passwords for user:', this.email);
    console.log('Password details:', {
      storedLength: this.password ? this.password.length : 0,
      storedPrefix: this.password ? this.password.substring(0, 7) + '...' : 'None',
      candidateLength: candidatePassword ? candidatePassword.length : 0,
      candidatePrefix: candidatePassword ? candidatePassword.substring(0, 7) + '...' : 'None'
    });
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password comparison result:', result);
    
    if (!result) {
      console.log('First comparison failed, trying with original password');
      // If comparison fails, try with the original password
      const result2 = await bcrypt.compare(candidatePassword, this.password);
      console.log('Second comparison result:', result2);
      return result2;
    }
    
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

// Drop existing indexes and create new ones with explicit names
userSchema.index({ username: 1 }, { 
  name: 'username_unique',
  unique: true,
  sparse: true,
  background: true
});

userSchema.index({ email: 1 }, { 
  name: 'email_unique',
  unique: true,
  sparse: true,
  background: true
});

const User = mongoose.model('User', userSchema);

module.exports = User; 