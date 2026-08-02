import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { X, Wrench, ShieldAlert } from 'lucide-react';

export const ReportMaintenanceModal = ({ isOpen, onClose, onRefresh, assets = [] }) => {
  const { user } = useAuth();
  const [assetId, setAssetId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [userAllocatedAssetIds, setUserAllocatedAssetIds] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminOrManager = ['ADMIN', 'ASSET_MANAGER'].includes(user?.role);

  useEffect(() => {
    if (isOpen) {
      setAssetId('');
      setIssueDescription('');
      setError('');

      // If user is regular employee/tech, fetch their active allocations
      if (!isAdminOrManager) {
        api.get('/allocations')
          .then(res => {
            const myAllocations = (res.data.allocations || []).filter(
              al => al.userId === user?.id && ['ACTIVE', 'OVERDUE'].includes(al.status)
            );
            setUserAllocatedAssetIds(myAllocations.map(al => al.assetId));
          })
          .catch(() => setUserAllocatedAssetIds([]));
      }
    }
  }, [isOpen, isAdminOrManager, user?.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!assetId || !issueDescription.trim()) {
      setError('Please select an asset and describe the issue');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/maintenance', {
        assetId,
        issueDescription: issueDescription.trim()
      });

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit maintenance request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <Wrench size={20} style={{ color: 'var(--accent-primary)' }} />
            Report Asset Issue / Maintenance
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Select Asset */}
          <div>
            <label htmlFor="reportAsset">Select Affected Asset *</label>
            <select id="reportAsset" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              <option value="">-- Choose Asset --</option>
              {(isAdminOrManager ? assets : assets.filter(a => userAllocatedAssetIds.includes(a.id))).map(a => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.name} ({a.status})
                </option>
              ))}
            </select>
            {!isAdminOrManager && userAllocatedAssetIds.length === 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: '0.375rem' }}>
                ⚠️ You do not currently have any active asset checkouts allocated to your account.
              </div>
            )}
          </div>

          {/* Issue Description */}
          <div>
            <label htmlFor="issueDescription">Detailed Description of Problem / Breakdown *</label>
            <textarea
              id="issueDescription"
              rows={4}
              placeholder="e.g. Display backlight flickering intermittently, power port loose..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting Ticket...' : 'Submit Maintenance Ticket'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
