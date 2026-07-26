import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { X, Boxes, Calendar, MapPin, DollarSign, RefreshCw, History, FileText, CheckCircle } from 'lucide-react';

export const AssetDetailModal = ({ isOpen, onClose, onRefresh, assetId }) => {
  const { user } = useAuth();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status Change State
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusError, setStatusError] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const fetchAssetDetails = async () => {
    if (!assetId) return;
    try {
      setLoading(true);
      const res = await api.get(`/assets/${assetId}`);
      setAsset(res.data.asset);
      setNewStatus(res.data.asset.status);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch asset details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && assetId) {
      fetchAssetDetails();
    }
  }, [isOpen, assetId]);

  if (!isOpen) return null;

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusError('');

    if (newStatus === asset?.status) {
      setStatusError('Selected status is the same as current status');
      return;
    }

    try {
      setIsChangingStatus(true);
      await api.patch(`/assets/${asset.id}/status`, {
        status: newStatus,
        notes: statusNotes
      });

      setStatusNotes('');
      fetchAssetDetails();
      onRefresh();
    } catch (err) {
      setStatusError(err.response?.data?.error || 'Failed to transition status');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'AVAILABLE': return { bg: 'var(--color-success-bg)', color: 'var(--color-success)' };
      case 'ALLOCATED': return { bg: '#E0F2FE', color: '#0369A1' };
      case 'UNDER_MAINTENANCE': return { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' };
      case 'RETIRED': case 'DISPOSED': return { bg: '#F1F5F9', color: '#64748B' };
      case 'LOST': return { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)' };
      default: return { bg: '#F1F5F9', color: '#475569' };
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '720px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Boxes size={22} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {asset?.name || 'Asset Overview'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tag: <strong style={{ color: 'var(--text-main)' }}>{asset?.assetTag}</strong> • Serial: {asset?.serialNumber}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Scroll */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading asset details...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              {/* Asset Header Info & Photo */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Photo Preview */}
                <div style={{ width: '140px', height: '140px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {asset?.imageUrl ? (
                    <img src={asset.imageUrl} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Boxes size={40} style={{ color: '#CBD5E1' }} />
                  )}
                </div>

                {/* Info Fields Grid */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</div>
                    <div style={{ marginTop: '0.25rem' }}>
                      <span className="badge" style={{ backgroundColor: getStatusBadgeStyle(asset.status).bg, color: getStatusBadgeStyle(asset.status).color }}>
                        {asset.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CATEGORY</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>{asset.category?.name || 'N/A'}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DEPARTMENT</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>{asset.department?.name || 'Unassigned'}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LOCATION</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem' }}>{asset.location}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>COST / VALUATION</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>
                      {asset.cost ? `$${asset.cost.toFixed(2)}` : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RESOURCE BOOKABLE</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>
                      {asset.isBookable ? 'Yes (Enabled)' : 'No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Transition Control (Admin / Asset Manager Only) */}
              {['ADMIN', 'ASSET_MANAGER'].includes(user?.role) && (
                <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} style={{ color: 'var(--accent-primary)' }} /> Lifecycle Status State Transition
                  </div>

                  {statusError && <div className="alert alert-danger" style={{ marginBottom: '0.75rem' }}>{statusError}</div>}

                  <form onSubmit={handleStatusSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label htmlFor="newStatus" style={{ fontSize: '0.75rem' }}>Target Status</label>
                      <select id="newStatus" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                        <option value="LOST">LOST</option>
                        <option value="RETIRED">RETIRED</option>
                        <option value="DISPOSED">DISPOSED</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="statusNotes" style={{ fontSize: '0.75rem' }}>Transition Reason / Notes</label>
                      <input
                        id="statusNotes"
                        type="text"
                        placeholder="e.g. Sent for screen repair"
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isChangingStatus} style={{ padding: '0.5rem 1rem' }}>
                      {isChangingStatus ? 'Updating...' : 'Update Status'}
                    </button>
                  </form>
                </div>
              )}

              {/* Chronological History Log Feed */}
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={18} style={{ color: 'var(--accent-primary)' }} /> Asset History Audit Feed
                </div>

                {!asset?.history || asset.history.length === 0 ? (
                  <div style={{ padding: '1.5rem', textOverflow: 'ellipsis', backgroundColor: '#F8FAFC', borderRadius: '6px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No historical logs recorded for this asset yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {asset.history.map((h) => (
                      <div key={h.id} style={{ padding: '0.875rem 1rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            {h.action} — <span style={{ color: 'var(--accent-primary)' }}>{h.newStatus}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                            By <strong>{h.user?.name || 'System User'}</strong> • {new Date(h.createdAt).toLocaleString()}
                          </div>
                          {h.notes && (
                            <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.25rem', fontStyle: 'italic' }}>
                              "{h.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
