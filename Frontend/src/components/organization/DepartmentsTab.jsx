import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { DepartmentModal } from './DepartmentModal';
import { Plus, Search, Building2, Edit2, ShieldAlert, Trash2, AlertTriangle } from 'lucide-react';

export const DepartmentsTab = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState(null);

  // Custom Delete Confirmation Modal State
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees')
      ]);
      setDepartments(deptRes.data.departments || []);
      setEmployees(empRes.data.employees || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setDepartmentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setDepartmentToEdit(dept);
    setIsModalOpen(true);
  };

  const confirmDeleteDepartment = async () => {
    if (!deptToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/departments/${deptToDelete.id}`);
      setDeptToDelete(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete department');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDepartments = departments.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && d.isActive) ||
      (statusFilter === 'INACTIVE' && !d.isActive);
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
              placeholder="Search departments..."
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
          <Plus size={16} /> Create Department
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
              <th style={{ padding: '0.75rem 1rem' }}>Department Name</th>
              <th style={{ padding: '0.75rem 1rem' }}>Parent Department</th>
              <th style={{ padding: '0.75rem 1rem' }}>Department Head</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading departments...
                </td>
              </tr>
            ) : filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Building2 size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div>No departments found</div>
                </td>
              </tr>
            ) : (
              filteredDepartments.map((dept) => (
                <tr key={dept.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {dept.name}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                    {dept.parent ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.125rem 0.5rem', backgroundColor: '#F1F5F9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {dept.parent.name}
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Top Level</span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {dept.manager ? (
                      <span style={{ fontWeight: 500 }}>{dept.manager.name}</span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: dept.isActive ? 'var(--color-success-bg)' : '#F1F5F9',
                        color: dept.isActive ? 'var(--color-success)' : '#64748B'
                      }}
                    >
                      {dept.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenEdit(dept)}
                        style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                      >
                        <Edit2 size={14} /> Edit
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={() => setDeptToDelete(dept)}
                        title="Delete Department"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderColor: '#FCA5A5' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchData}
        departmentToEdit={departmentToEdit}
        allDepartments={departments}
        allEmployees={employees}
      />

      {/* Custom Centered Department Delete Confirmation Modal */}
      {deptToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '440px', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Confirm Department Deletion
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Are you sure you want to delete department <strong style={{ color: 'var(--accent-primary)' }}>'{deptToDelete.name}'</strong>?
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeptToDelete(null)}
                disabled={isDeleting}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDeleteDepartment}
                disabled={isDeleting}
                style={{ flex: 1, backgroundColor: '#c70e0eff', borderColor: '#c70e0eff' }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Department'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
