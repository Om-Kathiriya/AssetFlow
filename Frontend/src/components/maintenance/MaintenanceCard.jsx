import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  XCircle,
  UserCheck,
  Play,
  Wrench,
  User,
  Clock,
  MapPin,
  IndianRupee,
  AlertCircle
} from 'lucide-react';

export const MaintenanceCard = ({
  ticket,
  onApprove,
  onReject,
  onOpenAssignModal,
  onStartProgress,
  onOpenResolveModal
}) => {
  const { user: currentUser } = useAuth();

  const isAdminOrManager = ['ADMIN', 'ASSET_MANAGER'].includes(currentUser?.role);
  const isAssignedTech = ticket.technicianId === currentUser?.id;
  const canUpdateStatus = isAdminOrManager || isAssignedTech;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        padding: '1rem',
        marginBottom: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Ticket Header: Asset Tag & Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
          {ticket.asset?.assetTag}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={12} /> {formatDate(ticket.createdAt)}
        </span>
      </div>

      {/* Asset Name */}
      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
        {ticket.asset?.name}
      </div>

      {/* Location tag if present */}
      {ticket.asset?.location && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <MapPin size={12} /> {ticket.asset.location}
        </div>
      )}

      {/* Issue Description */}
      <div style={{ fontSize: '0.8125rem', color: '#475569', backgroundColor: '#F8FAFC', padding: '0.5rem 0.625rem', borderRadius: '4px', border: '1px solid #E2E8F0', lineHeight: 1.4 }}>
        {ticket.issueDescription}
      </div>

      {/* Reporter & Technician Badges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.25rem', borderTop: '1px dashed #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <User size={12} /> <span style={{ fontWeight: 500 }}>Reported by:</span> {ticket.reporter?.name || 'Unknown'}
        </div>

        {ticket.technician ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            <Wrench size={12} /> Tech: {ticket.technician.name}
          </div>
        ) : (
          <div style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.75rem' }}>
            Unassigned
          </div>
        )}
      </div>

      {/* Cost & Resolution Notes (for RESOLVED tickets) */}
      {ticket.status === 'RESOLVED' && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '4px', padding: '0.5rem', fontSize: '0.75rem', color: '#065F46' }}>
          {ticket.repairCost > 0 && (
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.125rem' }}>
              <IndianRupee size={12} /> Cost: ₹{ticket.repairCost.toFixed(2)}
            </div>
          )}
          {ticket.resolutionNotes && <div>Notes: {ticket.resolutionNotes}</div>}
        </div>
      )}

      {/* Role-Based Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.25rem' }}>
        {/* PENDING: Admin/Manager Approve & Reject */}
        {ticket.status === 'PENDING' && isAdminOrManager && (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => onApprove(ticket)}
              style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0' }}
            >
              <CheckCircle2 size={12} /> Approve
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onReject(ticket.id)}
              style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#FEF2F2', color: '#991B1B', borderColor: '#FCA5A5' }}
            >
              <XCircle size={12} /> Reject
            </button>
          </>
        )}

        {/* APPROVED: Admin/Manager Assign Tech or Start Work */}
        {ticket.status === 'APPROVED' && isAdminOrManager && (
          <button
            className="btn btn-secondary"
            onClick={() => onOpenAssignModal(ticket)}
            style={{ width: '100%', padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#EEF2FF', color: '#4338CA', borderColor: '#C7D2FE' }}
          >
            <UserCheck size={12} /> Assign Tech
          </button>
        )}

        {/* IN_PROGRESS transition for Assigned Tech or Admin/Manager */}
        {(ticket.status === 'APPROVED' || ticket.status === 'ASSIGNED') && canUpdateStatus && (
          <button
            className="btn btn-secondary"
            onClick={() => onStartProgress(ticket.id)}
            style={{ width: '100%', padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', borderColor: '#FDE68A' }}
          >
            <Play size={12} /> Start Repair
          </button>
        )}

        {/* IN_PROGRESS: Resolve Ticket */}
        {ticket.status === 'IN_PROGRESS' && canUpdateStatus && (
          <div style={{ display: 'flex', gap: '0.375rem', width: '100%' }}>
            {isAdminOrManager && (
              <button
                className="btn btn-secondary"
                onClick={() => onOpenAssignModal(ticket)}
                title="Re-assign Technician"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                <UserCheck size={12} />
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => onOpenResolveModal(ticket)}
              style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
            >
              <CheckCircle2 size={12} /> Resolve Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
