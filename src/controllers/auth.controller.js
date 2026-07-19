import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/conn.js';

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'af-dev-secret-key-12345-xyz',
    { expiresIn: '7d' }
  );
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

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id, user.role);

    return res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
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
