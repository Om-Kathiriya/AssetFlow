import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CategoryModal } from './CategoryModal';
import { Plus, Search, Tag, Edit2, ShieldAlert } from 'lucide-react';

export const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.isActive) ||
      (statusFilter === 'INACTIVE' && !c.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Search & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '140px' }}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Create Category
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>
              <th style={{ padding: '0.75rem 1rem' }}>Category Name</th>
              <th style={{ padding: '0.75rem 1rem' }}>Warranty Period</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading categories...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Tag size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div>No asset categories found</div>
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {cat.name}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-main)' }}>
                    {cat.warrantyPeriod !== null && cat.warrantyPeriod !== undefined ? (
                      <span style={{ fontWeight: 500 }}>{cat.warrantyPeriod} Months</span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>Not Specified</span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: cat.isActive ? 'var(--color-success-bg)' : '#F1F5F9',
                        color: cat.isActive ? 'var(--color-success)' : '#64748B'
                      }}
                    >
                      {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleOpenEdit(cat)}
                      style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchCategories}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
};
