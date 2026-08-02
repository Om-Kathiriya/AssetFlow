import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';

// Generate hours from 7am to 9pm for the calendar grid
const CALENDAR_HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7..21

const formatHour = (h) => {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display} ${ampm}`;
};

const getWeekDates = (baseDate) => {
  const d = new Date(baseDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const nd = new Date(monday);
    nd.setDate(monday.getDate() + i);
    dates.push(nd);
  }
  return dates;
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS_COLORS = {
  UPCOMING: { bg: '#EEF2FF', border: '#818CF8', text: '#4338CA' },
  ONGOING: { bg: '#ECFDF5', border: '#34D399', text: '#065F46' },
  COMPLETED: { bg: '#F1F5F9', border: '#CBD5E1', text: '#64748B' },
  CANCELLED: { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' },
};

export const BookingCalendar = ({ bookings = [], currentWeek, onWeekChange }) => {
  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);

  const weekStart = weekDates[0];
  const weekEnd = new Date(weekDates[6]);
  weekEnd.setHours(23, 59, 59, 999);

  // Filter bookings that fall within this week
  const weekBookings = useMemo(() => {
    return bookings.filter(b => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return bStart <= weekEnd && bEnd >= weekStart;
    });
  }, [bookings, weekStart, weekEnd]);

  // Group bookings by day index (0=Mon...6=Sun)
  const bookingsByDay = useMemo(() => {
    const map = Array.from({ length: 7 }, () => []);
    weekBookings.forEach(b => {
      const bStart = new Date(b.startTime);
      weekDates.forEach((wd, idx) => {
        const dayStart = new Date(wd);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(wd);
        dayEnd.setHours(23, 59, 59, 999);

        const bEnd = new Date(b.endTime);
        if (bStart <= dayEnd && bEnd >= dayStart) {
          map[idx].push(b);
        }
      });
    });
    return map;
  }, [weekBookings, weekDates]);

  const prevWeek = () => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() - 7);
    onWeekChange(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + 7);
    onWeekChange(d);
  };

  const goToday = () => {
    onWeekChange(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Calculate position and height for a booking block
  const getBookingStyle = (booking, dayDate) => {
    const bStart = new Date(booking.startTime);
    const bEnd = new Date(booking.endTime);

    // Clamp to day boundaries
    const dayStart = new Date(dayDate);
    dayStart.setHours(7, 0, 0, 0);
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(22, 0, 0, 0);

    const clampedStart = bStart < dayStart ? dayStart : bStart;
    const clampedEnd = bEnd > dayEnd ? dayEnd : bEnd;

    const startMinutes = (clampedStart.getHours() - 7) * 60 + clampedStart.getMinutes();
    const endMinutes = (clampedEnd.getHours() - 7) * 60 + clampedEnd.getMinutes();

    const topPx = (startMinutes / 60) * 48; // 48px per hour
    const heightPx = Math.max(((endMinutes - startMinutes) / 60) * 48, 20);

    const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.UPCOMING;

    return {
      position: 'absolute',
      top: `${topPx}px`,
      height: `${heightPx}px`,
      left: '2px',
      right: '2px',
      backgroundColor: colors.bg,
      borderLeft: `3px solid ${colors.border}`,
      borderRadius: '4px',
      padding: '2px 4px',
      fontSize: '0.6875rem',
      color: colors.text,
      fontWeight: 600,
      overflow: 'hidden',
      cursor: 'default',
      zIndex: 2,
      lineHeight: 1.3,
      transition: 'box-shadow 0.15s ease',
    };
  };

  const monthLabel = weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>

      {/* Calendar Navigation Header */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={prevWeek}
            style={{ background: 'none', border: '1px solid var(--border-strong)', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextWeek}
            style={{ background: 'none', border: '1px solid var(--border-strong)', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}
          >
            <ChevronRight size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem', marginLeft: '0.5rem' }}>{monthLabel}</span>
        </div>

        <button
          onClick={goToday}
          className="btn btn-secondary"
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
        >
          Today
        </button>
      </div>

      {/* Day Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: '1px solid var(--border-subtle)' }}>
        {/* Time gutter header */}
        <div style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, borderRight: '1px solid var(--border-subtle)', backgroundColor: '#F8FAFC' }}>
          <Clock size={12} style={{ margin: '0 auto' }} />
        </div>

        {weekDates.map((date, idx) => {
          const today = isToday(date);
          return (
            <div
              key={idx}
              style={{
                padding: '0.5rem 0.25rem',
                textAlign: 'center',
                borderRight: idx < 6 ? '1px solid var(--border-subtle)' : 'none',
                backgroundColor: today ? 'var(--accent-subtle)' : '#F8FAFC',
              }}
            >
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                {DAY_LABELS[idx]}
              </div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: today ? 'var(--accent-primary)' : 'var(--text-main)',
                width: today ? '28px' : 'auto',
                height: today ? '28px' : 'auto',
                borderRadius: today ? '50%' : '0',
                backgroundColor: today ? 'var(--accent-primary)' : 'transparent',
                color: today ? '#FFFFFF' : 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                marginTop: '0.125rem',
              }}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid Body */}
      <div style={{ overflowY: 'auto', maxHeight: '520px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', position: 'relative' }}>

          {/* Left Time Gutter */}
          <div style={{ borderRight: '1px solid var(--border-subtle)' }}>
            {CALENDAR_HOURS.map(hour => (
              <div
                key={hour}
                style={{
                  height: '48px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  paddingTop: '2px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDates.map((date, dayIdx) => (
            <div
              key={dayIdx}
              style={{
                borderRight: dayIdx < 6 ? '1px solid var(--border-subtle)' : 'none',
                position: 'relative',
                backgroundColor: isToday(date) ? 'rgba(79, 70, 229, 0.02)' : 'transparent',
              }}
            >
              {/* Hour grid lines */}
              {CALENDAR_HOURS.map(hour => (
                <div
                  key={hour}
                  style={{
                    height: '48px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                />
              ))}

              {/* Booking blocks overlaid */}
              {bookingsByDay[dayIdx].map(booking => (
                <div
                  key={`${booking.id}-${dayIdx}`}
                  style={getBookingStyle(booking, date)}
                  title={`${booking.asset?.name || 'Resource'} — ${booking.user?.name || 'User'}\n${new Date(booking.startTime).toLocaleTimeString()} – ${new Date(booking.endTime).toLocaleTimeString()}\nStatus: ${booking.status}`}
                >
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {booking.asset?.assetTag || 'Asset'}
                  </div>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 400, opacity: 0.85 }}>
                    {booking.user?.name || ''}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
