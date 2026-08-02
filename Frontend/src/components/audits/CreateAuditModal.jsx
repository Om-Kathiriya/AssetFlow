import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, ClipboardCheck } from 'lucide-react';

export const CreateAuditModal = ({ isOpen, onClose, onRefresh }) => {
  const [sessionName, setSessionName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSessionName('');
      setLocation('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!sessionName.trim()) {
      setError('Please provide a name for this audit session');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/audit-sessions', {
        sessionName: sessionName.trim(),
        location: location.trim() || undefined
      });

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize physical audit session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <ClipboardCheck size={20} style={{ color: 'var(--accent-primary)' }} />
            Start Physical Audit Cycle
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Session Name */}
          <div>
            <label htmlFor="sessionName">Audit Session Name *</label>
            <input
              id="sessionName"
              type="text"
              placeholder="e.g. Q3 Floor 2 Physical Hardware Inventory Audit"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
          </div>

          {/* Location Scope */}
          <div>
            <label htmlFor="auditLocation">Location Scope (Optional Filter)</label>
            <input
              id="auditLocation"
              type="text"
              placeholder="e.g. Building A or Floor 2 (leave blank to include all assets)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              All hardware assets matching this location will be automatically populated into the verification checklist.
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Launching Audit...' : 'Launch Audit Cycle'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
