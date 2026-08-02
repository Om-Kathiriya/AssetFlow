import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from './notifications/NotificationDrawer';
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
  User as UserIcon,
  Bell
} from 'lucide-react';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
          backgroundColor: 'var(--bg-sidebar)',
          color: '#94A3B8',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          borderRight: '1px solid #1E293B',
          zIndex: 40
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
          {/* Brand Logo Header with Notification Bell */}
          <div style={{ padding: '1.25rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                AF
              </div>
              <div>
                <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>AssetFlow</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Enterprise AMS</div>
              </div>
            </div>

            {/* Notification Bell Button */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              title="Notification Center"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '0.375rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                position: 'relative'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#F8FAFC')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}
            >
              <Bell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444'
                }}
              />
            </button>
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
        <div style={{ padding: '1rem', borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1F5F9', flexShrink: 0 }}>
              <UserIcon size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#F8FAFC', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || user?.username}
              </div>
              <span className={`badge ${getRoleBadgeClass(user?.role)}`} style={{ fontSize: '0.65rem', marginTop: '0.125rem', display: 'inline-block' }}>
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
              alignItems: 'center',
              flexShrink: 0
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
        {/* Dynamic Route Content Outlet */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </div>

        {/* Notification Drawer */}
        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      </main>
    </div>
  );
};
