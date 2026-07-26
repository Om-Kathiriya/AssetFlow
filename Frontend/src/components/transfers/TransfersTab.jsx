import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { InitiateTransferModal } from './InitiateTransferModal';
import { Search, ArrowRightLeft, CheckCircle2, XCircle, Plus, ShieldAlert } from 'lucide-react';

export const TransfersTab = () => {
  const { user: currentUser } = useAuth();

  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, assetRes, empRes] = await Promise.all([
        api.get('/transfers'),
        api.get('/assets'),
        api.get('/employees')
      ]);

      setTransfers(transRes.data.transfers || []);
      setAssets(assetRes.data.assets || []);
      setEmployees(empRes.data.employees || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch transfer requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecision = async (transferId, action) => {
    try {
      setActionLoadingId(transferId);
      await api.post(`/transfers/${transferId}/decision`, {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        action
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action.toLowerCase()} transfer request`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTransfers = transfers.filter(tr => {
    const term = search.toLowerCase();
    const matchesSearch =
      tr.asset?.assetTag.toLowerCase().includes(term) ||
      tr.asset?.name.toLowerCase().includes(term) ||
      tr.sender?.name.toLowerCase().includes(term) ||
      tr.receiver?.name.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || tr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by asset tag, sender, or receiver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '160px' }}>
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setIsTransferModalOpen(true)}>
          <Plus size={16} /> Request Handover
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Transfers Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>
              <th style={{ padding: '0.75rem 1rem' }}>Asset Tag</th>
              <th style={{ padding: '0.75rem 1rem' }}>Asset Name</th>
              <th style={{ padding: '0.75rem 1rem' }}>Current Sender</th>
              <th style={{ padding: '0.75rem 1rem' }}>Target Receiver</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading transfer requests...
                </td>
              </tr>
            ) : filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ArrowRightLeft size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div>No asset handover transfer requests found</div>
                </td>
              </tr>
            ) : (
              filteredTransfers.map((tr) => (
                <tr key={tr.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                  {/* Tag */}
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                    {tr.asset?.assetTag}
                  </td>

                  {/* Asset Name */}
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tr.asset?.name}
                  </td>

                  {/* Sender */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 500 }}>{tr.sender?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr.sender?.email}</div>
                  </td>

                  {/* Receiver */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 500 }}>{tr.receiver?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr.receiver?.email}</div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: tr.status === 'APPROVED' ? 'var(--color-success-bg)' : tr.status === 'REJECTED' ? 'var(--color-danger-bg)' : '#FFFBEB',
                        color: tr.status === 'APPROVED' ? 'var(--color-success)' : tr.status === 'REJECTED' ? 'var(--color-danger)' : '#B45309'
                      }}
                    >
                      {tr.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                    {tr.status === 'PENDING' && ['ADMIN', 'ASSET_MANAGER'].includes(currentUser?.role) ? (
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleDecision(tr.id, 'APPROVE')}
                          disabled={actionLoadingId === tr.id}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-success)' }}
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleDecision(tr.id, 'REJECT')}
                          disabled={actionLoadingId === tr.id}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: '#FCA5A5' }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <InitiateTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onRefresh={fetchData}
        assets={assets}
        employees={employees}
      />
    </div>
  );
};
