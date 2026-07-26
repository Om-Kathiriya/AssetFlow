import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { AllocateAssetModal } from './AllocateAssetModal';
import { ReturnAssetModal } from './ReturnAssetModal';
import { Search, ArrowRightLeft, Undo2, Plus, ShieldAlert, AlertCircle } from 'lucide-react';

export const AllocationsTab = () => {
  const { user: currentUser } = useAuth();

  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, assetRes, empRes] = await Promise.all([
        api.get('/allocations'),
        api.get('/assets'),
        api.get('/employees')
      ]);

      setAllocations(allocRes.data.allocations || []);
      setAssets(assetRes.data.assets || []);
      setEmployees(empRes.data.employees || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch allocation records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenReturn = (alloc) => {
    setSelectedAllocation(alloc);
    setIsReturnModalOpen(true);
  };

  const filteredAllocations = allocations.filter(al => {
    const term = search.toLowerCase();
    const matchesSearch =
      al.asset?.assetTag.toLowerCase().includes(term) ||
      al.asset?.name.toLowerCase().includes(term) ||
      al.user?.name.toLowerCase().includes(term) ||
      al.user?.email.toLowerCase().includes(term);

    const isOverdue = al.status === 'OVERDUE' || (al.status === 'ACTIVE' && new Date(al.expectedReturnDate) < new Date());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && al.status === 'ACTIVE' && !isOverdue) ||
      (statusFilter === 'OVERDUE' && isOverdue) ||
      (statusFilter === 'RETURNED' && al.status === 'RETURNED');

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Search & Filter Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by asset tag, hardware name, or holder email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '160px' }}>
            <option value="ALL">All Allocations</option>
            <option value="ACTIVE">Active Checkouts</option>
            <option value="OVERDUE">Overdue Returns</option>
            <option value="RETURNED">Past Returned</option>
          </select>
        </div>

        {['ADMIN', 'ASSET_MANAGER'].includes(currentUser?.role) && (
          <button className="btn btn-primary" onClick={() => setIsAllocateModalOpen(true)}>
            <Plus size={16} /> Issue Checkout
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Allocations Data Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>
              <th style={{ padding: '0.75rem 1rem' }}>Asset Tag</th>
              <th style={{ padding: '0.75rem 1rem' }}>Asset Name</th>
              <th style={{ padding: '0.75rem 1rem' }}>Assigned Holder</th>
              <th style={{ padding: '0.75rem 1rem' }}>Allocated Date</th>
              <th style={{ padding: '0.75rem 1rem' }}>Due Date</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading allocation records...
                </td>
              </tr>
            ) : filteredAllocations.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ArrowRightLeft size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div>No checkout allocation records match your search criteria</div>
                </td>
              </tr>
            ) : (
              filteredAllocations.map((al) => {
                const isOverdue = al.status === 'OVERDUE' || (al.status === 'ACTIVE' && new Date(al.expectedReturnDate) < new Date());
                return (
                  <tr key={al.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                    {/* Tag */}
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                      {al.asset?.assetTag}
                    </td>

                    {/* Asset Name */}
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {al.asset?.name}
                    </td>

                    {/* Holder User */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 500 }}>{al.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{al.user?.email}</div>
                    </td>

                    {/* Allocated Date */}
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                      {new Date(al.allocatedDate).toLocaleDateString()}
                    </td>

                    {/* Due Date */}
                    <td style={{ padding: '0.875rem 1rem', fontWeight: isOverdue ? 700 : 500, color: isOverdue ? 'var(--color-danger)' : 'var(--text-main)' }}>
                      {new Date(al.expectedReturnDate).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {isOverdue ? (
                        <span className="badge" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <AlertCircle size={12} /> OVERDUE
                        </span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: al.status === 'ACTIVE' ? '#E0F2FE' : '#F1F5F9', color: al.status === 'ACTIVE' ? '#0369A1' : '#64748B' }}>
                          {al.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      {['ACTIVE', 'OVERDUE'].includes(al.status) && ['ADMIN', 'ASSET_MANAGER'].includes(currentUser?.role) ? (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleOpenReturn(al)}
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                        >
                          <Undo2 size={14} /> Process Return
                        </button>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Issue Checkout Modal */}
      <AllocateAssetModal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        onRefresh={fetchData}
        assets={assets}
        employees={employees}
      />

      {/* Return Modal */}
      <ReturnAssetModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onRefresh={fetchData}
        allocation={selectedAllocation}
      />
    </div>
  );
};
