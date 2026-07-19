import prisma from '../config/conn.js';

// Create a new Department
export const createDepartment = async (req, res) => {
  try {
    const { name, parentId, managerId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    // Check unique name
    const existing = await prisma.department.findUnique({
      where: { name },
    });
    if (existing) {
      return res.status(400).json({ error: 'Department name already exists' });
    }

    // Validate parent department
    if (parentId) {
      const parent = await prisma.department.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return res.status(400).json({ error: 'Parent department not found' });
      }
    }

    // Validate manager
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
      });
      if (!manager) {
        return res.status(400).json({ error: 'Manager user not found' });
      }
    }

    const department = await prisma.department.create({
      data: {
        name,
        parentId: parentId || null,
        managerId: managerId || null,
      },
      include: {
        parent: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json({
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    console.error('Create department error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update Department details
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, managerId } = req.body;

    const department = await prisma.department.findUnique({
      where: { id },
    });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check unique name if changing name
    if (name && name !== department.name) {
      const existing = await prisma.department.findUnique({
        where: { name },
      });
      if (existing) {
        return res.status(400).json({ error: 'Department name already exists' });
      }
    }

    // Prevent setting self as parent
    if (parentId && parentId === id) {
      return res.status(400).json({ error: 'A department cannot be its own parent' });
    }

    // Validate and check circular dependency in hierarchy
    if (parentId) {
      const parent = await prisma.department.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return res.status(400).json({ error: 'Parent department not found' });
      }

      // Traverse up parent chain to check cycle
      let currentParentId = parentId;
      while (currentParentId) {
        if (currentParentId === id) {
          return res.status(400).json({ error: 'Circular dependency detected in department hierarchy' });
        }
        const parentDept = await prisma.department.findUnique({
          where: { id: currentParentId },
        });
        currentParentId = parentDept ? parentDept.parentId : null;
      }
    }

    // Validate manager
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
      });
      if (!manager) {
        return res.status(400).json({ error: 'Manager user not found' });
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: name !== undefined ? name : department.name,
        parentId: parentId !== undefined ? parentId : department.parentId,
        managerId: managerId !== undefined ? managerId : department.managerId,
      },
      include: {
        parent: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({
      message: 'Department updated successfully',
      department: updated,
    });
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle Department active state (Deactivate / Activate)
export const toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ error: 'isActive status is required' });
    }

    const department = await prisma.department.findUnique({
      where: { id },
    });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const updated = await prisma.department.update({
      where: { id },
      data: { isActive },
    });

    return res.status(200).json({
      message: `Department ${isActive ? 'activated' : 'deactivated'} successfully`,
      department: updated,
    });
  } catch (error) {
    console.error('Toggle department status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get list of all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
