import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck, ArrowRight, Info } from 'lucide-react';

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, username, email, password, confirmPassword } = formData;

    if (!name || !username || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await signup(formData);
      navigate('/verify-otp', {
        state: { email: formData.email, message: res.message || 'Verification code sent to your email.' }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
            Get Started with Enterprise Asset Tracking
          </h1>
          <p style={{ fontSize: '1rem', color: '#94A3B8', lineHeight: '1.6' }}>
            Create your account to manage hardware allocations, submit maintenance tickets, and track resource availability.
          </p>
        </div>

        <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
          AssetFlow Enterprise v1.0 • Built with PERN Stack
        </div>
      </div>

      {/* Right Signup Form Container */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.375rem' }}>Create an Account</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Register to join your organization's AssetFlow workspace</p>
          </div>

          {/* Admin Bootstrap Info Box */}
          <div className="alert" style={{ backgroundColor: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE', marginBottom: '1.25rem' }}>
            <Info size={18} /> First registered account automatically becomes <strong>ADMIN</strong>.
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <ShieldCheck size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name */}
            <div>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </div>

            {/* Username & Email Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="janedoe"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
            >
              {isSubmitting ? 'Creating Account...' : (
                <>Register Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>

        </div>
      </div>
    </div>
  );
};
