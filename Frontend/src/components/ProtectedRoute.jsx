import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>Loading AssetFlow...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '4rem auto' }}>
        <div className="alert alert-danger" style={{ padding: '1.5rem', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1rem' }}>
            <ShieldAlert size={20} /> Access Restricted
          </div>
          <p style={{ marginTop: '0.5rem', color: '#7F1D1D', fontSize: '0.875rem' }}>
            Your account role (<strong>{user?.role}</strong>) does not have permission to view this section.
          </p>
        </div>
      </div>
    );
  }

  return children;
};
