import prisma from '../config/conn.js';

// Request a Transfer of an Asset
export const requestTransfer = async (req, res) => {
  try {
    const { assetId, receiverId, notes } = req.body;

    if (!assetId || !receiverId) {
      return res.status(400).json({ error: 'Asset ID and receiver employee ID are required' });
    }

    // Verify Asset exists and is currently ALLOCATED
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    if (asset.status !== 'ALLOCATED') {
      return res.status(400).json({
        error: `Asset is not currently allocated to anyone. Status: ${asset.status}`
      });
    }

    // Find the active allocation to identify the sender (current holder)
    const activeAllocation = await prisma.allocation.findFirst({
      where: {
        assetId,
        status: { in: ['ACTIVE', 'OVERDUE'] }
      },
      include: { user: true }
    });

    if (!activeAllocation) {
      return res.status(400).json({ error: 'No active allocation record found for this asset' });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver employee not found' });
    }

    // Prevent transferring to the same person
    if (activeAllocation.userId === receiverId) {
      return res.status(400).json({ error: 'Asset is already allocated to this employee' });
    }

    // Prevent duplicate pending transfers for the same asset
    const existingPending = await prisma.transferRequest.findFirst({
      where: {
        assetId,
        status: 'PENDING'
      }
    });
    if (existingPending) {
      return res.status(400).json({ error: 'A pending transfer request already exists for this asset' });
    }

    const transfer = await prisma.transferRequest.create({
      data: {
        assetId,
        senderId: activeAllocation.userId,
        receiverId,
        notes: notes || null,
        status: 'PENDING'
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } }
      }
    });

    return res.status(201).json({
      message: 'Transfer request submitted successfully',
      transfer
    });
  } catch (error) {
    console.error('Request transfer error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve or Reject a Transfer Request (Admin / Manager Only)
export const handleTransferDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Decision status (APPROVED or REJECTED) is required' });
    }

    const decision = status.toUpperCase();
    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      return res.status(400).json({ error: 'Decision status must be APPROVED or REJECTED' });
    }

    // Fetch the transfer request
    const transfer = await prisma.transferRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        sender: true,
        receiver: true
      }
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer request not found' });
    }

    if (transfer.status !== 'PENDING') {
      return res.status(400).json({ error: `This transfer request has already been ${transfer.status.toLowerCase()}` });
    }

    // If REJECTED, update transfer status and return
    if (decision === 'REJECTED') {
      const rejected = await prisma.transferRequest.update({
        where: { id },
        data: { status: 'REJECTED' }
      });
      return res.status(200).json({
        message: 'Transfer request rejected',
        transfer: rejected
      });
    }

    // If APPROVED, run transactions to swap allocations and close request
    const result = await prisma.$transaction(async (tx) => {
      // 1. Double check the asset status is still ALLOCATED
      const asset = await tx.asset.findUnique({
        where: { id: transfer.assetId }
      });
      if (asset.status !== 'ALLOCATED') {
        throw new Error('Asset status is no longer allocated, transfer invalid');
      }

      // 2. Locate active allocation for the sender
      const activeAllocation = await tx.allocation.findFirst({
        where: {
          assetId: transfer.assetId,
          userId: transfer.senderId,
          status: { in: ['ACTIVE', 'OVERDUE'] }
        }
      });
      if (!activeAllocation) {
        throw new Error('Active sender allocation record not found. Transfer cannot be completed.');
      }

      // 3. Mark the sender's allocation as RETURNED (due to transfer)
      await tx.allocation.update({
        where: { id: activeAllocation.id },
        data: {
          actualReturnDate: new Date(),
          status: 'RETURNED',
          conditionOnReturn: `Transferred to ${transfer.receiver.name}`
        }
      });

      // 4. Create new Allocation for the receiver
      const newAllocation = await tx.allocation.create({
        data: {
          assetId: transfer.assetId,
          userId: transfer.receiverId,
          // Inherit the same return schedule or set default 30 days
          expectedReturnDate: activeAllocation.expectedReturnDate,
          conditionOnAllocation: `Received via transfer from ${transfer.sender.name}`,
          status: 'ACTIVE'
        }
      });

      // 5. Update the Transfer Request status to APPROVED
      const approvedTransfer = await tx.transferRequest.update({
        where: { id },
        data: { status: 'APPROVED' }
      });

      // 6. Create Asset History log
      await tx.assetHistory.create({
        data: {
          assetId: transfer.assetId,
          action: 'STATUS_CHANGE',
          oldStatus: 'ALLOCATED',
          newStatus: 'ALLOCATED',
          userId: req.user.id,
          notes: `Transferred from ${transfer.sender.name} to ${transfer.receiver.name}. Approved by admin.`
        }
      });

      return { approvedTransfer, newAllocation };
    });

    return res.status(200).json({
      message: 'Transfer request approved and asset successfully re-allocated',
      transfer: result.approvedTransfer,
      newAllocation: result.newAllocation
    });
  } catch (error) {
    console.error('Handle transfer decision error:', error.message);
    if (error.message.includes('Transfer cannot be completed') || error.message.includes('transfer invalid')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// List all transfer requests
export const getTransferRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const transfers = await prisma.transferRequest.findMany({
      where,
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ transfers });
  } catch (error) {
    console.error('Get transfer requests error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
