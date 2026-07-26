import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Undo2 } from 'lucide-react';

export const ReturnAssetModal = ({ isOpen, onClose, onRefresh, allocation }) => {
  const [conditionOnReturn, setConditionOnReturn] = useState('Returned in good working condition');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConditionOnReturn('Returned in good working condition');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !allocation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setIsSubmitting(true);
      await api.post(`/allocations/${allocation.id}/return`, {
        conditionOnReturn
      });

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process asset return');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '460px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <Undo2 size={20} style={{ color: 'var(--accent-primary)' }} />
            Process Asset Return
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div style={{ padding: '0.875rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Checkout Details</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.125rem' }}>
              {allocation.asset?.name} ({allocation.asset?.assetTag})
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Holder: <strong>{allocation.user?.name}</strong> ({allocation.user?.email})
            </div>
          </div>

          <div>
            <label htmlFor="conditionOnReturn">Condition Upon Return *</label>
            <input
              id="conditionOnReturn"
              type="text"
              placeholder="e.g. Good condition, no physical damage"
              value={conditionOnReturn}
              onChange={(e) => setConditionOnReturn(e.target.value)}
              autoFocus
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Confirm Asset Return'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
