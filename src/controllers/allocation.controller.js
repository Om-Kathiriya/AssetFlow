import prisma from '../config/conn.js';

// Create a new Asset Allocation
export const allocateAsset = async (req, res) => {
  try {
    const { assetId, userId, expectedReturnDate, conditionOnAllocation } = req.body;

    if (!assetId || !userId || !expectedReturnDate) {
      return res.status(400).json({ error: 'Asset ID, User ID, and expected return date are required' });
    }

    const expectedDate = new Date(expectedReturnDate);
    if (isNaN(expectedDate.getTime()) || expectedDate <= new Date()) {
      return res.status(400).json({ error: 'Expected return date must be a valid future date' });
    }

    // Check target Asset exists and is AVAILABLE
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    if (asset.status !== 'AVAILABLE') {
      return res.status(400).json({
        error: `Asset is currently not available for allocation. Current status is: ${asset.status}`
      });
    }

    // Check target User exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(404).json({ error: 'Target employee not found' });
    }

    // Atomically create allocation record and change asset status
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Allocation
      const allocation = await tx.allocation.create({
        data: {
          assetId,
          userId,
          expectedReturnDate: expectedDate,
          conditionOnAllocation: conditionOnAllocation || null,
          status: 'ACTIVE'
        },
        include: {
          asset: { select: { id: true, assetTag: true, name: true } },
          user: { select: { id: true, name: true, email: true } }
        }
      });

      // 2. Update Asset status to ALLOCATED
      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'ALLOCATED' }
      });

      // 3. Create Asset History log
      await tx.assetHistory.create({
        data: {
          assetId,
          action: 'STATUS_CHANGE',
          oldStatus: 'AVAILABLE',
          newStatus: 'ALLOCATED',
          userId: req.user.id,
          notes: `Allocated to ${user.name} (${user.email}). Due: ${expectedDate.toLocaleDateString()}`
        }
      });

      return allocation;
    });

    return res.status(201).json({
      message: 'Asset allocated successfully',
      allocation: result
    });
  } catch (error) {
    console.error('Allocate asset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Process an Asset Return
export const returnAsset = async (req, res) => {
  try {
    const { id } = req.params; // Allocation ID
    const { conditionOnReturn, notes } = req.body;

    const allocation = await prisma.allocation.findUnique({
      where: { id },
      include: {
        asset: true,
        user: true
      }
    });

    if (!allocation) {
      return res.status(404).json({ error: 'Allocation record not found' });
    }

    if (allocation.status === 'RETURNED') {
      return res.status(400).json({ error: 'Asset has already been returned for this allocation' });
    }

    // Transaction to mark returned, update asset, and add history log
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Allocation
      const updatedAllocation = await tx.allocation.update({
        where: { id },
        data: {
          actualReturnDate: new Date(),
          status: 'RETURNED',
          conditionOnReturn: conditionOnReturn || null
        }
      });

      // 2. Update Asset status back to AVAILABLE
      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'AVAILABLE' }
      });

      // 3. Create Asset History log
      await tx.assetHistory.create({
        data: {
          assetId: allocation.assetId,
          action: 'STATUS_CHANGE',
          oldStatus: allocation.asset.status,
          newStatus: 'AVAILABLE',
          userId: req.user.id,
          notes: `Returned by ${allocation.user.name}. Condition: ${conditionOnReturn || 'Good'}. notes: ${notes || ''}`
        }
      });

      return updatedAllocation;
    });

    return res.status(200).json({
      message: 'Asset returned successfully',
      allocation: result
    });
  } catch (error) {
    console.error('Return asset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get list of overdue allocations
export const getOverdueAllocations = async (req, res) => {
  try {
    const now = new Date();

    // 1. Perform background sweep to mark late active allocations as OVERDUE
    await prisma.allocation.updateMany({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: { lt: now }
      },
      data: {
        status: 'OVERDUE'
      }
    });

    // 2. Fetch overdue list
    const overdue = await prisma.allocation.findMany({
      where: { status: 'OVERDUE' },
      include: {
        asset: {
          include: {
            category: { select: { id: true, name: true } }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: { expectedReturnDate: 'asc' }
    });

    return res.status(200).json({ overdue });
  } catch (error) {
    console.error('Get overdue allocations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
