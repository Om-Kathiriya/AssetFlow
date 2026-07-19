import { Router } from 'express';
import { signup, login, forgotPassword } from '../controllers/auth.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected routes (for verification)
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Admin-only route (for verification of requireRole)
router.get('/admin-only', requireAuth, requireRole('ADMIN'), (req, res) => {
  res.status(200).json({ message: 'Welcome Admin!', user: req.user });
});

export default router;
