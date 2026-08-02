import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { DashboardOverview } from './pages/DashboardOverview';
import { OrganizationSetup } from './pages/OrganizationSetup';
import { AssetDirectory } from './pages/AssetDirectory';
import { AllocationsTransfers } from './pages/AllocationsTransfers';
import { ResourceBookings } from './pages/ResourceBookings';
import { MaintenanceOverview } from './pages/MaintenanceOverview';
import { AuditsOverview } from './pages/AuditsOverview';
import { ReportsOverview } from './pages/ReportsOverview';

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

            {/* Asset Directory Module (Phase 2) */}
            <Route path="assets" element={<AssetDirectory />} />

            {/* Allocations & Transfers Module (Phase 3) */}
            <Route path="allocations" element={<AllocationsTransfers />} />

            {/* Resource Bookings Module (Phase 4) */}
            <Route path="bookings" element={<ResourceBookings />} />

            {/* Maintenance Workflow Module (Phase 5) */}
            <Route path="maintenance" element={<MaintenanceOverview />} />

            {/* Audits & Compliance Module (Phase 6) */}
            <Route
              path="audits"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ASSET_MANAGER']}>
                  <AuditsOverview />
                </ProtectedRoute>
              }
            />
            {/* Reports & Executive Analytics Module (Phase 7) */}
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ASSET_MANAGER']}>
                  <ReportsOverview />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
