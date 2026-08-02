import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { AuditLogsModal } from '../components/auditLogs/AuditLogsModal';
import {
  Boxes,
  ArrowLeftRight,
  Wrench,
  CalendarCheck,
  ClipboardCheck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Clock,
  User,
  Plus
} from 'lucide-react';

export const DashboardOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/dashboard');
      setData(res.data);
      setError('');
    } catch {
      setError('Failed to load dashboard aggregation metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpis = data?.kpis || {};
  const dist = kpis.statusDistribution || {};
  const totalAssets = kpis.totalAssets || 0;
  const activeAlloc = kpis.allocations?.active || 0;
  const overdueAlloc = kpis.allocations?.overdue || 0;
  const pendingMaint = kpis.operations?.pendingMaintenance || 0;
  const upcomingBook = kpis.operations?.upcomingBookings || 0;
  const totalValue = kpis.totalAssetValue || 0;

  const recentLogs = data?.recentActivity?.auditLogs || [];
  const recentHistory = data?.recentActivity?.assetHistory || [];

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome back, {user?.name || user?.username}!</h1>
            <span className="badge badge-admin">{user?.role}</span>
          </div>
          {/* <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Enterprise AMS Dashboard • System Status: <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Operational</span>
          </p> */}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/assets" className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
            <Boxes size={15} /> View Asset Directory
          </Link>
          {['ADMIN', 'ASSET_MANAGER'].includes(user?.role) && (
            <Link to="/allocations" className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
              <ArrowLeftRight size={15} /> Issue Checkout
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Card 1: Total Assets */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Hardware Assets</span>
            <Boxes size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{loading ? '...' : totalAssets}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valuation: <strong>₹{totalValue.toLocaleString()}</strong></div>
        </div>

        {/* Card 2: Active Checkouts */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Checkouts</span>
            <ArrowLeftRight size={18} style={{ color: '#0369A1' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0369A1' }}>{loading ? '...' : activeAlloc}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{totalAssets > 0 ? Math.round((activeAlloc / totalAssets) * 100) : 0}% utilization rate</div>
        </div>

        {/* Card 3: Overdue Returns */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Overdue Returns</span>
            <AlertTriangle size={18} style={{ color: overdueAlloc > 0 ? '#DC2626' : 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: overdueAlloc > 0 ? '#DC2626' : 'var(--text-main)' }}>{loading ? '...' : overdueAlloc}</div>
          <div style={{ fontSize: '0.75rem', color: overdueAlloc > 0 ? '#DC2626' : 'var(--text-muted)' }}>{overdueAlloc > 0 ? 'Requires immediate action' : 'All returns on track'}</div>
        </div>

        {/* Card 4: Maintenance & Bookings */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Maintenance</span>
            <Wrench size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#D97706' }}>{loading ? '...' : pendingMaint}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upcoming Bookings: <strong>{upcomingBook}</strong></div>
        </div>
      </div>

      {/* Asset Status Distribution Progress Track */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} /> Asset Lifecycle Status Distribution
        </h3>

        <div style={{ height: '12px', backgroundColor: '#E2E8F0', borderRadius: '6px', overflow: 'hidden', display: 'flex', marginBottom: '1rem' }}>
          <div style={{ width: `${totalAssets > 0 ? ((dist.AVAILABLE || 0) / totalAssets) * 100 : 0}%`, backgroundColor: '#10B981' }} title={`Available: ${dist.AVAILABLE || 0}`} />
          <div style={{ width: `${totalAssets > 0 ? ((dist.ALLOCATED || 0) / totalAssets) * 100 : 0}%`, backgroundColor: '#0369A1' }} title={`Allocated: ${dist.ALLOCATED || 0}`} />
          <div style={{ width: `${totalAssets > 0 ? ((dist.UNDER_MAINTENANCE || 0) / totalAssets) * 100 : 0}%`, backgroundColor: '#F59E0B' }} title={`Under Maintenance: ${dist.UNDER_MAINTENANCE || 0}`} />
          <div style={{ width: `${totalAssets > 0 ? ((dist.LOST || 0) / totalAssets) * 100 : 0}%`, backgroundColor: '#EF4444' }} title={`Lost: ${dist.LOST || 0}`} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: '#ECFDF5', borderRadius: '6px', border: '1px solid #A7F3D0', color: '#065F46' }}>Available: <strong>{dist.AVAILABLE || 0}</strong></div>
          <div style={{ padding: '0.5rem', backgroundColor: '#E0F2FE', borderRadius: '6px', border: '1px solid #BAE6FD', color: '#0369A1' }}>Allocated: <strong>{dist.ALLOCATED || 0}</strong></div>
          <div style={{ padding: '0.5rem', backgroundColor: '#FEF3C7', borderRadius: '6px', border: '1px solid #FDE68A', color: '#92400E' }}>Maintenance: <strong>{dist.UNDER_MAINTENANCE || 0}</strong></div>
          <div style={{ padding: '0.5rem', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FCA5A5', color: '#991B1B' }}>Lost: <strong>{dist.LOST || 0}</strong></div>
        </div>
      </div>

      {/* Two Column Grid: Quick Actions & Live Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Quick Shortcuts Card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} style={{ color: 'var(--accent-primary)' }} /> Quick Navigation Shortcuts
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/assets" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', color: 'var(--text-main)', textDecoration: 'none' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><Boxes size={16} style={{ color: 'var(--accent-primary)' }} /> Register / Manage Assets</span>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>

            <Link to="/allocations" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', color: 'var(--text-main)', textDecoration: 'none' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><ArrowLeftRight size={16} style={{ color: '#0369A1' }} /> Issue Checkout / Process Return</span>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>

            <Link to="/bookings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', color: 'var(--text-main)', textDecoration: 'none' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><CalendarCheck size={16} style={{ color: '#4338CA' }} /> Reserve Resource / Calendar</span>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>

            <Link to="/maintenance" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', color: 'var(--text-main)', textDecoration: 'none' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><Wrench size={16} style={{ color: '#D97706' }} /> Maintenance Kanban Board</span>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>
          </div>
        </div>

        {/* Live System Activity Feed (Admin/Manager Only) or Employee Guidance */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
          {['ADMIN', 'ASSET_MANAGER'].includes(user?.role) ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} style={{ color: 'var(--accent-primary)' }} /> Live Audit Activity Stream
                </h3>
                <button
                  onClick={() => setIsAuditLogsModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#EEF2FF')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  See More...
                </button>
              </div>

              {loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading activity logs...</div>
              ) : recentLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>No system activity recorded yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentLogs.map((log) => (
                    <div key={log.id} style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{log.action}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                        By <strong>{log.actor?.name || 'System'}</strong> ({log.actor?.role}) • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--color-success)' }} /> My Account & Workspace Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                <div style={{ padding: '0.875rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  Logged in as: <strong>{user?.name || user?.username}</strong> ({user?.role})
                </div>
                <div style={{ padding: '0.875rem', backgroundColor: '#ECFDF5', borderRadius: '6px', border: '1px solid #A7F3D0', color: '#065F46' }}>
                  Status: <strong>Active & Authorized</strong>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                  Use the navigation menu to browse available hardware, reserve room resources, or report issues for hardware assigned to you.
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full Audit Logs History Modal */}
      <AuditLogsModal
        isOpen={isAuditLogsModalOpen}
        onClose={() => setIsAuditLogsModalOpen(false)}
      />
    </div>
  );
};
