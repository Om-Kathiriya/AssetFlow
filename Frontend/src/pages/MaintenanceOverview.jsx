import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { MaintenanceKanban } from '../components/maintenance/MaintenanceKanban';
import { ReportMaintenanceModal } from '../components/maintenance/ReportMaintenanceModal';
import { Wrench, Plus } from 'lucide-react';

export const MaintenanceOverview = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data.assets || []);
    } catch {
      // Silent fail
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleRefreshAll = () => {
    fetchAssets();
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{ maxWidth: '1250px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={24} style={{ color: 'var(--accent-primary)' }} />
            Maintenance & Repairs Workflow
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Track repair tickets across lifecycle stages: Pending Approval ➔ Approved ➔ Technician Assigned ➔ In Progress ➔ Resolved.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsReportModalOpen(true)}>
          <Plus size={16} /> Report Issue / Breakdown
        </button>
      </div>

      {/* Kanban Board */}
      <MaintenanceKanban
        onOpenReportModal={() => setIsReportModalOpen(true)}
        refreshTrigger={refreshTrigger}
      />

      {/* Report Issue Modal */}
      <ReportMaintenanceModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onRefresh={handleRefreshAll}
        assets={assets}
      />
    </div>
  );
};
