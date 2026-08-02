import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { BookingsTab } from '../components/bookings/BookingsTab';
import { CreateBookingModal } from '../components/bookings/CreateBookingModal';
import { CalendarCheck, Plus } from 'lucide-react';

export const ResourceBookings = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bookableAssets, setBookableAssets] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchBookableAssets = async () => {
    try {
      const res = await api.get('/assets');
      const all = res.data.assets || [];
      setBookableAssets(all.filter(a => a.isBookable));
    } catch {
      // Silent fail — modal will show warning
    }
  };

  useEffect(() => {
    fetchBookableAssets();
  }, []);

  const handleRefreshAll = () => {
    fetchBookableAssets();
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{ maxWidth: '1150px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarCheck size={24} style={{ color: 'var(--accent-primary)' }} />
            Resource Bookings
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Reserve shared resources like meeting rooms, projectors, and vehicles. View availability on the calendar and manage bookings.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} /> Book Resource
        </button>
      </div>

      {/* Bookings Tab (Calendar + List Views) */}
      <BookingsTab refreshTrigger={refreshTrigger} />

      {/* Create Booking Modal */}
      <CreateBookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRefresh={handleRefreshAll}
        bookableAssets={bookableAssets}
      />
    </div>
  );
};
