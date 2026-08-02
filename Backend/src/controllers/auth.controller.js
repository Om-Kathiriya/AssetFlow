import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/conn.js';
import { sendOTPEmail } from '../services/email.service.js';

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'af-dev-secret-key-12345-xyz',
    { expiresIn: '7d' }
  );
};

// Generate random 6-digit numeric OTP code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (req, res) => {
  try {
    const { email, username, password, confirmPassword, name } = req.body;

    if (!email || !username || !password || !confirmPassword || !name) {
      return res.status(400).json({ error: 'All fields (email, username, password, confirmPassword, name) are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      if (!existingEmail.isEmailVerified) {
        // User exists but hasn't verified OTP yet — send fresh OTP
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.user.update({
          where: { id: existingEmail.id },
          data: { otpCode, otpExpiresAt }
        });
        await sendOTPEmail(email, otpCode, name);
        return res.status(200).json({
          message: 'Account registered previously but email not verified. A new OTP has been sent to your email.',
          email,
          requiresVerification: true
        });
      }
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Bootstrap logic: first registered user becomes ADMIN
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'EMPLOYEE';

    // Generate 6-digit OTP code (15-min expiry)
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        role,
        isEmailVerified: false,
        otpCode,
        otpExpiresAt
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send OTP Email
    await sendOTPEmail(email, otpCode, name);

    return res.status(201).json({
      message: 'Registration successful! An OTP verification code has been sent to your email.',
      email: user.email,
      requiresVerification: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP code are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (user.isEmailVerified) {
      const token = generateToken(user.id, user.role);
      return res.status(200).json({
        message: 'Email address is already verified',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
        },
        token
      });
    }

    if (!user.otpCode || user.otpCode !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid OTP verification code' });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new code.' });
    }

    // Verify user account
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        otpCode: null,
        otpExpiresAt: null
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true
      }
    });

    return res.status(200).json({
      message: 'Email verified successfully! Please sign in with your credentials.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Internal server error during OTP verification' });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email address is already verified' });
    }

    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt }
    });

    await sendOTPEmail(email, otpCode, user.name);

    return res.status(200).json({
      message: 'A fresh OTP verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Internal server error while resending OTP' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // email field can accept either email or username

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Require email OTP verification if account is not verified yet
    if (!user.isEmailVerified) {
      let otpCode = user.otpCode;
      if (!otpCode || !user.otpExpiresAt || new Date() > new Date(user.otpExpiresAt)) {
        otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.user.update({
          where: { id: user.id },
          data: { otpCode, otpExpiresAt }
        });
        await sendOTPEmail(user.email, otpCode, user.name);
      }

      return res.status(403).json({
        error: 'Email address not verified yet. An OTP has been sent to your email.',
        requiresVerification: true,
        email: user.email
      });
    }

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 200 to prevent user enumeration attacks
      return res.status(200).json({
        message: 'If the email exists, a password reset link has been sent.',
      });
    }

    // Mock reset token generation
    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password-reset' },
      process.env.JWT_SECRET || 'af-dev-secret-key-12345-xyz',
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'If the email exists, a password reset link has been sent.',
      devResetToken: resetToken,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Internal server error during password reset request' });
  }
};
