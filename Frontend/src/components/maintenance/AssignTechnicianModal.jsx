import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, UserCheck } from 'lucide-react';

export const AssignTechnicianModal = ({ isOpen, onClose, onRefresh, ticket, employees = [] }) => {
  const [technicianId, setTechnicianId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && ticket) {
      setTechnicianId(ticket.technicianId || '');
      setError('');
    }
  }, [isOpen, ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!technicianId) {
      setError('Please select a technician or staff member');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.patch(`/maintenance/${ticket.id}/assign`, { technicianId });
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign technician');
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
            <UserCheck size={20} style={{ color: 'var(--accent-primary)' }} />
            Assign Repair Technician
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div style={{ backgroundColor: '#F8FAFC', padding: '0.875rem 1rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.875rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Target Asset</div>
            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.125rem' }}>{ticket.asset?.assetTag} — {ticket.asset?.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{ticket.issueDescription}</div>
          </div>

          <div>
            <label htmlFor="selectTechnician">Assign Technician *</label>
            <select id="selectTechnician" value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
              <option value="">-- Select Technician --</option>
              {/* Prioritize users with TECHNICIAN role */}
              {employees.filter(e => e.role === 'TECHNICIAN').length > 0 && (
                <optgroup label="Designated Technicians">
                  {employees.filter(e => e.role === 'TECHNICIAN').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      🔧 {emp.name} ({emp.email})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Other Staff Members">
                {employees.filter(e => e.role !== 'TECHNICIAN').map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role}) — {emp.email}
                  </option>
                ))}
              </optgroup>
            </select>
            {employees.filter(e => e.role === 'TECHNICIAN').length === 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                💡 Tip: You can promote employees to the <strong>TECHNICIAN</strong> role under <strong>Organization ➔ Employees</strong>.
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Technician'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
