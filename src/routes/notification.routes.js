import { Router } from 'express';
import { triggerOverdueReminders } from '../controllers/notification.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Admin / Asset Manager route to trigger overdue email alerts
router.post('/trigger-overdue-reminders', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), triggerOverdueReminders);

export default router;
