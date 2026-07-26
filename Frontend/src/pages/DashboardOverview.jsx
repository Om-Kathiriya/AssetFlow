import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Boxes, ArrowLeftRight, Wrench, CheckCircle2, User } from 'lucide-react';

export const DashboardOverview = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome back, {user?.name || user?.username}!</h1>
            <span className="badge badge-admin" style={{ textTransform: 'uppercase' }}>{user?.role}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            You are logged into AssetFlow Enterprise. All systems are operational and connected to PostgreSQL backend on port 8000.
          </p>
        </div>

        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
          <CheckCircle2 size={24} />
        </div>
      </div>

      {/* Account Info Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} style={{ color: 'var(--accent-primary)' }} /> Account Credentials Overview
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.875rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Full Name</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.25rem' }}>{user?.name}</div>
          </div>

          <div style={{ padding: '0.875rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Username</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.25rem' }}>{user?.username}</div>
          </div>

          <div style={{ padding: '0.875rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.25rem' }}>{user?.email}</div>
          </div>

          <div style={{ padding: '0.875rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Role</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.25rem' }}>{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Module Overview Notice */}
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#EEF2FF',
          border: '1px solid #C7D2FE',
          borderRadius: '8px',
          color: '#3730A3',
          fontSize: '0.875rem'
        }}
      >
        <strong>Phase 0 Complete!</strong> Auth Token, User State, Protected Routing, and Side Navigation are fully integrated. In Phase 1, we will build the <strong>Organization Setup (Departments, Categories, Employees)</strong> module.
      </div>
    </div>
  );
};
