import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { BookingCalendar } from './BookingCalendar';
import {
  Search,
  CalendarCheck,
  List,
  CalendarDays,
  Plus,
  ShieldAlert,
  XCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const STATUS_BADGE = {
  UPCOMING: { bg: '#EEF2FF', color: '#4338CA', icon: Clock },
  ONGOING: { bg: '#ECFDF5', color: '#065F46', icon: CheckCircle2 },
  COMPLETED: { bg: '#F1F5F9', color: '#64748B', icon: CheckCircle2 },
  CANCELLED: { bg: '#FEF2F2', color: '#991B1B', icon: XCircle },
};

export const BookingsTab = ({ refreshTrigger = 0 }) => {
  const { user: currentUser } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      setBookings(res.data.bookings || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch booking records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [refreshTrigger]);

  const handleCancel = async (bookingId) => {
    try {
      setCancellingId(bookingId);
      await api.patch(`/bookings/${bookingId}/cancel`);
      await fetchBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  // Filtered list
  const filteredBookings = bookings.filter(b => {
    const term = search.toLowerCase();
    const matchesSearch =
      (b.asset?.assetTag || '').toLowerCase().includes(term) ||
      (b.asset?.name || '').toLowerCase().includes(term) ||
      (b.user?.name || '').toLowerCase().includes(term) ||
      (b.user?.email || '').toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats cards
  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => b.status === 'UPCOMING').length,
    ongoing: bookings.filter(b => b.status === 'ONGOING').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
  };

  return (
    <div>
      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Bookings', value: stats.total, color: 'var(--accent-primary)', bg: 'var(--accent-subtle)' },
          { label: 'Upcoming', value: stats.upcoming, color: '#4338CA', bg: '#EEF2FF' },
          { label: 'Ongoing Now', value: stats.ongoing, color: '#065F46', bg: '#ECFDF5' },
          { label: 'Completed', value: stats.completed, color: '#64748B', bg: '#F1F5F9' },
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

      {/* Search / Filter / View Toggle Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by asset tag, resource name, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '160px' }}>
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', borderRadius: '6px', border: '1px solid var(--border-strong)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                backgroundColor: viewMode === 'calendar' ? 'var(--accent-primary)' : '#FFFFFF',
                color: viewMode === 'calendar' ? '#FFFFFF' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <CalendarDays size={14} /> Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                borderLeft: '1px solid var(--border-strong)',
                backgroundColor: viewMode === 'list' ? 'var(--accent-primary)' : '#FFFFFF',
                color: viewMode === 'list' ? '#FFFFFF' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <List size={14} /> List
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <BookingCalendar
          bookings={filteredBookings}
          currentWeek={currentWeek}
          onWeekChange={setCurrentWeek}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Resource</th>
                <th style={{ padding: '0.75rem 1rem' }}>Booked By</th>
                <th style={{ padding: '0.75rem 1rem' }}>Start</th>
                <th style={{ padding: '0.75rem 1rem' }}>End</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading booking records...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CalendarCheck size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                    <div>No bookings match your search criteria</div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const statusInfo = STATUS_BADGE[b.status] || STATUS_BADGE.UPCOMING;
                  const StatusIcon = statusInfo.icon;
                  const canCancel = b.status === 'UPCOMING' && (currentUser?.role === 'ADMIN' || b.userId === currentUser?.id);

                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                      {/* Resource */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{b.asset?.assetTag}</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-main)' }}>{b.asset?.name}</div>
                      </td>

                      {/* User */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 500 }}>{b.user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                      </td>

                      {/* Start Time */}
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-main)', fontSize: '0.8125rem' }}>
                        <div>{new Date(b.startTime).toLocaleDateString()}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      {/* End Time */}
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-main)', fontSize: '0.8125rem' }}>
                        <div>{new Date(b.endTime).toLocaleDateString()}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <StatusIcon size={12} /> {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        {canCancel ? (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleCancel(b.id)}
                            disabled={cancellingId === b.id}
                            style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                          >
                            <XCircle size={14} />
                            {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                            {b.status === 'CANCELLED' ? 'Cancelled' : b.status === 'COMPLETED' ? 'Finished' : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
