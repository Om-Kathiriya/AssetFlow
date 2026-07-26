import { Router } from 'express';
import {
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  getDepartments,
} from '../controllers/department.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protected user routes
router.get('/', requireAuth, getDepartments);

// Admin-only write routes
router.post('/', requireAuth, requireRole('ADMIN'), createDepartment);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateDepartment);
router.patch('/:id/deactivate', requireAuth, requireRole('ADMIN'), toggleDepartmentStatus);

export default router;
