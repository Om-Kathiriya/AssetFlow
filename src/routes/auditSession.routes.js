import { Router } from 'express';
import {
  createAuditSession,
  getAuditSessions,
  getAuditSessionById,
  verifyAuditItem,
  completeAuditSession
} from '../controllers/auditSession.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Admin / Asset Manager routes
router.post('/', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), createAuditSession);
router.get('/', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), getAuditSessions);
router.get('/:id', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), getAuditSessionById);
router.patch('/:id/items/:itemId', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), verifyAuditItem);
router.patch('/:id/complete', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), completeAuditSession);

export default router;
