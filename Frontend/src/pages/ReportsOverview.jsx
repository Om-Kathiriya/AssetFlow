import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  FileBarChart,
  Download,
  Boxes,
  ArrowLeftRight,
  Wrench,
  Search,
  Filter,
  ShieldAlert,
  Calendar,
  DollarSign
} from 'lucide-react';

export const ReportsOverview = () => {
  const { user } = useAuth();
  const [activeReportType, setActiveReportType] = useState('assets'); // 'assets' | 'allocations' | 'maintenance'
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter params
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const [reportData, setReportData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Master Data for Filters
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [catRes, deptRes] = await Promise.all([
          api.get('/categories'),
          api.get('/departments')
        ]);
        setCategories(catRes.data.categories || []);
        setDepartments(deptRes.data.departments || []);
      } catch {
        // Silent fail
      }
    };
    fetchMaster();
  }, []);

  // Fetch Report Data
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        type: activeReportType,
        format: 'json'
      };
      if (statusFilter) params.status = statusFilter;
      if (categoryId) params.categoryId = categoryId;
      if (departmentId) params.departmentId = departmentId;

      const res = await api.get('/reports/export', { params });
      setReportData(res.data.data || []);
      setTotalRecords(res.data.totalRecords || 0);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [activeReportType, statusFilter, categoryId, departmentId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Export CSV Handler
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('assetflow_token');
      let url = `http://localhost:8000/api/reports/export?type=${activeReportType}&format=csv`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      if (categoryId) url += `&categoryId=${encodeURIComponent(categoryId)}`;
      if (departmentId) url += `&departmentId=${encodeURIComponent(departmentId)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${activeReportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Failed to download CSV report');
    }
  };

  const reportTabs = [
    { id: 'assets', label: 'Assets Inventory Report', icon: Boxes },
    { id: 'allocations', label: 'Checkouts & Allocations Report', icon: ArrowLeftRight },
    { id: 'maintenance', label: 'Maintenance & Repairs Cost Report', icon: Wrench },
  ];

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileBarChart size={24} style={{ color: 'var(--accent-primary)' }} />
            Reports & Executive Analytics
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Generate custom inventory reports, audit asset utilization, analyze repair maintenance costs, and export CSV files.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleExportCSV} disabled={loading || reportData.length === 0}>
          <Download size={16} /> Export Report (CSV)
        </button>
      </div>

      {/* Report Type Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveReportType(tab.id);
                setStatusFilter('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Controls Bar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Filter size={14} /> Filter Report:
        </div>

        {/* Status Filter */}
        {activeReportType === 'assets' && (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '160px' }}>
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ALLOCATED">ALLOCATED</option>
            <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
            <option value="LOST">LOST</option>
          </select>
        )}

        {/* Category Filter */}
        {activeReportType === 'assets' && (
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ width: '180px' }}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        {/* Department Filter */}
        {activeReportType === 'assets' && (
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} style={{ width: '180px' }}>
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Total Records Found: <span style={{ color: 'var(--accent-primary)' }}>{totalRecords}</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      {/* Report Data Preview Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>
              {activeReportType === 'assets' && (
                <>
                  <th style={{ padding: '0.75rem 1rem' }}>Asset Tag</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Cost</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </>
              )}

              {activeReportType === 'allocations' && (
                <>
                  <th style={{ padding: '0.75rem 1rem' }}>Asset Tag</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Asset Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Holder Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Holder Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Allocated Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Expected Return</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </>
              )}

              {activeReportType === 'maintenance' && (
                <>
                  <th style={{ padding: '0.75rem 1rem' }}>Asset Tag</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Asset Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Reporter</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Technician</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Issue Description</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Repair Cost</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading report records...
                </td>
              </tr>
            ) : reportData.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FileBarChart size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div>No data matching the selected report filters</div>
                </td>
              </tr>
            ) : (
              reportData.map((row, idx) => (
                <tr key={row.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                  {activeReportType === 'assets' && (
                    <>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{row.assetTag}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{row.category?.name || 'N/A'}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{row.department?.name || 'Unassigned'}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{row.location}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{row.cost ? `₹${row.cost.toFixed(2)}` : '—'}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>{row.status}</span>
                      </td>
                    </>
                  )}

                  {activeReportType === 'allocations' && (
                    <>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{row.asset?.assetTag}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{row.asset?.name}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 500 }}>{row.user?.name}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{row.user?.email}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{new Date(row.allocatedDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{new Date(row.expectedReturnDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className="badge" style={{ backgroundColor: row.status === 'ACTIVE' ? '#E0F2FE' : '#F1F5F9', color: row.status === 'ACTIVE' ? '#0369A1' : '#64748B' }}>{row.status}</span>
                      </td>
                    </>
                  )}

                  {activeReportType === 'maintenance' && (
                    <>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{row.asset?.assetTag}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{row.asset?.name}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>{row.reporter?.name}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--accent-primary)', fontWeight: 500 }}>{row.technician?.name || 'Unassigned'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#475569' }}>{row.issueDescription}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: row.repairCost > 0 ? '#059669' : '#64748B' }}>{row.repairCost ? `₹${row.repairCost.toFixed(2)}` : '₹0.00'}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>{row.status}</span>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
