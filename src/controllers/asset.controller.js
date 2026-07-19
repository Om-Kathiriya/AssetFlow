import prisma from '../config/conn.js';

// Lifecycle transitions rules mapping
const VALID_TRANSITIONS = {
  AVAILABLE: ['ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'],
  ALLOCATED: ['AVAILABLE', 'UNDER_MAINTENANCE', 'LOST'],
  RESERVED: ['ALLOCATED', 'AVAILABLE'],
  UNDER_MAINTENANCE: ['AVAILABLE', 'RETIRED', 'DISPOSED'],
  LOST: ['AVAILABLE', 'RETIRED', 'DISPOSED'],
  RETIRED: [], // Terminal state
  DISPOSED: [] // Terminal state
};

// Check if transition is valid
const isValidTransition = (current, target) => {
  if (current === target) return true;
  const allowed = VALID_TRANSITIONS[current];
  return allowed && allowed.includes(target);
};

// Register a new Asset
export const registerAsset = async (req, res) => {
  try {
    const {
      name,
      serialNumber,
      categoryId,
      departmentId,
      location,
      purchaseDate,
      cost,
      notes
    } = req.body;

    if (!name || !serialNumber || !categoryId || !location) {
      return res.status(400).json({ error: 'Name, serial number, category, and location are required' });
    }

    // Verify unique serialNumber
    const existingSerial = await prisma.asset.findUnique({
      where: { serialNumber }
    });
    if (existingSerial) {
      return res.status(400).json({ error: 'Asset with this serial number is already registered' });
    }

    // Validate Category exists and is active
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      return res.status(400).json({ error: 'Selected category not found' });
    }
    if (!category.isActive) {
      return res.status(400).json({ error: 'Selected category is currently inactive' });
    }

    // Validate Department (if provided)
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });
      if (!department) {
        return res.status(400).json({ error: 'Selected department not found' });
      }
      if (!department.isActive) {
        return res.status(400).json({ error: 'Selected department is currently inactive' });
      }
    }

    // Auto-generate Asset Tag (AF-XXXX)
    // Runs inside transaction to ensure we increment correctly
    const result = await prisma.$transaction(async (tx) => {
      const lastAsset = await tx.asset.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { assetTag: true }
      });

      let nextNum = 1;
      if (lastAsset && lastAsset.assetTag.startsWith('AF-')) {
        const lastNum = parseInt(lastAsset.assetTag.split('-')[1], 10);
        if (!isNaN(lastNum)) nextNum = lastNum + 1;
      }
      const assetTag = `AF-${String(nextNum).padStart(4, '0')}`;

      // Create Asset
      const newAsset = await tx.asset.create({
        data: {
          assetTag,
          name,
          serialNumber,
          categoryId,
          departmentId: departmentId || null,
          location,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          cost: cost ? parseFloat(cost) : null,
          notes: notes || null,
          status: 'AVAILABLE'
        },
        include: {
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } }
        }
      });

      // Create initial history log
      await tx.assetHistory.create({
        data: {
          assetId: newAsset.id,
          action: 'REGISTER',
          oldStatus: null,
          newStatus: 'AVAILABLE',
          userId: req.user.id,
          notes: 'Initial asset registration'
        }
      });

      return newAsset;
    });

    return res.status(201).json({
      message: 'Asset registered successfully',
      asset: result
    });
  } catch (error) {
    console.error('Register asset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Search & filter Assets
export const getAssets = async (req, res) => {
  try {
    const { search, categoryId, departmentId, status, location } = req.query;

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { assetTag: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } }
      },
      orderBy: { assetTag: 'asc' }
    });

    return res.status(200).json({ assets });
  } catch (error) {
    console.error('Get assets error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single asset details with complete history log
export const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, warrantyPeriod: true } },
        department: { select: { id: true, name: true } },
        history: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    return res.status(200).json({ asset });
  } catch (error) {
    console.error('Get asset by ID error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update General Asset information (does not modify status directly)
export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      categoryId,
      departmentId,
      location,
      purchaseDate,
      cost,
      notes
    } = req.body;

    const asset = await prisma.asset.findUnique({
      where: { id }
    });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Validate Category if changing
    if (categoryId && categoryId !== asset.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      if (!category || !category.isActive) {
        return res.status(400).json({ error: 'Selected active category not found' });
      }
    }

    // Validate Department if changing
    if (departmentId && departmentId !== asset.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });
      if (!department || !department.isActive) {
        return res.status(400).json({ error: 'Selected active department not found' });
      }
    }

    // Perform update and log action
    const updated = await prisma.$transaction(async (tx) => {
      const updatedAsset = await tx.asset.update({
        where: { id },
        data: {
          name: name !== undefined ? name : asset.name,
          categoryId: categoryId !== undefined ? categoryId : asset.categoryId,
          departmentId: departmentId !== undefined ? departmentId : asset.departmentId,
          location: location !== undefined ? location : asset.location,
          purchaseDate: purchaseDate !== undefined ? (purchaseDate ? new Date(purchaseDate) : null) : asset.purchaseDate,
          cost: cost !== undefined ? (cost ? parseFloat(cost) : null) : asset.cost,
          notes: notes !== undefined ? notes : asset.notes
        },
        include: {
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } }
        }
      });

      await tx.assetHistory.create({
        data: {
          assetId: id,
          action: 'UPDATE',
          oldStatus: asset.status,
          newStatus: asset.status,
          userId: req.user.id,
          notes: 'Asset metadata updated'
        }
      });

      return updatedAsset;
    });

    return res.status(200).json({
      message: 'Asset updated successfully',
      asset: updated
    });
  } catch (error) {
    console.error('Update asset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Transition Asset Status (State Machine logic validation)
export const changeAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'New target status is required' });
    }

    const asset = await prisma.asset.findUnique({
      where: { id }
    });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Verify requested status is valid
    const targetStatus = status.toUpperCase();
    const validStatusEnum = ['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'];
    if (!validStatusEnum.includes(targetStatus)) {
      return res.status(400).json({ error: `Invalid status. Allowed values are: ${validStatusEnum.join(', ')}` });
    }

    // Validate using lifecycle state machine transition rules
    if (!isValidTransition(asset.status, targetStatus)) {
      return res.status(400).json({
        error: `Invalid state transition: Cannot change status from ${asset.status} to ${targetStatus}`
      });
    }

    // Perform update and history log atomically
    const updated = await prisma.$transaction(async (tx) => {
      const updatedAsset = await tx.asset.update({
        where: { id },
        data: { status: targetStatus },
        include: {
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } }
        }
      });

      await tx.assetHistory.create({
        data: {
          assetId: id,
          action: 'STATUS_CHANGE',
          oldStatus: asset.status,
          newStatus: targetStatus,
          userId: req.user.id,
          notes: notes || `Status changed from ${asset.status} to ${targetStatus}`
        }
      });

      return updatedAsset;
    });

    return res.status(200).json({
      message: `Asset status successfully transitioned to ${targetStatus}`,
      asset: updated
    });
  } catch (error) {
    console.error('Change asset status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
