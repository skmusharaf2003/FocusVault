import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  dateOfBirth: {
    type: Date
  },
  mobile: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    defaultStudyTime: {
      type: Number,
      default: 60
    },
    preferredStudyTime: {
      type: String,
      default: 'evening'
    },
    preferredStudyHours: {
      start: {
        type: String,
        default: '19:00'
      },
      end: {
        type: String,
        default: '21:00'
      }
    },
    studyDays: {
      type: [String],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    studyReminders: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalStudyTime: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    highestStreak: {
      type: Number,
      default: 0
    },
    lastStudyDate: {
      type: Date
    }
  },
  lastNotificationSent: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  return userObject;
};

export default mongoose.model('User', userSchema);