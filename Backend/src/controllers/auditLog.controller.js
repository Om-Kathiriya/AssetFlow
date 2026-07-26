import prisma from '../config/conn.js';

// Get system activity audit logs (Admin / Asset Manager Only)
export const getAuditLogs = async (req, res) => {
  try {
    const { actorId, action, targetEntity, targetId } = req.query;

    const where = {};
    if (actorId) where.actorId = actorId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (targetEntity) where.targetEntity = { contains: targetEntity, mode: 'insensitive' };
    if (targetId) where.targetId = targetId;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
