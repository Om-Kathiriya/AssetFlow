import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Eye, EyeOff, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const location = useLocation();
  const [identifier, setIdentifier] = useState(location.state?.email || ''); // Pre-fill Email/Username if redirected
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please enter your email/username and password');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: identifier, password });
      navigate('/');
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        navigate('/verify-otp', {
          state: {
            email: err.response.data.email || formData.email,
            message: err.response.data.error || 'Please verify your email address to log in.'
          }
        });
        return;
      }
      setError(err.response?.data?.error || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
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
          justify: 'space-between',
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

        <div style={{ maxWidth: '480px' }}>
          <h1 style={{ fontSize: '2.25rem', lineHeight: '2.75rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1rem' }}>
            Complete Lifecycle Asset Management
          </h1>
          <p style={{ fontSize: '1rem', color: '#94A3B8', lineHeight: '1.6' }}>
            Track hardware, manage allocations, automate maintenance workflows, and run physical audit verification sessions across your organization.
          </p>
        </div>

        <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
          AssetFlow Enterprise v1.0 • Built with PERN Stack
        </div>
      </div>

      {/* Right Login Form Container */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.375rem' }}>Log in to your account</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Enter your credentials to access your dashboard</p>
          </div>

          {successMessage && (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem', backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} /> {successMessage}
            </div>
          )}

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
              <Shield size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Identifier Input */}
            <div>
              <label htmlFor="identifier">Email or Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="identifier"
                  type="text"
                  placeholder="admin or user@company.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                  autoFocus
                />
                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label htmlFor="password" style={{ margin: 0 }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
            >
              {isSubmitting ? 'Authenticating...' : (
                <>Sign in to AssetFlow <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
            Don't have an account? <Link to="/signup">Create an account</Link>
          </div>

        </div>
      </div>
    </div>
  );
};
