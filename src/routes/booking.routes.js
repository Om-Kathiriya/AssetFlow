import { Router } from 'express';
import {
  createBooking,
  getBookings,
  cancelBooking,
} from '../controllers/booking.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All authenticated users can book resources, list bookings, or cancel bookings
router.post('/', requireAuth, createBooking);
router.get('/', requireAuth, getBookings);
router.patch('/:id/cancel', requireAuth, cancelBooking);

export default router;
