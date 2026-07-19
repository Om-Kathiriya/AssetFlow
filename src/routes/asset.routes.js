import { Router } from 'express';
import {
  registerAsset,
  getAssets,
  getAssetById,
  updateAsset,
  changeAssetStatus
} from '../controllers/asset.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protected user routes
router.get('/', requireAuth, getAssets);
router.get('/:id', requireAuth, getAssetById);

// Admin-only register route
router.post('/', requireAuth, requireRole('ADMIN'), registerAsset);

// Admin / Asset Manager write routes
router.put('/:id', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), updateAsset);
router.patch('/:id/status', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), changeAssetStatus);

export default router;
