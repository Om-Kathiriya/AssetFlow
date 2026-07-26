import { Router } from 'express';
import {
  createMaintenanceRequest,
  handleMaintenanceApproval,
  assignTechnician,
  updateMaintenanceStatus,
  getMaintenanceRequests
} from '../controllers/maintenance.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// General endpoints
router.post('/', requireAuth, createMaintenanceRequest);
router.get('/', requireAuth, getMaintenanceRequests);

// Status updates (Technician, Admin, Manager)
router.patch('/:id/status', requireAuth, updateMaintenanceStatus);

// Admin / Asset Manager approval & assignment routes
router.patch('/:id/approval', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), handleMaintenanceApproval);
router.patch('/:id/assign', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), assignTechnician);

export default router;
