import prisma from '../config/conn.js';

// Create a new Resource Booking
export const createBooking = async (req, res) => {
  try {
    const { assetId, startTime, endTime } = req.body;

    if (!assetId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Asset ID, start time, and end time are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date formats provided' });
    }

    if (start <= new Date()) {
      return res.status(400).json({ error: 'Start time must be in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ error: 'End time must be after the start time' });
    }

    // Verify Asset exists and is bookable
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (!asset.isBookable) {
      return res.status(400).json({ error: 'This asset is not registered as a bookable resource' });
    }

    // Check for overlapping bookings
    const overlap = await prisma.booking.findFirst({
      where: {
        assetId,
        status: { in: ['UPCOMING', 'ONGOING'] },
        startTime: { lt: end },
        endTime: { gt: start }
      }
    });

    if (overlap) {
      return res.status(400).json({
        error: 'Time slot conflict: This resource is already reserved during the requested period'
      });
    }

    // Create the booking record
    const booking = await prisma.booking.create({
      data: {
        assetId,
        userId: req.user.id,
        startTime: start,
        endTime: end,
        status: 'UPCOMING'
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    return res.status(201).json({
      message: 'Resource booked successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get List of Bookings with Lifecycle status sweep
export const getBookings = async (req, res) => {
  try {
    const { assetId, userId, status } = req.query;
    const now = new Date();

    // 1. Status Sweep: Auto-complete finished bookings
    await prisma.booking.updateMany({
      where: {
        status: { in: ['UPCOMING', 'ONGOING'] },
        endTime: { lt: now }
      },
      data: { status: 'COMPLETED' }
    });

    // 2. Status Sweep: Auto-start upcoming bookings
    await prisma.booking.updateMany({
      where: {
        status: 'UPCOMING',
        startTime: { lte: now },
        endTime: { gte: now }
      },
      data: { status: 'ONGOING' }
    });

    // 3. Query bookings
    const where = {};
    if (assetId) where.assetId = assetId;
    if (userId) where.userId = userId;
    if (status) {
      where.status = status.toUpperCase();
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        asset: { select: { id: true, assetTag: true, name: true, isBookable: true } },
        user: { select: { id: true, name: true, email: true, username: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel a Booking (Creator or Admin only, and must be UPCOMING)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify creator or admin
    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to cancel this booking' });
    }

    // Check status
    if (booking.status !== 'UPCOMING') {
      return res.status(400).json({
        error: `Cannot cancel booking because it is already ${booking.status.toLowerCase()}`
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    return res.status(200).json({
      message: 'Booking cancelled successfully',
      booking: updated
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
