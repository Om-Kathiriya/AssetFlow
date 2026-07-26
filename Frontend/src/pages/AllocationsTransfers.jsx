import React, { useState } from 'react';
import { AllocationsTab } from '../components/allocations/AllocationsTab';
import { TransfersTab } from '../components/transfers/TransfersTab';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';

export const AllocationsTransfers = () => {
  const [activeTab, setActiveTab] = useState('allocations');

  const tabs = [
    { id: 'allocations', label: 'Active Checkouts & Allocations', icon: ArrowRightLeft },
    { id: 'transfers', label: 'Employee Transfer Requests', icon: RefreshCw },
  ];

  return (
    <div style={{ maxWidth: '1150px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          Allocations & Transfers
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Issue hardware checkouts, track return due dates, identify overdue assets, and approve transfer handovers.
        </p>
      </div>

      {/* Tab Header Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* Tab Body */}
      <div>
        {activeTab === 'allocations' && <AllocationsTab />}
        {activeTab === 'transfers' && <TransfersTab />}
      </div>
    </div>
  );
};
