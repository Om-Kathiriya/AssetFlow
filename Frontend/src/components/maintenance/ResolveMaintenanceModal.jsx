import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, CheckCircle2, DollarSign } from 'lucide-react';

export const ResolveMaintenanceModal = ({ isOpen, onClose, onRefresh, ticket }) => {
  const [repairCost, setRepairCost] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && ticket) {
      setRepairCost('');
      setResolutionNotes('');
      setError('');
    }
  }, [isOpen, ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resolutionNotes.trim()) {
      setError('Please provide resolution notes describing the repair work');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.patch(`/maintenance/${ticket.id}/status`, {
        status: 'RESOLVED',
        repairCost: repairCost ? parseFloat(repairCost) : 0,
        resolutionNotes: resolutionNotes.trim()
      });
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resolve maintenance ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-success)' }}>
            <CheckCircle2 size={20} />
            Resolve Maintenance Ticket
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div style={{ backgroundColor: '#ECFDF5', padding: '0.875rem 1rem', borderRadius: '6px', border: '1px solid #A7F3D0', fontSize: '0.875rem', color: '#065F46' }}>
            <strong>Asset:</strong> {ticket.asset?.assetTag} — {ticket.asset?.name}
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#047857' }}>
              Resolving this ticket will automatically update asset status back to <strong>AVAILABLE</strong>.
            </div>
          </div>

          {/* Repair Cost */}
          <div>
            <label htmlFor="repairCost">Total Repair Cost (₹ INR)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="repairCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                style={{ paddingLeft: '2rem' }}
              />
              <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Resolution Notes */}
          <div>
            <label htmlFor="resolutionNotes">Resolution Work Notes *</label>
            <textarea
              id="resolutionNotes"
              rows={3}
              placeholder="e.g. Replaced display inverter board, re-calibrated backlight, tested for 2 hours..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }} disabled={isSubmitting}>
              {isSubmitting ? 'Resolving...' : 'Complete & Resolve Ticket'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
