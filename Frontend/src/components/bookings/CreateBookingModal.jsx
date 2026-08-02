import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, CalendarCheck, AlertTriangle, Clock } from 'lucide-react';

export const CreateBookingModal = ({ isOpen, onClose, onRefresh, bookableAssets = [] }) => {
  const [assetId, setAssetId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState('');
  const [conflictWarning, setConflictWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAssetId('');
      setStartDate('');
      setStartTime('09:00');
      setEndDate('');
      setEndTime('10:00');
      setError('');
      setConflictWarning('');
    }
  }, [isOpen]);

  // Live conflict check when asset or times change
  useEffect(() => {
    if (!assetId || !startDate || !startTime || !endDate || !endTime) {
      setConflictWarning('');
      return;
    }

    const startISO = new Date(`${startDate}T${startTime}`);
    const endISO = new Date(`${endDate}T${endTime}`);

    if (isNaN(startISO.getTime()) || isNaN(endISO.getTime()) || endISO <= startISO) {
      setConflictWarning('');
      return;
    }

    const checkConflict = async () => {
      try {
        setIsCheckingConflict(true);
        const res = await api.get('/bookings', { params: { assetId } });
        const bookings = res.data.bookings || [];

        const overlapping = bookings.find(b => {
          if (b.status === 'CANCELLED' || b.status === 'COMPLETED') return false;
          const bStart = new Date(b.startTime);
          const bEnd = new Date(b.endTime);
          return startISO < bEnd && endISO > bStart;
        });

        if (overlapping) {
          const overlapStart = new Date(overlapping.startTime);
          const overlapEnd = new Date(overlapping.endTime);
          setConflictWarning(
            `Time Slot Conflict: This resource is already booked from ${overlapStart.toLocaleString()} to ${overlapEnd.toLocaleString()} by ${overlapping.user?.name || 'another user'}. Please choose a different time window.`
          );
        } else {
          setConflictWarning('');
        }
      } catch {
        // Silent fail on conflict check — server will still validate
      } finally {
        setIsCheckingConflict(false);
      }
    };

    const debounce = setTimeout(checkConflict, 400);
    return () => clearTimeout(debounce);
  }, [assetId, startDate, startTime, endDate, endTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!assetId || !startDate || !startTime || !endDate || !endTime) {
      setError('Please fill in all required fields');
      return;
    }

    const startISO = new Date(`${startDate}T${startTime}`).toISOString();
    const endISO = new Date(`${endDate}T${endTime}`).toISOString();

    try {
      setIsSubmitting(true);
      await api.post('/bookings', {
        assetId,
        startTime: startISO,
        endTime: endISO
      });

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Time slot presets
  const timeSlots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      timeSlots.push(`${hh}:${mm}`);
    }
  }

  const formatTimeLabel = (t) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${display}:${m} ${ampm}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '560px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
            <CalendarCheck size={20} style={{ color: 'var(--accent-primary)' }} />
            Book a Resource
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* 🟥 Conflict Red Dotted Warning Box */}
          {conflictWarning && (
            <div style={{ padding: '0.875rem 1rem', backgroundColor: '#FEF2F2', border: '2px dashed #EF4444', borderRadius: '6px', color: '#991B1B', fontSize: '0.8125rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, color: '#DC2626', marginTop: '0.125rem' }} />
              <div>{conflictWarning}</div>
            </div>
          )}

          {/* Select Bookable Asset */}
          <div>
            <label htmlFor="bookAsset">Select Bookable Resource *</label>
            <select id="bookAsset" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              <option value="">-- Choose a bookable resource --</option>
              {bookableAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.name}
                </option>
              ))}
            </select>
            {bookableAssets.length === 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: '0.25rem' }}>
                No bookable assets found. Mark assets as "Bookable" in Asset Directory.
              </div>
            )}
          </div>

          {/* Start Date & Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label htmlFor="bookStartDate">Start Date *</label>
              <input
                id="bookStartDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate) setEndDate(e.target.value);
                }}
              />
            </div>
            <div>
              <label htmlFor="bookStartTime">Start Time *</label>
              <select id="bookStartTime" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                {timeSlots.map(t => (
                  <option key={`start-${t}`} value={t}>{formatTimeLabel(t)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* End Date & Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label htmlFor="bookEndDate">End Date *</label>
              <input
                id="bookEndDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="bookEndTime">End Time *</label>
              <select id="bookEndTime" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                {timeSlots.map(t => (
                  <option key={`end-${t}`} value={t}>{formatTimeLabel(t)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Checking indicator */}
          {isCheckingConflict && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Clock size={12} /> Checking availability...
            </div>
          )}

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !!conflictWarning}>
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
