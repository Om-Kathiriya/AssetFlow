import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, ArrowRightLeft, AlertTriangle } from 'lucide-react';

export const AllocateAssetModal = ({ isOpen, onClose, onRefresh, assets = [], employees = [] }) => {
  const [assetId, setAssetId] = useState('');
  const [userId, setUserId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [conditionOnAllocation, setConditionOnAllocation] = useState('Brand new / Excellent condition');
  const [error, setError] = useState('');
  const [conflictWarning, setConflictWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAssetId('');
      setUserId('');
      setExpectedReturnDate('');
      setConditionOnAllocation('Brand new / Excellent condition');
      setError('');
      setConflictWarning('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Check if selected asset is already allocated
  const handleAssetChange = (selectedId) => {
    setAssetId(selectedId);
    setConflictWarning('');

    const targetAsset = assets.find(a => a.id === selectedId);
    if (targetAsset && targetAsset.status === 'ALLOCATED') {
      setConflictWarning(`Warning: ${targetAsset.name} (${targetAsset.assetTag}) is currently ALLOCATED to another employee. Direct checkout will be rejected by the system. Please initiate a Transfer Request instead.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!assetId || !userId || !expectedReturnDate) {
      setError('Please select an asset, employee, and expected return date');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/allocations', {
        assetId,
        userId,
        expectedReturnDate,
        conditionOnAllocation
      });

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue asset allocation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <ArrowRightLeft size={20} style={{ color: 'var(--accent-primary)' }} />
            Issue Asset Checkout & Allocation
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Conflict Red Warning Box */}
          {conflictWarning && (
            <div style={{ padding: '0.875rem 1rem', backgroundColor: '#FEF2F2', border: '2px dashed #EF4444', borderRadius: '6px', color: '#991B1B', fontSize: '0.8125rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, color: '#DC2626', marginTop: '0.125rem' }} />
              <div>{conflictWarning}</div>
            </div>
          )}

          {/* Select Asset */}
          <div>
            <label htmlFor="allocateAsset">Select Asset to Checkout *</label>
            <select id="allocateAsset" value={assetId} onChange={(e) => handleAssetChange(e.target.value)}>
              <option value="">-- Choose Asset --</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} - {a.name} ({a.status})
                </option>
              ))}
            </select>
          </div>

          {/* Select Target Employee Holder */}
          <div>
            <label htmlFor="allocateUser">Assign To Employee *</label>
            <select id="allocateUser" value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">-- Choose Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          {/* Expected Return Date */}
          <div>
            <label htmlFor="expectedReturnDate">Expected Return Due Date *</label>
            <input
              id="expectedReturnDate"
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
            />
          </div>

          {/* Condition Notes */}
          <div>
            <label htmlFor="conditionOnAllocation">Initial Condition Notes</label>
            <input
              id="conditionOnAllocation"
              type="text"
              placeholder="e.g. Excellent condition, includes power adapter and case"
              value={conditionOnAllocation}
              onChange={(e) => setConditionOnAllocation(e.target.value)}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !!conflictWarning}>
              {isSubmitting ? 'Issuing...' : 'Issue Checkout'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
