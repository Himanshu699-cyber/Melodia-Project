import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: function() { return !this.googleId; }, // required if not Google signin
    minlength: 6,
    select: false,
  },
  avatarUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
  },
  plan: {
    type: String,
    enum: ['Free', 'Pro', 'Enterprise'],
    default: 'Free',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
  }],
  recentlyPlayed: [{
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
    },
    playedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  googleId: {
    type: String,
    unique: true,
    sparse: true, // allows multiple nulls
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
