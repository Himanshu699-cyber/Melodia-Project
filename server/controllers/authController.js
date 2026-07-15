import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'melodify_super_secret_jwt_token_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          plan: user.plan,
          joinedDate: user.joinedDate,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        joinedDate: user.joinedDate,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  const { googleId, email, username, avatarUrl } = req.body;

  try {
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // If user exists with email but not Google ID, link them
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatarUrl && !user.avatarUrl) {
          user.avatarUrl = avatarUrl;
        }
        await user.save();
      }
    } else {
      // Create new Google user
      user = await User.create({
        googleId,
        username,
        email,
        avatarUrl: avatarUrl || undefined,
        plan: 'Free',
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        joinedDate: user.joinedDate,
      },
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password - Request reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate random 6-character code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user schema
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes valid
    await user.save();

    res.json({
      success: true,
      message: 'Reset code generated successfully',
      resetCode, // Expose for mock demo, normally sent via email
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login.',
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile (Me)
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites')
      .populate({
        path: 'recentlyPlayed.track',
        model: 'Track',
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        joinedDate: user.joinedDate,
        favorites: user.favorites,
        recentlyPlayed: user.recentlyPlayed.map(item => ({
          track: item.track,
          playedAt: item.playedAt
        })),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
