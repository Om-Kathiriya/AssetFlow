import prisma from '../config/conn.js';

// Create a new Category
export const createCategory = async (req, res) => {
  try {
    const { name, warrantyPeriod } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check unique name
    const existing = await prisma.category.findUnique({
      where: { name },
    });
    if (existing) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    // Validate warrantyPeriod
    if (warrantyPeriod !== undefined && warrantyPeriod !== null) {
      const parsed = parseInt(warrantyPeriod, 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ error: 'Warranty period must be a non-negative integer' });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        warrantyPeriod: warrantyPeriod !== undefined && warrantyPeriod !== null ? parseInt(warrantyPeriod, 10) : null,
      },
    });

    return res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an existing Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, warrantyPeriod } = req.body;

    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check unique name if changed
    if (name && name !== category.name) {
      const existing = await prisma.category.findUnique({
        where: { name },
      });
      if (existing) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
    }

    // Validate warrantyPeriod
    if (warrantyPeriod !== undefined && warrantyPeriod !== null) {
      const parsed = parseInt(warrantyPeriod, 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ error: 'Warranty period must be a non-negative integer' });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : category.name,
        warrantyPeriod: warrantyPeriod !== undefined ? (warrantyPeriod !== null ? parseInt(warrantyPeriod, 10) : null) : category.warrantyPeriod,
      },
    });

    return res.status(200).json({
      message: 'Category updated successfully',
      category: updated,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle Category active state (Deactivate / Activate)
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ error: 'isActive status is required' });
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { isActive },
    });

    return res.status(200).json({
      message: `Category ${isActive ? 'activated' : 'deactivated'} successfully`,
      category: updated,
    });
  } catch (error) {
    console.error('Toggle category status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get list of all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
