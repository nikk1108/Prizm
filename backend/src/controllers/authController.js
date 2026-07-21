import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import sendEmail from '../services/emailService.js';

// Send JWT token in cookie & response body
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id }, 
    process.env.JWT_SECRET || 'dev_jwt_access_secret_key_change_me_super_secret_key', 
    { expiresIn: '30d' }
  );

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
    options.sameSite = 'none';
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
        verificationBadge: user.verificationBadge,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  // Create verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Create user
  user = await User.create({
    name,
    email,
    password,
    verificationToken
  });

  // Send mock or real verification email
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
  const message = `Welcome to Prizm! Verify your account by clicking: \n\n ${verifyUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify your Prizm Account',
      message
    });

    res.status(201).json({
      success: true,
      message: 'Verification email sent. Please check your inbox'
    });
  } catch (error) {
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email verification could not be sent. Please register again', 500));
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  // Find user and select password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Verify status is active
  if (user.status === 'suspended') {
    return next(new ErrorResponse('Your account has been suspended', 403));
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired verification token', 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('No account associated with that email', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const message = `You requested a password reset. Reset by clicking: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset your Prizm Password',
      message
    });

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Password reset email could not be sent', 500));
  }
});

// @desc    Reset Password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired reset token', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.json({
    success: true,
    user
  });
});

// @desc    Logout User
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});
