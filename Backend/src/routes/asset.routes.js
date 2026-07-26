import { Router } from 'express';
import {
  registerAsset,
  getAssets,
  getAssetById,
  updateAsset,
  changeAssetStatus
} from '../controllers/asset.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

// Protected user routes
router.get('/', requireAuth, getAssets);
router.get('/:id', requireAuth, getAssetById);

// Admin-only register route (supports image upload field 'image')
router.post('/', requireAuth, requireRole('ADMIN'), uploadSingleImage, registerAsset);

// Admin / Asset Manager write routes (supports image upload field 'image')
router.put('/:id', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), uploadSingleImage, updateAsset);
router.patch('/:id/status', requireAuth, requireRole('ADMIN', 'ASSET_MANAGER'), changeAssetStatus);

export default router;
