import prisma from '../config/conn.js';
import { logAudit } from '../utils/auditLogger.js';

// Create a Physical Audit Verification Session
export const createAuditSession = async (req, res) => {
  try {
    const { sessionName, location } = req.body;

    if (!sessionName) {
      return res.status(400).json({ error: 'Session name is required' });
    }

    // Find all assets matching location (or all assets if location omitted)
    const assetWhere = {};
    if (location) {
      assetWhere.location = { contains: location, mode: 'insensitive' };
    }

    const assets = await prisma.asset.findMany({
      where: assetWhere,
      select: { id: true }
    });

    if (assets.length === 0) {
      return res.status(400).json({ error: 'No assets found for the specified location' });
    }

    // Atomically create session and populate verification items
    const session = await prisma.$transaction(async (tx) => {
      const createdSession = await tx.physicalAuditSession.create({
        data: {
          sessionName,
          location: location || null,
          createdById: req.user.id,
          status: 'IN_PROGRESS'
        }
      });

      // Create Verification items for each asset
      const itemData = assets.map((a) => ({
        sessionId: createdSession.id,
        assetId: a.id,
        result: 'PENDING'
      }));

      await tx.auditVerificationItem.createMany({
        data: itemData
      });

      return createdSession;
    });

    // Log system audit
    await logAudit({
      actorId: req.user.id,
      action: 'CREATE_AUDIT_SESSION',
      targetEntity: 'PhysicalAuditSession',
      targetId: session.id,
      details: { sessionName, location, itemsPopulated: assets.length }
    });

    return res.status(201).json({
      message: 'Physical audit session initialized successfully',
      session,
      totalAssetsIncluded: assets.length
    });
  } catch (error) {
    console.error('Create audit session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// List all audit sessions with calculated progress metrics
export const getAuditSessions = async (req, res) => {
  try {
    const sessions = await prisma.physicalAuditSession.findMany({
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        items: {
          select: {
            result: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate metrics for each session
    const formatted = sessions.map((s) => {
      const total = s.items.length;
      const verified = s.items.filter((i) => i.result === 'VERIFIED').length;
      const missing = s.items.filter((i) => i.result === 'MISSING').length;
      const discrepancy = s.items.filter((i) => i.result === 'DISCREPANCY').length;
      const pending = s.items.filter((i) => i.result === 'PENDING').length;

      return {
        id: s.id,
        sessionName: s.sessionName,
        location: s.location,
        status: s.status,
        createdBy: s.createdBy,
        metrics: {
          total,
          verified,
          missing,
          discrepancy,
          pending,
          completionPercentage: total > 0 ? Math.round(((total - pending) / total) * 100) : 0
        },
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      };
    });

    return res.status(200).json({ auditSessions: formatted });
  } catch (error) {
    console.error('Get audit sessions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Session details with items
export const getAuditSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.physicalAuditSession.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            asset: { select: { id: true, assetTag: true, name: true, location: true, status: true } },
            verifiedBy: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Audit session not found' });
    }

    return res.status(200).json({ session });
  } catch (error) {
    console.error('Get audit session by ID error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify/Audit an Item within a Session
export const verifyAuditItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { result, notes } = req.body;

    if (!result) {
      return res.status(400).json({ error: 'Verification result (VERIFIED, MISSING, DISCREPANCY) is required' });
    }

    const verificationResult = result.toUpperCase();
    const validResults = ['VERIFIED', 'MISSING', 'DISCREPANCY'];
    if (!validResults.includes(verificationResult)) {
      return res.status(400).json({ error: `Invalid result. Allowed values are: ${validResults.join(', ')}` });
    }

    const item = await prisma.auditVerificationItem.findFirst({
      where: {
        id: itemId,
        sessionId: id
      },
      include: { asset: true }
    });

    if (!item) {
      return res.status(404).json({ error: 'Audit item not found for this session' });
    }

    // Update item and log history if discrepancy/missing
    const updated = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.auditVerificationItem.update({
        where: { id: itemId },
        data: {
          result: verificationResult,
          notes: notes || null,
          verifiedById: req.user.id,
          verifiedAt: new Date()
        },
        include: {
          asset: { select: { id: true, assetTag: true, name: true } },
          verifiedBy: { select: { id: true, name: true } }
        }
      });

      // If MISSING or DISCREPANCY, write an entry to AssetHistory
      if (verificationResult === 'MISSING' || verificationResult === 'DISCREPANCY') {
        await tx.assetHistory.create({
          data: {
            assetId: item.assetId,
            action: 'AUDIT_FLAG',
            oldStatus: item.asset.status,
            newStatus: item.asset.status,
            userId: req.user.id,
            notes: `Physical audit check result: ${verificationResult}. Notes: ${notes || 'N/A'}`
          }
        });
      }

      return updatedItem;
    });

    // Log system audit
    await logAudit({
      actorId: req.user.id,
      action: 'VERIFY_AUDIT_ITEM',
      targetEntity: 'AuditVerificationItem',
      targetId: itemId,
      details: { result: verificationResult, notes }
    });

    return res.status(200).json({
      message: `Audit item verified as ${verificationResult}`,
      item: updated
    });
  } catch (error) {
    console.error('Verify audit item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Complete an Audit Session
export const completeAuditSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.physicalAuditSession.findUnique({
      where: { id }
    });

    if (!session) {
      return res.status(404).json({ error: 'Audit session not found' });
    }

    const updated = await prisma.physicalAuditSession.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    await logAudit({
      actorId: req.user.id,
      action: 'COMPLETE_AUDIT_SESSION',
      targetEntity: 'PhysicalAuditSession',
      targetId: id
    });

    return res.status(200).json({
      message: 'Audit session marked as COMPLETED',
      session: updated
    });
  } catch (error) {
    console.error('Complete audit session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
