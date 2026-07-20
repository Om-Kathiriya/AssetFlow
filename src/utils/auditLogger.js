import prisma from '../config/conn.js';

/**
 * Record a system-wide audit log entry
 * @param {Object} params
 * @param {string} params.actorId - ID of user performing action
 * @param {string} params.action - Action verb (e.g., CREATE_ASSET, ROLE_CHANGE, VERIFY_ITEM)
 * @param {string} params.targetEntity - Entity type (e.g., Asset, User, Department)
 * @param {string} [params.targetId] - Target Entity UUID
 * @param {Object|string} [params.details] - Metadata diff or notes
 */
export const logAudit = async ({ actorId, action, targetEntity, targetId = null, details = null }) => {
  try {
    const formattedDetails = details && typeof details === 'object' 
      ? JSON.stringify(details) 
      : details;

    return await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetEntity,
        targetId,
        details: formattedDetails
      }
    });
  } catch (error) {
    console.error('Failed to record system audit log:', error);
    return null;
  }
};
