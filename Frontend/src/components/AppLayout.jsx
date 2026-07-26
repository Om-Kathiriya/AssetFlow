import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Boxes,
  ArrowLeftRight,
  CalendarCheck,
  Wrench,
  ClipboardCheck,
  FileBarChart,
  LogOut,
  Shield,
  User as UserIcon
} from 'lucide-react';

export const AppLayout = () => {
  const { user, logout } = useAuth();

  // Navigation Items mapped to roles
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE', 'TECHNICIAN'] },
    { label: 'Organization', path: '/organization', icon: Building2, roles: ['ADMIN'] },
    { label: 'Asset Directory', path: '/assets', icon: Boxes, roles: ['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE', 'TECHNICIAN'] },
    { label: 'Allocations', path: '/allocations', icon: ArrowLeftRight, roles: ['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE'] },
    { label: 'Resource Bookings', path: '/bookings', icon: CalendarCheck, roles: ['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE', 'TECHNICIAN'] },
    { label: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['ADMIN', 'ASSET_MANAGER', 'EMPLOYEE', 'TECHNICIAN'] },
    { label: 'Audits', path: '/audits', icon: ClipboardCheck, roles: ['ADMIN', 'ASSET_MANAGER'] },
    { label: 'Reports', path: '/reports', icon: FileBarChart, roles: ['ADMIN', 'ASSET_MANAGER'] },
  ];

  const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(user?.role));

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-admin';
      case 'ASSET_MANAGER': return 'badge-manager';
      case 'TECHNICIAN': return 'badge-tech';
      default: return 'badge-employee';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Handcrafted Sidebar */}
      <aside
        style={{
          width: '240px',
          backgroundColor: 'var(--bg-sidebar)',
          color: '#94A3B8',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          borderRight: '1px solid #1E293B'
        }}
      >
        <div>
          {/* Brand Logo Header */}
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #1E293B' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
              AF
            </div>
            <div>
              <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>AssetFlow</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Enterprise AMS</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Badge & Logout Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1F5F9' }}>
              <UserIcon size={18} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#F8FAFC', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || user?.username}
              </div>
              <span className={`badge ${getRoleBadgeClass(user?.role)}`} style={{ fontSize: '0.65rem', marginTop: '0.125rem' }}>
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#F8FAFC')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            padding: '0 2rem'
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            System Status: <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Connected</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Logged in as <strong>{user?.email}</strong>
            </span>
          </div>
        </header>

        {/* Dynamic Route Content Outlet */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
