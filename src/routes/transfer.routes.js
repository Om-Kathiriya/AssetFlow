import { Router } from 'express';
import {
  requestTransfer,
  handleTransferDecision,
  getTransferRequests,
} from '../controllers/transfer.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protected user routes
router.post('/', requireAuth, requestTransfer);
router.get('/', requireAuth, getTransferRequests);

// Admin / Asset Manager decision route
router.patch('/:id/status', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), handleTransferDecision);

export default router;
