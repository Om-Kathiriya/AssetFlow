import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, RefreshCw, CheckCircle2, Lock } from 'lucide-react';

export const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, resendOTP } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // 60-second countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input on page load
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Auto focus to next input
      if (value && index < 5 && inputRefs[index + 1].current) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      if (inputRefs[5].current) {
        inputRefs[5].current.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (!email) {
      setError('Missing email address. Please return to the Signup page.');
      return;
    }

    if (fullOtp.length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await verifyOTP(email, fullOtp);
      setSuccess(res.message || 'Email verified successfully!');

      setTimeout(() => {
        navigate('/login', { state: { message: 'Email verified successfully! Please sign in with your password.' } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending || !email) return;

    try {
      setResending(true);
      setError('');
      setSuccess('');

      const res = await resendOTP(email);
      setSuccess(res.message || 'A new 6-digit OTP code has been sent to your email.');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs[0].current) {
        inputRefs[0].current.focus();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Left Brand Panel */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          backgroundImage: 'radial-gradient(#1E293B 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
            AF
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>AssetFlow</span>
        </div>

        <div style={{ maxWidth: '440px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Complete Lifecycle Asset Management
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Track hardware, manage allocations, automate maintenance workflows, and run physical audit verification sessions across your organization.
          </p>
          <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
            AssetFlow Enterprise v1.0 • Built with PERN Stack
          </div>
        </div>
      </div>

      {/* Right Form Container */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#FFFFFF',
            padding: '2.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
            border: '1px solid #E2E8F0'
          }}
        >
          {/* Header Title */}
          <div style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <ShieldCheck size={24} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.375rem 0', color: '#0F172A' }}>
              Verify Your Email
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Enter the 6-digit security code sent to:
              <br />
              <strong style={{ color: '#1E293B' }}>{email || 'your email'}</strong>
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                marginBottom: '1.5rem'
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #86EFAC',
                color: '#166534',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={18} /> {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '0.5rem',
                marginBottom: '1.75rem'
              }}
              onPaste={handlePaste}
            >
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  style={{
                    width: '48px',
                    height: '56px',
                    fontSize: '1.375rem',
                    fontWeight: '700',
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    border: digit ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#4F46E5',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.2s ease'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw className="spin" size={18} /> Verifying Code...
                </>
              ) : (
                <>
                  Verify Email Address <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Resend Action */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 0.5rem 0' }}>
              Didn't receive the email code?
            </p>

            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              style={{
                background: 'none',
                border: 'none',
                color: countdown > 0 ? '#94A3B8' : '#4F46E5',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.5rem'
              }}
            >
              {resending ? (
                <>
                  <RefreshCw className="spin" size={14} /> Sending fresh code...
                </>
              ) : countdown > 0 ? (
                <>Resend OTP in {countdown}s</>
              ) : (
                <>
                  <RefreshCw size={14} /> Click to Resend OTP Code
                </>
              )}
            </button>

            <div style={{ marginTop: '1.25rem' }}>
              <Link to="/login" style={{ fontSize: '0.8125rem', color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}>
                ← Return to Login Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
