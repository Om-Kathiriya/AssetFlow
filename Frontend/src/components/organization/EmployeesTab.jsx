import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PromoteRoleModal } from './PromoteRoleModal';
import { Search, UserCheck, Shield, ShieldAlert } from 'lucide-react';

export const EmployeesTab = () => {
  const { user: currentUser } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees');
      setEmployees(res.data.employees || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch employee directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenPromote = (emp) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-admin';
      case 'ASSET_MANAGER': return 'badge-manager';
      case 'TECHNICIAN': return 'badge-tech';
      default: return 'badge-employee';
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (emp.role === 'ADMIN') return false;
    const term = search.toLowerCase();
    const matchesSearch =
      emp.name.toLowerCase().includes(term) ||
      emp.username.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term);
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search employees by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: '160px' }}>
            <option value="ALL">All Roles</option>
            <option value="ASSET_MANAGER">ASSET_MANAGER</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Employee Directory Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>
              <th style={{ padding: '0.75rem 1rem' }}>Employee Name</th>
              <th style={{ padding: '0.75rem 1rem' }}>Username / Email</th>
              <th style={{ padding: '0.75rem 1rem' }}>Department</th>
              <th style={{ padding: '0.75rem 1rem' }}>System Role</th>
              <th style={{ padding: '0.75rem 1rem' }}>Joined Date</th>
              {currentUser?.role === 'ADMIN' && (
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading employee directory...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <UserCheck size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div>No employees match the specified criteria</div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {emp.name}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 500 }}>{emp.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{emp.username}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {emp.department ? (
                      <span style={{ fontWeight: 500 }}>{emp.department.name}</span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className={`badge ${getRoleBadgeClass(emp.role)}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(emp.createdAt).toLocaleDateString()}
                  </td>
                  {currentUser?.role === 'ADMIN' && (
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      {emp.id === currentUser?.id ? (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>
                          Current User
                        </span>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleOpenPromote(emp)}
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                        >
                          <Shield size={14} /> Promote Role
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PromoteRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchEmployees}
        employee={selectedEmployee}
      />
    </div>
  );
};
