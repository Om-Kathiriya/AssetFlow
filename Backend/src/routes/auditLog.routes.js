import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLog.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Admin / Asset Manager only route to view system logs
router.get('/', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), getAuditLogs);

export default router;
