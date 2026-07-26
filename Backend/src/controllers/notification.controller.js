import prisma from '../config/conn.js';
import { sendOverdueReminderEmail } from '../services/email.service.js';

// Trigger Overdue Return Reminder Emails (Admin / Manager Only)
export const triggerOverdueReminders = async (req, res) => {
  try {
    const now = new Date();

    // 1. Sweep active allocations past due date
    await prisma.allocation.updateMany({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: { lt: now }
      },
      data: { status: 'OVERDUE' }
    });

    // 2. Fetch overdue items
    const overdueList = await prisma.allocation.findMany({
      where: { status: 'OVERDUE' },
      include: {
        asset: { select: { assetTag: true, name: true } },
        user: { select: { name: true, email: true } }
      }
    });

    if (overdueList.length === 0) {
      return res.status(200).json({
        message: 'No overdue allocations found',
        totalNotificationsSent: 0
      });
    }

    // 3. Send notifications
    const results = [];
    for (const alloc of overdueList) {
      if (!alloc.user || !alloc.asset) {
        console.warn(`[NOTIFICATION WARN] Allocation ${alloc.id} missing user or asset relation, skipping email.`);
        continue;
      }

      try {
        const emailResult = await sendOverdueReminderEmail({
          to: alloc.user.email || 'employee@assetflow.com',
          userName: alloc.user.name || 'Valued Employee',
          assetName: alloc.asset.name || 'Company Asset',
          assetTag: alloc.asset.assetTag || 'N/A',
          expectedReturnDate: alloc.expectedReturnDate || new Date()
        });
        results.push({
          allocationId: alloc.id,
          userEmail: alloc.user.email,
          emailResult
        });
      } catch (err) {
        console.error(`[NOTIFICATION ERROR] Failed sending to allocation ${alloc.id}:`, err.message);
        results.push({
          allocationId: alloc.id,
          userEmail: alloc.user?.email || 'N/A',
          error: err.message
        });
      }
    }

    return res.status(200).json({
      message: `Overdue reminder notifications triggered for ${results.length} employee(s)`,
      totalNotificationsSent: results.length,
      notifications: results
    });
  } catch (error) {
    console.error('Trigger overdue reminders error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
