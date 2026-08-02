import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Clock, Search, ShieldAlert, History, User } from 'lucide-react';

export const AuditLogsModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs');
      setLogs(res.data.logs || []);
      setError('');
    } catch {
      setError('Failed to load full audit log history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatEntityColumn = (log) => {
    if (log.details?.entityDisplay) {
      return log.details.entityDisplay;
    }
    const action = log.action ? log.action.toUpperCase() : '';
    if (action === 'CREATE_AUDIT_SESSION') return 'Audit Create';
    if (action === 'COMPLETE_AUDIT_SESSION') return 'Audit Complete';
    return log.targetEntity ? `${log.targetEntity} ${log.targetId ? `#${log.targetId.slice(0, 6)}` : ''}` : 'System';
  };

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    const entityText = formatEntityColumn(log).toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(term) ||
      (log.actor?.name || '').toLowerCase().includes(term) ||
      (log.targetEntity || '').toLowerCase().includes(term) ||
      entityText.includes(term)
    );
  });

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '1.5rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '850px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>

        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <History size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>System Audit Trail History</h2>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="alert alert-danger"><ShieldAlert size={16} /> {error}</div>}

          {/* Search Input Bar */}
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search audit trail by action, user, entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Full Audit Table Wrapper */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflowY: 'auto', maxHeight: '440px', minHeight: '200px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Performed By</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action Description</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading full audit trail logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No audit history records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                        {log.actor?.name || 'System'} <span className="badge" style={{ fontSize: '0.65rem', marginLeft: '0.375rem' }}>{log.actor?.role}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-main)', fontWeight: 500 }}>
                        {log.action}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> total activity logs
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Audit Trail
          </button>
        </div>

      </div>
    </div>
  );
};
