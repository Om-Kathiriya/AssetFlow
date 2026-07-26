import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { DashboardOverview } from './pages/DashboardOverview';
import { OrganizationSetup } from './pages/OrganizationSetup';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Application Layout Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            
            {/* Organization Setup Module (Phase 1) */}
            <Route
              path="organization"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ASSET_MANAGER']}>
                  <OrganizationSetup />
                </ProtectedRoute>
              }
            />

            {/* Placeholder routes for upcoming phases */}
            <Route path="assets" element={<div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}><h3>Asset Directory Screen (Phase 2)</h3></div>} />
            <Route path="allocations" element={<div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}><h3>Allocations & Transfers Screen (Phase 3)</h3></div>} />
            <Route path="bookings" element={<div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}><h3>Resource Bookings Screen (Phase 4)</h3></div>} />
            <Route path="maintenance" element={<div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}><h3>Maintenance Kanban Screen (Phase 5)</h3></div>} />
            <Route path="audits" element={<div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}><h3>Audits & Compliance Screen (Phase 6)</h3></div>} />
            <Route path="reports" element={<div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}><h3>Reports & Analytics Screen (Phase 7)</h3></div>} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
