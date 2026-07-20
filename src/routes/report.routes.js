import { Router } from 'express';
import { getDashboardKPIs, exportReport } from '../controllers/report.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Admin / Asset Manager only routes
router.get('/dashboard', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), getDashboardKPIs);
router.get('/export', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), exportReport);

export default router;
