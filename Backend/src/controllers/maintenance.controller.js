import prisma from '../config/conn.js';

// Create a new Maintenance Request
export const createMaintenanceRequest = async (req, res) => {
  try {
    const { assetId, issueDescription } = req.body;

    if (!assetId || !issueDescription) {
      return res.status(400).json({ error: 'Asset ID and issue description are required' });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const maintenance = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        reporterId: req.user.id,
        issueDescription,
        status: 'PENDING'
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        reporter: { select: { id: true, name: true, email: true } }
      }
    });

    return res.status(201).json({
      message: 'Maintenance request reported successfully',
      maintenance
    });
  } catch (error) {
    console.error('Create maintenance request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve or Reject Maintenance Request (Admin / Asset Manager Only)
export const handleMaintenanceApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, technicianId } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Decision status (APPROVED or REJECTED) is required' });
    }

    const decision = status.toUpperCase();
    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    }

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: `Request has already been ${request.status.toLowerCase()}` });
    }

    const techId = technicianId ? String(technicianId).trim() : null;

    // Verify technician if provided
    if (techId) {
      const tech = await prisma.user.findUnique({
        where: { id: techId }
      });
      if (!tech) {
        return res.status(404).json({ error: 'Specified technician user not found' });
      }
    }

    if (decision === 'REJECTED') {
      const rejected = await prisma.maintenanceRequest.update({
        where: { id },
        data: { status: 'REJECTED' }
      });
      return res.status(200).json({
        message: 'Maintenance request rejected',
        maintenance: rejected
      });
    }

    // If APPROVED, update request AND switch asset status to UNDER_MAINTENANCE atomically
    const result = await prisma.$transaction(async (tx) => {
      const approved = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: techId ? 'IN_PROGRESS' : 'APPROVED',
          technicianId: techId || null
        },
        include: {
          asset: { select: { id: true, assetTag: true, name: true } },
          reporter: { select: { id: true, name: true } },
          technician: { select: { id: true, name: true } }
        }
      });

      // Update Asset status to UNDER_MAINTENANCE
      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: 'UNDER_MAINTENANCE' }
      });

      // Create Asset History log
      await tx.assetHistory.create({
        data: {
          assetId: request.assetId,
          action: 'STATUS_CHANGE',
          oldStatus: request.asset.status,
          newStatus: 'UNDER_MAINTENANCE',
          userId: req.user.id,
          notes: `Maintenance request approved. Issue: ${request.issueDescription}`
        }
      });

      return approved;
    });

    return res.status(200).json({
      message: 'Maintenance request approved and asset status set to UNDER_MAINTENANCE',
      maintenance: result
    });
  } catch (error) {
    console.error('Handle maintenance approval error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Assign Technician to Maintenance Request (Admin / Manager Only)
export const assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({ error: 'Technician ID is required' });
    }

    const techId = String(technicianId).trim();

    const tech = await prisma.user.findUnique({
      where: { id: techId }
    });
    if (!tech) {
      return res.status(404).json({ error: 'Technician user not found' });
    }

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id }
    });
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        technicianId: techId,
        status: request.status === 'APPROVED' ? 'IN_PROGRESS' : request.status
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        technician: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    return res.status(200).json({
      message: 'Technician assigned successfully',
      maintenance: updated
    });
  } catch (error) {
    console.error('Assign technician error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update Progress or Resolve Maintenance (Admin, Manager, or Assigned Technician)
export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, repairCost, resolutionNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Target status (IN_PROGRESS or RESOLVED) is required' });
    }

    const targetStatus = status.toUpperCase();
    if (targetStatus !== 'IN_PROGRESS' && targetStatus !== 'RESOLVED') {
      return res.status(400).json({ error: 'Status must be IN_PROGRESS or RESOLVED' });
    }

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true }
    });
    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Authorization: Admin, Asset Manager, or the assigned Technician
    const isAssignedTech = request.technicianId === req.user.id;
    const isAdminOrManager = req.user.role === 'ADMIN' || req.user.role === 'ASSET_MANAGER';
    if (!isAssignedTech && !isAdminOrManager) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to update this ticket' });
    }

    if (request.status === 'RESOLVED' || request.status === 'REJECTED') {
      return res.status(400).json({ error: `Cannot update a ticket that is already ${request.status.toLowerCase()}` });
    }

    if (targetStatus === 'IN_PROGRESS') {
      const updated = await prisma.maintenanceRequest.update({
        where: { id },
        data: { status: 'IN_PROGRESS' }
      });
      return res.status(200).json({
        message: 'Maintenance set to IN_PROGRESS',
        maintenance: updated
      });
    }

    // Target status is RESOLVED: restore Asset status to AVAILABLE
    const result = await prisma.$transaction(async (tx) => {
      const resolved = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          repairCost: repairCost ? parseFloat(repairCost) : request.repairCost,
          resolutionNotes: resolutionNotes || request.resolutionNotes
        },
        include: {
          asset: { select: { id: true, assetTag: true, name: true } },
          technician: { select: { id: true, name: true } }
        }
      });

      // Restore Asset status back to AVAILABLE
      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: 'AVAILABLE' }
      });

      // Create Asset History log
      await tx.assetHistory.create({
        data: {
          assetId: request.assetId,
          action: 'STATUS_CHANGE',
          oldStatus: 'UNDER_MAINTENANCE',
          newStatus: 'AVAILABLE',
          userId: req.user.id,
          notes: `Maintenance resolved. Cost: $${repairCost || 0}. Notes: ${resolutionNotes || 'N/A'}`
        }
      });

      return resolved;
    });

    return res.status(200).json({
      message: 'Maintenance resolved and asset status restored to AVAILABLE',
      maintenance: result
    });
  } catch (error) {
    console.error('Update maintenance status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get List of Maintenance Requests (Kanban board grouping & filtering support)
export const getMaintenanceRequests = async (req, res) => {
  try {
    const { status, assetId, reporterId, technicianId, groupByStatus } = req.query;

    const where = {};
    if (status) where.status = status.toUpperCase();
    if (assetId) where.assetId = assetId;
    if (reporterId) where.reporterId = reporterId;
    if (technicianId) where.technicianId = technicianId;

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        asset: { select: { id: true, assetTag: true, name: true, location: true } },
        reporter: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // If Kanban board structure is requested
    if (groupByStatus === 'true') {
      const kanban = {
        PENDING: [],
        APPROVED: [],
        IN_PROGRESS: [],
        RESOLVED: [],
        REJECTED: []
      };
      requests.forEach((r) => {
        if (kanban[r.status]) {
          kanban[r.status].push(r);
        }
      });
      return res.status(200).json({ kanban });
    }

    return res.status(200).json({ maintenanceRequests: requests });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
