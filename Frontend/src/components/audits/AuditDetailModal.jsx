import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Search,
  ShieldAlert,
  ClipboardCheck,
  MapPin,
  Clock
} from 'lucide-react';

export const AuditDetailModal = ({ isOpen, onClose, onRefresh, sessionId }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [itemNotes, setItemNotes] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchSessionDetails = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await api.get(`/audit-sessions/${sessionId}`);
      setSession(res.data.session);

      // Pre-fill notes state
      const notesMap = {};
      (res.data.session?.items || []).forEach(item => {
        notesMap[item.id] = item.notes || '';
      });
      setItemNotes(notesMap);

      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch audit session checklist');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSessionDetails();
    }
  }, [isOpen, sessionId, fetchSessionDetails]);

  if (!isOpen) return null;

  const handleVerifyItem = async (itemId, result) => {
    try {
      const notes = itemNotes[itemId] || '';
      await api.patch(`/audit-sessions/${session.id}/items/${itemId}`, {
        result,
        notes
      });
      fetchSessionDetails();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record verification result');
    }
  };

  const handleCompleteSession = async () => {
    if (!window.confirm('Are you sure you want to complete and lock this audit session? Any assets marked MISSING will be automatically updated to LOST status.')) {
      return;
    }

    try {
      setIsCompleting(true);
      await api.patch(`/audit-sessions/${session.id}/complete`);
      fetchSessionDetails();
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete audit session');
    } finally {
      setIsCompleting(false);
    }
  };

  // Metrics calculation
  const items = session?.items || [];
  const total = items.length;
  const verified = items.filter(i => i.result === 'VERIFIED').length;
  const missing = items.filter(i => i.result === 'MISSING').length;
  const discrepancy = items.filter(i => i.result === 'DISCREPANCY').length;
  const pending = items.filter(i => i.result === 'PENDING').length;
  const completionPct = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;

  const filteredItems = items.filter(item => {
    const term = search.toLowerCase();
    return (
      (item.asset?.assetTag || '').toLowerCase().includes(term) ||
      (item.asset?.name || '').toLowerCase().includes(term) ||
      (item.asset?.location || '').toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '1100px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>

        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{session?.sessionName || 'Audit Checklist'}</h2>
              <span className={`badge ${session?.status === 'COMPLETED' ? 'badge-employee' : 'badge-admin'}`}>
                {session?.status}
              </span>
            </div>
            {session?.location && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <MapPin size={14} /> Location Scope: <strong>{session.location}</strong>
              </div>
            )}
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={22} />
          </button>
        </div>

        {/* Modal Body (Single Main Scrollable Viewport) */}
        <div style={{ flex: 1, padding: '1.5rem 1.5rem 2rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger"><ShieldAlert size={16} /> {error}</div>}

          {/* Progress Bar & KPI Metrics Bar */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>Audit Verification Progress</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{completionPct}% Complete</span>
            </div>

            {/* Visual Progress Track */}
            <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem', display: 'flex' }}>
              <div style={{ width: `${(verified / total) * 100}%`, backgroundColor: '#10B981', transition: 'width 0.3s ease' }} title={`Verified: ${verified}`} />
              <div style={{ width: `${(discrepancy / total) * 100}%`, backgroundColor: '#F59E0B', transition: 'width 0.3s ease' }} title={`Damaged: ${discrepancy}`} />
              <div style={{ width: `${(missing / total) * 100}%`, backgroundColor: '#EF4444', transition: 'width 0.3s ease' }} title={`Missing: ${missing}`} />
            </div>

            {/* Metric Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.375rem', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0' }}>Total: <strong>{total}</strong></div>
              <div style={{ padding: '0.375rem', backgroundColor: '#ECFDF5', borderRadius: '4px', border: '1px solid #A7F3D0', color: '#065F46' }}>Verified: <strong>{verified}</strong></div>
              <div style={{ padding: '0.375rem', backgroundColor: '#FEF3C7', borderRadius: '4px', border: '1px solid #FDE68A', color: '#92400E' }}>Damaged: <strong>{discrepancy}</strong></div>
              <div style={{ padding: '0.375rem', backgroundColor: '#FEF2F2', borderRadius: '4px', border: '1px solid #FCA5A5', color: '#991B1B' }}>Missing: <strong>{missing}</strong></div>
              <div style={{ padding: '0.375rem', backgroundColor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0', color: '#64748B' }}>Pending: <strong>{pending}</strong></div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: '360px' }}>
            <input
              type="text"
              placeholder="Search checklist by asset tag, name, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Checklist Table Wrapper */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflowX: 'auto', marginBottom: '0.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Asset Tag</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Asset Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Current Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Verification Action</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading checklist items...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No items match your search
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const isCompleted = session?.status === 'COMPLETED';

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                        {/* Tag */}
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                          {item.asset?.assetTag}
                        </td>

                        {/* Name */}
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                          {item.asset?.name}
                        </td>

                        {/* Location */}
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          {item.asset?.location || '—'}
                        </td>

                        {/* Current Status */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
                            {item.asset?.status}
                          </span>
                        </td>

                        {/* Verification Buttons */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {isCompleted ? (
                            <span className="badge" style={{
                              backgroundColor: item.result === 'VERIFIED' ? '#ECFDF5' : item.result === 'MISSING' ? '#FEF2F2' : item.result === 'DISCREPANCY' ? '#FEF3C7' : '#F1F5F9',
                              color: item.result === 'VERIFIED' ? '#065F46' : item.result === 'MISSING' ? '#991B1B' : item.result === 'DISCREPANCY' ? '#92400E' : '#64748B'
                            }}>
                              {item.result}
                            </span>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleVerifyItem(item.id, 'VERIFIED')}
                                title="Mark as Verified & Present"
                                style={{
                                  padding: '0.25rem 0.5rem', fontSize: '0.75rem',
                                  backgroundColor: item.result === 'VERIFIED' ? '#10B981' : '#FFFFFF',
                                  color: item.result === 'VERIFIED' ? '#FFFFFF' : '#047857',
                                  borderColor: '#10B981'
                                }}
                              >
                                <CheckCircle2 size={13} /> Verified
                              </button>

                              <button
                                className="btn btn-secondary"
                                onClick={() => handleVerifyItem(item.id, 'DISCREPANCY')}
                                title="Mark as Damaged / Discrepancy"
                                style={{
                                  padding: '0.25rem 0.5rem', fontSize: '0.75rem',
                                  backgroundColor: item.result === 'DISCREPANCY' ? '#F59E0B' : '#FFFFFF',
                                  color: item.result === 'DISCREPANCY' ? '#FFFFFF' : '#B45309',
                                  borderColor: '#F59E0B'
                                }}
                              >
                                <AlertTriangle size={13} /> Damaged
                              </button>

                              <button
                                className="btn btn-secondary"
                                onClick={() => handleVerifyItem(item.id, 'MISSING')}
                                title="Mark as Missing"
                                style={{
                                  padding: '0.25rem 0.5rem', fontSize: '0.75rem',
                                  backgroundColor: item.result === 'MISSING' ? '#EF4444' : '#FFFFFF',
                                  color: item.result === 'MISSING' ? '#FFFFFF' : '#DC2626',
                                  borderColor: '#EF4444'
                                }}
                              >
                                <XCircle size={13} /> Missing
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Notes Input */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {isCompleted ? (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{item.notes || '—'}</span>
                          ) : (
                            <input
                              type="text"
                              placeholder="Notes (e.g. Serial tag scratched)..."
                              value={itemNotes[item.id] || ''}
                              onChange={(e) => setItemNotes({ ...itemNotes, [item.id]: e.target.value })}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Session ID: <code style={{ fontFamily: 'monospace' }}>{session?.id?.substring(0, 8)}...</code>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>Close Checklist</button>
            {session?.status === 'IN_PROGRESS' && (
              <button
                className="btn btn-primary"
                onClick={handleCompleteSession}
                disabled={isCompleting}
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
              >
                <Lock size={16} />
                {isCompleting ? 'Closing Audit...' : 'Close & Lock Audit Cycle'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
