import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { MaintenanceCard } from './MaintenanceCard';
import { AssignTechnicianModal } from './AssignTechnicianModal';
import { ResolveMaintenanceModal } from './ResolveMaintenanceModal';
import {
  Search,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  XCircle,
  Plus,
  ShieldAlert,
  Inbox
} from 'lucide-react';

const KANBAN_COLUMNS = [
  { id: 'PENDING', title: 'Pending Approval', color: '#D97706', bg: '#FFFBEB', icon: Clock },
  { id: 'APPROVED', title: 'Approved', color: '#4338CA', bg: '#EEF2FF', icon: CheckCircle2 },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#B45309', bg: '#FEF3C7', icon: Play },
  { id: 'RESOLVED', title: 'Resolved', color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
  { id: 'REJECTED', title: 'Rejected', color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
];

export const MaintenanceKanban = ({ onOpenReportModal, refreshTrigger = 0 }) => {
  const [kanban, setKanban] = useState({
    PENDING: [],
    APPROVED: [],
    IN_PROGRESS: [],
    RESOLVED: [],
    REJECTED: []
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [kanbanRes, empRes] = await Promise.all([
        api.get('/maintenance', { params: { groupByStatus: 'true' } }),
        api.get('/employees')
      ]);

      setKanban(kanbanRes.data.kanban || {
        PENDING: [],
        APPROVED: [],
        IN_PROGRESS: [],
        RESOLVED: [],
        REJECTED: []
      });
      setEmployees(empRes.data.employees || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch maintenance Kanban board data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  // Actions
  const handleApprove = async (ticket) => {
    try {
      await api.patch(`/maintenance/${ticket.id}/approval`, { status: 'APPROVED' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleReject = async (ticketId) => {
    try {
      await api.patch(`/maintenance/${ticketId}/approval`, { status: 'REJECTED' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleStartProgress = async (ticketId) => {
    try {
      await api.patch(`/maintenance/${ticketId}/status`, { status: 'IN_PROGRESS' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start progress');
    }
  };

  const handleOpenAssignModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsAssignModalOpen(true);
  };

  const handleOpenResolveModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsResolveModalOpen(true);
  };

  // Filter tickets in each column by search term
  const filterTickets = (ticketList = []) => {
    if (!search.trim()) return ticketList;
    const term = search.toLowerCase();
    return ticketList.filter(t =>
      (t.asset?.assetTag || '').toLowerCase().includes(term) ||
      (t.asset?.name || '').toLowerCase().includes(term) ||
      (t.issueDescription || '').toLowerCase().includes(term) ||
      (t.reporter?.name || '').toLowerCase().includes(term) ||
      (t.technician?.name || '').toLowerCase().includes(term)
    );
  };

  // Calculate stats
  const totalTickets = Object.values(kanban).reduce((sum, list) => sum + list.length, 0);
  const activeCount = (kanban.PENDING?.length || 0) + (kanban.APPROVED?.length || 0) + (kanban.IN_PROGRESS?.length || 0);

  return (
    <div>
      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Tickets', value: totalTickets, color: 'var(--accent-primary)', bg: 'var(--accent-subtle)' },
          { label: 'Pending Approval', value: kanban.PENDING?.length || 0, color: '#D97706', bg: '#FFFBEB' },
          { label: 'Approved & Tech Assigned', value: kanban.APPROVED?.length || 0, color: '#4338CA', bg: '#EEF2FF' },
          { label: 'In Repair Now', value: kanban.IN_PROGRESS?.length || 0, color: '#B45309', bg: '#FEF3C7' },
          { label: 'Resolved', value: kanban.RESOLVED?.length || 0, color: '#059669', bg: '#ECFDF5' },
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

      {/* Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search tickets by asset tag, hardware name, issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Horizontal Status Sections with Horizontal Cards Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {KANBAN_COLUMNS.map((col) => {
          const rawList = kanban[col.id] || [];
          const filteredList = filterTickets(rawList);
          const ColumnIcon = col.icon;

          return (
            <div
              key={col.id}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              {/* Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid ' + col.color
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                  <ColumnIcon size={18} style={{ color: col.color }} />
                  {col.title}
                </div>

                <span
                  style={{
                    backgroundColor: col.bg,
                    color: col.color,
                    borderRadius: '12px',
                    padding: '0.125rem 0.625rem',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {filteredList.length} Ticket(s)
                </span>
              </div>

              {/* Horizontal Cards Stream */}
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  overflowX: 'auto',
                  padding: '0.25rem 0.25rem 0.75rem 0.25rem',
                  alignItems: 'stretch'
                }}
              >
                {loading ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '1rem 0' }}>
                    Loading tickets...
                  </div>
                ) : filteredList.length === 0 ? (
                  <div style={{ color: '#94A3B8', fontSize: '0.8125rem', padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Inbox size={18} style={{ opacity: 0.5 }} />
                    <span>No tickets in {col.title}</span>
                  </div>
                ) : (
                  filteredList.map((ticket) => (
                    <div key={ticket.id} style={{ minWidth: '320px', maxWidth: '340px', flexShrink: 0 }}>
                      <MaintenanceCard
                        ticket={ticket}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onOpenAssignModal={handleOpenAssignModal}
                        onStartProgress={handleStartProgress}
                        onOpenResolveModal={handleOpenResolveModal}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Technician Modal */}
      <AssignTechnicianModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onRefresh={fetchData}
        ticket={selectedTicket}
        employees={employees}
      />

      {/* Resolve Maintenance Modal */}
      <ResolveMaintenanceModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onRefresh={fetchData}
        ticket={selectedTicket}
      />
    </div>
  );
};
