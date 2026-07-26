import prisma from '../config/conn.js';

// Helper to convert array of flat objects to CSV format
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Push Header Line
  csvRows.push(headers.map(h => `"${h}"`).join(','));

  // Push Data Lines
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = (val === null || val === undefined) ? '' : String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

// Executive Dashboard KPI Metrics API
export const getDashboardKPIs = async (req, res) => {
  try {
    const now = new Date();

    // 1. Total Assets & Financial Value
    const totalAssets = await prisma.asset.count();
    const costAggregate = await prisma.asset.aggregate({
      _sum: { cost: true }
    });
    const totalAssetValue = costAggregate._sum.cost || 0;

    // 2. Status Distribution breakdown
    const statusCounts = await prisma.asset.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const statusMap = {
      AVAILABLE: 0,
      ALLOCATED: 0,
      RESERVED: 0,
      UNDER_MAINTENANCE: 0,
      LOST: 0,
      RETIRED: 0,
      DISPOSED: 0
    };
    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count.status;
    });

    // 3. Allocations stats
    const activeAllocations = await prisma.allocation.count({
      where: { status: 'ACTIVE' }
    });
    const overdueAllocations = await prisma.allocation.count({
      where: {
        OR: [
          { status: 'OVERDUE' },
          { status: 'ACTIVE', expectedReturnDate: { lt: now } }
        ]
      }
    });

    // 4. Operations stats
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: { status: 'PENDING' }
    });
    const upcomingBookings = await prisma.booking.count({
      where: { status: 'UPCOMING', startTime: { gt: now } }
    });

    // 5. Recent Activity Feed
    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, role: true } }
      }
    });

    const recentHistory = await prisma.assetHistory.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        user: { select: { id: true, name: true } }
      }
    });

    return res.status(200).json({
      kpis: {
        totalAssets,
        totalAssetValue,
        statusDistribution: statusMap,
        allocations: {
          active: activeAllocations,
          overdue: overdueAllocations
        },
        operations: {
          pendingMaintenance,
          upcomingBookings
        }
      },
      recentActivity: {
        auditLogs: recentAuditLogs,
        assetHistory: recentHistory
      }
    });
  } catch (error) {
    console.error('Get dashboard KPIs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Exportable Custom Reports (JSON or CSV formatted)
export const exportReport = async (req, res) => {
  try {
    const { type, format, categoryId, departmentId, status } = req.query;

    const reportType = type ? type.toLowerCase() : 'assets';
    const isCSV = format && format.toLowerCase() === 'csv';

    let rawData = [];
    let csvData = [];

    if (reportType === 'assets') {
      const where = {};
      if (categoryId) where.categoryId = categoryId;
      if (departmentId) where.departmentId = departmentId;
      if (status) where.status = status.toUpperCase();

      const assets = await prisma.asset.findMany({
        where,
        include: {
          category: { select: { name: true } },
          department: { select: { name: true } }
        },
        orderBy: { assetTag: 'asc' }
      });

      rawData = assets;
      csvData = assets.map((a) => ({
        AssetTag: a.assetTag,
        Name: a.name,
        SerialNumber: a.serialNumber,
        Status: a.status,
        Category: a.category?.name || 'N/A',
        Department: a.department?.name || 'Unassigned',
        Location: a.location,
        Cost: a.cost ? `$${a.cost.toFixed(2)}` : 'N/A',
        PurchaseDate: a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : 'N/A',
        IsBookable: a.isBookable ? 'Yes' : 'No'
      }));
    } else if (reportType === 'allocations') {
      const allocations = await prisma.allocation.findMany({
        include: {
          asset: { select: { assetTag: true, name: true } },
          user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      rawData = allocations;
      csvData = allocations.map((al) => ({
        AllocationID: al.id,
        AssetTag: al.asset.assetTag,
        AssetName: al.asset.name,
        HolderName: al.user.name,
        HolderEmail: al.user.email,
        AllocatedDate: new Date(al.allocatedDate).toLocaleDateString(),
        ExpectedReturnDate: new Date(al.expectedReturnDate).toLocaleDateString(),
        ActualReturnDate: al.actualReturnDate ? new Date(al.actualReturnDate).toLocaleDateString() : 'Active',
        Status: al.status,
        ConditionOnAllocation: al.conditionOnAllocation || 'N/A',
        ConditionOnReturn: al.conditionOnReturn || 'N/A'
      }));
    } else if (reportType === 'maintenance') {
      const maintenance = await prisma.maintenanceRequest.findMany({
        include: {
          asset: { select: { assetTag: true, name: true } },
          reporter: { select: { name: true } },
          technician: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      rawData = maintenance;
      csvData = maintenance.map((m) => ({
        MaintenanceID: m.id,
        AssetTag: m.asset.assetTag,
        AssetName: m.asset.name,
        Reporter: m.reporter.name,
        Technician: m.technician ? m.technician.name : 'Unassigned',
        Issue: m.issueDescription,
        Status: m.status,
        RepairCost: m.repairCost ? `$${m.repairCost.toFixed(2)}` : '$0.00',
        ResolutionNotes: m.resolutionNotes || 'N/A',
        ReportedDate: new Date(m.createdAt).toLocaleDateString()
      }));
    } else {
      return res.status(400).json({ error: 'Invalid report type. Allowed: assets, allocations, maintenance' });
    }

    if (isCSV) {
      const csvString = convertToCSV(csvData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.csv"`);
      return res.status(200).send(csvString);
    }

    return res.status(200).json({
      reportType,
      totalRecords: rawData.length,
      data: rawData
    });
  } catch (error) {
    console.error('Export report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
