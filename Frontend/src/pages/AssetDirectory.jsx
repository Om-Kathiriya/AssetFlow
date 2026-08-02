import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { RegisterAssetModal } from '../components/assets/RegisterAssetModal';
import { AssetDetailModal } from '../components/assets/AssetDetailModal';
import { Plus, Search, Boxes, Eye, ShieldAlert, Image as ImageIcon, Trash2 } from 'lucide-react';

export const AssetDirectory = () => {
  const { user } = useAuth();

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);

      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (departmentFilter) params.departmentId = departmentFilter;
      if (statusFilter) params.status = statusFilter;

      const [assetRes, catRes, deptRes] = await Promise.all([
        api.get('/assets', { params }),
        api.get('/categories'),
        api.get('/departments')
      ]);

      setAssets(assetRes.data.assets || []);
      setCategories(catRes.data.categories || []);
      setDepartments(deptRes.data.departments || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load asset directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [search, categoryFilter, departmentFilter, statusFilter]);

  const handleOpenDetails = (assetId) => {
    setSelectedAssetId(assetId);
    setIsDetailModalOpen(true);
  };

  const handleDeleteAsset = async (asset) => {
    if (!window.confirm(`Are you sure you want to permanently delete asset ${asset.assetTag} (${asset.name})? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/assets/${asset.id}`);
      fetchAssets();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete asset');
    }
  };

  const getAssetImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
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
    <div style={{ maxWidth: '1200px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Asset Inventory Directory
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Complete hardware catalog, auto-tagging, Cloudinary photos, and status lifecycle state machine.
          </p>
        </div>

        {['ADMIN', 'ASSET_MANAGER'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setIsRegisterModalOpen(true)}>
            <Plus size={16} /> Register New Asset
          </button>
        )}
      </div>

      {/* Filter Control Bar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <input
            type="text"
            placeholder="Search by tag (AF-0001), name, or serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        {/* Category Filter */}
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: '160px' }}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Department Filter */}
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} style={{ width: '160px' }}>
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '160px' }}>
          <option value="">All Statuses</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="ALLOCATED">ALLOCATED</option>
          <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
          <option value="LOST">LOST</option>
          <option value="RETIRED">RETIRED</option>
          <option value="DISPOSED">DISPOSED</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Asset Inventory Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>
              <th style={{ padding: '0.75rem 1rem', width: '56px' }}>Photo</th>
              <th style={{ padding: '0.75rem 1rem' }}>Asset Tag</th>
              <th style={{ padding: '0.75rem 1rem' }}>Asset Name</th>
              <th style={{ padding: '0.75rem 1rem' }}>Serial Number</th>
              <th style={{ padding: '0.75rem 1rem' }}>Category</th>
              <th style={{ padding: '0.75rem 1rem' }}>Location</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading asset catalog...
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Boxes size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div>No assets match your search or filter parameters</div>
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                  {/* Photo Thumbnail */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '4px', border: '1px solid #E2E8F0', overflow: 'hidden', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {asset.imageUrl ? (
                        <img src={getAssetImageUrl(asset.imageUrl)} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={18} style={{ color: '#CBD5E1' }} />
                      )}
                    </div>
                  </td>

                  {/* Asset Tag */}
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                    {asset.assetTag}
                  </td>

                  {/* Name */}
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {asset.name}
                  </td>

                  {/* Serial */}
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {asset.serialNumber}
                  </td>

                  {/* Category */}
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                    {asset.category?.name || 'N/A'}
                  </td>

                  {/* Location */}
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    {asset.location}
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge" style={{ backgroundColor: getStatusBadgeStyle(asset.status).bg, color: getStatusBadgeStyle(asset.status).color }}>
                      {asset.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleOpenDetails(asset.id)}
                      style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register Asset Modal */}
      <RegisterAssetModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRefresh={fetchAssets}
        categories={categories}
        departments={departments}
      />

      {/* Asset Detail Modal */}
      <AssetDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRefresh={fetchAssets}
        assetId={selectedAssetId}
      />
    </div>
  );
};
