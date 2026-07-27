import { Router } from 'express';
import {
  allocateAsset,
  returnAsset,
  getAllocations,
  getOverdueAllocations,
} from '../controllers/allocation.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Allocation routes
router.get('/', requireAuth, getAllocations);
router.post('/', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), allocateAsset);
router.post('/:id/return', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), returnAsset);
router.get('/overdue', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), getOverdueAllocations);

export default router;
