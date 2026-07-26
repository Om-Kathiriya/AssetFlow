import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, ArrowRightLeft } from 'lucide-react';

export const InitiateTransferModal = ({ isOpen, onClose, onRefresh, assets = [], employees = [] }) => {
  const [assetId, setAssetId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAssetId('');
      setReceiverId('');
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter allocated assets that have an active holder
  const allocatedAssets = assets.filter(a => a.status === 'ALLOCATED');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!assetId || !receiverId) {
      setError('Please select an allocated asset and target receiver employee');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/transfers', {
        assetId,
        receiverId,
        notes
      });

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit transfer request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <ArrowRightLeft size={20} style={{ color: 'var(--accent-primary)' }} />
            Request Asset Handover / Transfer
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Select Allocated Asset */}
          <div>
            <label htmlFor="transferAsset">Select Allocated Asset to Handover *</label>
            <select id="transferAsset" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              <option value="">-- Select Allocated Hardware --</option>
              {allocatedAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} - {a.name} ({a.department?.name || 'Assigned'})
                </option>
              ))}
            </select>
          </div>

          {/* Select Target Receiver Employee */}
          <div>
            <label htmlFor="receiverUser">New Target Holder (Receiver) *</label>
            <select id="receiverUser" value={receiverId} onChange={(e) => setReceiverId(e.target.value)}>
              <option value="">-- Select Receiver Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Notes */}
          <div>
            <label htmlFor="transferNotes">Transfer Purpose / Reason</label>
            <input
              id="transferNotes"
              type="text"
              placeholder="e.g. Department handover for Q3 project"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Requesting...' : 'Submit Transfer Request'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
