import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { CreateAuditModal } from './CreateAuditModal';
import { AuditDetailModal } from './AuditDetailModal';
import {
  Search,
  ClipboardCheck,
  Plus,
  ShieldAlert,
  MapPin,
  Clock,
  User,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export const AuditsTab = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-sessions');
      setSessions(res.data.auditSessions || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch physical audit sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleOpenDetail = (sessionId) => {
    setSelectedSessionId(sessionId);
    setIsDetailModalOpen(true);
  };

  const filteredSessions = sessions.filter(s => {
    const term = search.toLowerCase();
    const matchesSearch =
      (s.sessionName || '').toLowerCase().includes(term) ||
      (s.location || '').toLowerCase().includes(term) ||
      (s.createdBy?.name || '').toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.status === 'IN_PROGRESS').length;
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;

  return (
    <div>
      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Audit Cycles', value: totalSessions, color: 'var(--accent-primary)', bg: 'var(--accent-subtle)' },
          { label: 'Active Audits In Progress', value: activeSessions, color: '#4338CA', bg: '#EEF2FF' },
          { label: 'Completed Audit Sessions', value: completedSessions, color: '#059669', bg: '#ECFDF5' },
        ].map((card, i) => (
          <div key={i} style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{card.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Header Bar (Search / Filter / Button) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search audit cycles by name, location, auditor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '170px' }}>
            <option value="ALL">All Audit Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Start Audit Cycle
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Audit Sessions Data Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>
              <th style={{ padding: '0.75rem 1rem' }}>Session Name</th>
              <th style={{ padding: '0.75rem 1rem' }}>Location Scope</th>
              <th style={{ padding: '0.75rem 1rem' }}>Created By</th>
              <th style={{ padding: '0.75rem 1rem' }}>Progress & Metrics</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading audit session records...
                </td>
              </tr>
            ) : filteredSessions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ClipboardCheck size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div>No physical audit sessions found</div>
                </td>
              </tr>
            ) : (
              filteredSessions.map((s) => {
                const m = s.metrics || { total: 0, verified: 0, missing: 0, discrepancy: 0, pending: 0, completionPercentage: 0 };

                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                    {/* Session Name */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.sessionName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</div>
                    </td>

                    {/* Location */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {s.location ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-main)', fontSize: '0.8125rem' }}>
                          <MapPin size={14} style={{ color: 'var(--accent-primary)' }} /> {s.location}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>All Locations</span>
                      )}
                    </td>

                    {/* Creator */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 500 }}>{s.createdBy?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.createdBy?.email}</div>
                    </td>

                    {/* Progress Bar & Breakdown */}
                    <td style={{ padding: '0.875rem 1rem', width: '240px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        <span>{m.total - m.pending} / {m.total} Verified</span>
                        <span>{m.completionPercentage}%</span>
                      </div>

                      {/* Visual progress bar */}
                      <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', display: 'flex', marginBottom: '0.375rem' }}>
                        <div style={{ width: `${m.total > 0 ? (m.verified / m.total) * 100 : 0}%`, backgroundColor: '#10B981' }} />
                        <div style={{ width: `${m.total > 0 ? (m.discrepancy / m.total) * 100 : 0}%`, backgroundColor: '#F59E0B' }} />
                        <div style={{ width: `${m.total > 0 ? (m.missing / m.total) * 100 : 0}%`, backgroundColor: '#EF4444' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: '#047857' }}>✓ {m.verified}</span>
                        <span style={{ color: '#B45309' }}>⚠ {m.discrepancy}</span>
                        <span style={{ color: '#DC2626' }}>✕ {m.missing}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge ${s.status === 'COMPLETED' ? 'badge-employee' : 'badge-admin'}`}>
                        {s.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenDetail(s.id)}
                        style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={14} /> Open Checklist
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Audit Session Modal */}
      <CreateAuditModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRefresh={fetchSessions}
      />

      {/* Audit Checklist Detail Modal */}
      <AuditDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRefresh={fetchSessions}
        sessionId={selectedSessionId}
      />
    </div>
  );
};
