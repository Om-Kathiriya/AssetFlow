import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Building2 } from 'lucide-react';

export const DepartmentModal = ({ isOpen, onClose, onRefresh, departmentToEdit, allDepartments = [], allEmployees = [] }) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (departmentToEdit) {
      setName(departmentToEdit.name || '');
      setParentId(departmentToEdit.parentId || '');
      setManagerId(departmentToEdit.managerId || '');
      setIsActive(departmentToEdit.isActive !== undefined ? departmentToEdit.isActive : true);
    } else {
      setName('');
      setParentId('');
      setManagerId('');
      setIsActive(true);
    }
    setError('');
  }, [departmentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        parentId: parentId || null,
        managerId: managerId || null,
        isActive
      };

      if (departmentToEdit) {
        await api.put(`/departments/${departmentToEdit.id}`, payload);
      } else {
        await api.post('/departments', payload);
      }

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save department');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out current department from parent options to prevent self-reference
  const availableParents = allDepartments.filter(d => !departmentToEdit || d.id !== departmentToEdit.id);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <Building2 size={20} style={{ color: 'var(--accent-primary)' }} />
            {departmentToEdit ? 'Edit Department' : 'Create New Department'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div>
            <label htmlFor="deptName">Department Name *</label>
            <input
              id="deptName"
              type="text"
              placeholder="e.g. Engineering, Product, HR"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="parentId">Parent Department (Optional)</label>
            <select id="parentId" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">-- None (Top Level Department) --</option>
              {availableParents.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="managerId">Department Manager (Optional)</label>
            <select id="managerId" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
              <option value="">-- Select Manager --</option>
              {allEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
              ))}
            </select>
          </div>

          {departmentToEdit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <label htmlFor="isActive" style={{ margin: 0, fontWeight: 500 }}>Active Status</label>
            </div>
          )}

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (departmentToEdit ? 'Save Changes' : 'Create Department')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
