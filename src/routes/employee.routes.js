import { Router } from 'express';
import {
  getEmployees,
  promoteEmployeeRole,
  getEmployeeRoleLogs,
} from '../controllers/employee.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protected user routes
router.get('/', requireAuth, getEmployees);

// Admin-only write routes
router.patch('/:id/role', requireAuth, requireRole('ADMIN'), promoteEmployeeRole);
router.put('/:id/role', requireAuth, requireRole('ADMIN'), promoteEmployeeRole);
router.get('/:id/role-logs', requireAuth, requireRole('ADMIN'), getEmployeeRoleLogs);

export default router;
