import React from 'react';
import { AuditsTab } from '../components/audits/AuditsTab';
import { ClipboardCheck } from 'lucide-react';

export const AuditsOverview = () => {
  return (
    <div style={{ maxWidth: '1150px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardCheck size={24} style={{ color: 'var(--accent-primary)' }} />
          Physical Audit Cycles & Compliance
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Launch physical inventory audits, verify hardware assets on-site with status tags (Verified, Missing, Damaged), and automatically update lost inventory.
        </p>
      </div>

      {/* Main Audits Content View */}
      <AuditsTab />
    </div>
  );
};
