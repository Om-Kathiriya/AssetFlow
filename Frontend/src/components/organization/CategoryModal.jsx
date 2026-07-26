import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Tag } from 'lucide-react';

export const CategoryModal = ({ isOpen, onClose, onRefresh, categoryToEdit }) => {
  const [name, setName] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setWarrantyPeriod(categoryToEdit.warrantyPeriod !== null && categoryToEdit.warrantyPeriod !== undefined ? String(categoryToEdit.warrantyPeriod) : '');
      setIsActive(categoryToEdit.isActive !== undefined ? categoryToEdit.isActive : true);
    } else {
      setName('');
      setWarrantyPeriod('');
      setIsActive(true);
    }
    setError('');
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        warrantyPeriod: warrantyPeriod !== '' ? parseInt(warrantyPeriod, 10) : null,
        isActive
      };

      if (categoryToEdit) {
        await api.put(`/categories/${categoryToEdit.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save category');
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
            <Tag size={20} style={{ color: 'var(--accent-primary)' }} />
            {categoryToEdit ? 'Edit Category' : 'Create New Category'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div>
            <label htmlFor="catName">Category Name *</label>
            <input
              id="catName"
              type="text"
              placeholder="e.g. Laptops, Monitors, Workstations"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="warranty">Warranty Period (Months)</label>
            <input
              id="warranty"
              type="number"
              min="0"
              placeholder="e.g. 12, 24, 36"
              value={warrantyPeriod}
              onChange={(e) => setWarrantyPeriod(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Standard manufacturer warranty duration for assets in this category.
            </span>
          </div>

          {categoryToEdit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                id="catIsActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <label htmlFor="catIsActive" style={{ margin: 0, fontWeight: 500 }}>Active Status</label>
            </div>
          )}

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (categoryToEdit ? 'Save Changes' : 'Create Category')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
