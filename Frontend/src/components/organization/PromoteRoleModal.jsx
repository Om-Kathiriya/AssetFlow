import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Shield, ArrowUpRight } from 'lucide-react';

export const PromoteRoleModal = ({ isOpen, onClose, onRefresh, employee }) => {
  const [newRole, setNewRole] = useState('EMPLOYEE');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setNewRole(employee.role || 'EMPLOYEE');
    }
    setError('');
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newRole === employee.role) {
      setError('Selected role is the same as current role');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.patch(`/employees/${employee.id}/role`, {
        role: newRole
      });

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update employee role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
            Update Employee Role
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div style={{ padding: '0.875rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Employee Target</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.125rem' }}>{employee.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{employee.email}</div>
          </div>

          <div>
            <label htmlFor="newRole">Select New System Role *</label>
            <select id="newRole" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="EMPLOYEE">EMPLOYEE (Standard User)</option>
              <option value="TECHNICIAN">TECHNICIAN (Maintenance Staff)</option>
              <option value="ASSET_MANAGER">ASSET_MANAGER (Inventory & Allocation Staff)</option>
              <option value="ADMIN">ADMIN (Full System Controls)</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem', display: 'block' }}>
              Changing roles triggers a permanent record entry in the system <strong>RoleChangeLog</strong> audit trail.
            </span>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : (
                <>Update Role <ArrowUpRight size={16} /></>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
