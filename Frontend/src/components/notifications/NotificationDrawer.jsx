import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Bell,
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Inbox
} from 'lucide-react';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [overdueAllocations, setOverdueAllocations] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [triggerMessage, setTriggerMessage] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [allocRes, logRes] = await Promise.all([
        api.get('/allocations'),
        api.get('/audit-logs')
      ]);

      const now = new Date();
      const allAlloc = allocRes.data.allocations || [];
      const overdues = allAlloc.filter(al =>
        al.status === 'OVERDUE' || (al.status === 'ACTIVE' && new Date(al.expectedReturnDate) < now)
      );

      setOverdueAllocations(overdues);
      setRecentLogs(logRes.data.auditLogs || []);
      setError('');
    } catch {
      setError('Failed to fetch notification updates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      setTriggerMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerReminders = async () => {
    try {
      setIsTriggering(true);
      setTriggerMessage('');
      const res = await api.post('/notifications/trigger-overdue-reminders');
      setTriggerMessage(res.data.message || 'Overdue return email reminders sent successfully');
      fetchNotifications();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to trigger overdue reminders');
    } finally {
      setIsTriggering(false);
    }
  };

  const isAdminOrManager = ['ADMIN', 'ASSET_MANAGER'].includes(user?.role);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'flex-end', zIndex: 120 }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '100%', maxWidth: '420px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)', animation: 'slideIn 0.2s ease-out' }}>

        {/* Drawer Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <Bell size={20} style={{ color: 'var(--accent-primary)' }} />
            Notification Center
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {triggerMessage && <div className="alert alert-success">{triggerMessage}</div>}

          {/* Trigger Overdue Email Reminders Action Button for Admin/Manager */}
          {isAdminOrManager && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#991B1B' }}>
                <AlertTriangle size={18} /> Overdue Asset Monitor
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#7F1D1D' }}>
                Found <strong>{overdueAllocations.length}</strong> overdue asset checkout(s). Trigger automated email notifications to holders.
              </div>
              <button
                className="btn btn-primary"
                onClick={handleTriggerReminders}
                disabled={isTriggering || overdueAllocations.length === 0}
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626', fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
              >
                <Send size={14} /> {isTriggering ? 'Sending Alerts...' : 'Trigger Email Reminders'}
              </button>
            </div>
          )}

          {/* Overdue Return Alerts List */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Clock size={16} style={{ color: 'var(--color-danger)' }} /> Overdue Return Alerts ({overdueAllocations.length})
            </h4>

            {overdueAllocations.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                No assets are currently overdue for return.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {overdueAllocations.map(al => (
                  <div key={al.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #FCA5A5', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 700, color: '#DC2626' }}>{al.asset?.assetTag} — {al.asset?.name}</div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 500, marginTop: '0.125rem' }}>Holder: {al.user?.name} ({al.user?.email})</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Due Date: {new Date(al.expectedReturnDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent System Audit Events */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--accent-primary)' }} /> System Activity Stream
            </h4>

            {recentLogs.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic', backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                No recent system activity logged.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentLogs.slice(0, 6).map(log => (
                  <div key={log.id} style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.625rem 0.75rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{log.action}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                      By {log.actor?.name || 'System'} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', textAlign: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            Close Notification Center
          </button>
        </div>

      </div>
    </div>
  );
};
