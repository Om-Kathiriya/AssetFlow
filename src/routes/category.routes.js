import { Router } from 'express';
import {
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  getCategories,
} from '../controllers/category.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protected user routes
router.get('/', requireAuth, getCategories);

// Admin-only write routes
router.post('/', requireAuth, requireRole('ADMIN'), createCategory);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateCategory);
router.patch('/:id/deactivate', requireAuth, requireRole('ADMIN'), toggleCategoryStatus);

export default router;
