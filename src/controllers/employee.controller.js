import prisma from '../config/conn.js';

// Get list of all employees (users) with department relations
export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Promote or modify an employee's role (Admin Only) and log it
export const promoteEmployeeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const validRoles = ['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed roles are: ${validRoles.join(', ')}` });
    }

    // Find the target employee
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // If role is the same, no need to update or log
    if (targetUser.role === role) {
      return res.status(200).json({
        message: 'Employee is already assigned this role',
        user: {
          id: targetUser.id,
          name: targetUser.name,
          role: targetUser.role,
        },
      });
    }

    // Atomically update user role and write log using a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Log the change
      const log = await tx.roleChangeLog.create({
        data: {
          userId: targetUser.id,
          oldRole: targetUser.role,
          newRole: role,
          changedById: req.user.id,
        },
      });

      // 2. Update user
      const updatedUser = await tx.user.update({
        where: { id: targetUser.id },
        data: { role },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      });

      return { updatedUser, log };
    });

    return res.status(200).json({
      message: `Employee role successfully updated to ${role}`,
      user: result.updatedUser,
      log: result.log,
    });
  } catch (error) {
    console.error('Promote employee role error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Retrieve role changes history logs for a specific employee
export const getEmployeeRoleLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const logs = await prisma.roleChangeLog.findMany({
      where: { userId: id },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ logs });
  } catch (error) {
    console.error('Get role logs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
