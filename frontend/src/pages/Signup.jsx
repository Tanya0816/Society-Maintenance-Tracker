import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BuildingOfficeIcon,
  HomeIcon,
  BellIcon,
  PlusIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'resident', apartment: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.apartment) { setError('All fields are required'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          role: form.role, apartment: form.apartment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const result = await login(form.email, form.password, form.role);
        if (result.success) navigate(form.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/complaint/new', icon: PlusIcon, label: 'New Request' },
    { to: '/notices', icon: BellIcon, label: 'Notices' },
    { to: '/login', icon: UserCircleIcon, label: 'Login' },
    { to: '/signup', icon: UserCircleIcon, label: 'Sign Up' },
  ];

  return (
    <div className="auth-page">
      {/* Top navbar */}
      <header className="auth-topbar">
        <Link to="/" className="auth-topbar-brand">
          <BuildingOfficeIcon className="h-4 w-4" />
          SocietyTrack
        </Link>

        <nav className="auth-nav-links">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={label}
              to={to}
              className={`auth-nav-link ${location.pathname === to ? 'active' : ''}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Centered form */}
      <div className="auth-body">
        <div className="auth-card">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-5">Fill in the details below to get started</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="field-label mb-1">Full name</label>
                <input type="text" required className="field-input text-sm"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name" />
              </div>
              <div className="col-span-2">
                <label className="field-label mb-1">Email address</label>
                <input type="email" required className="field-input text-sm"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="field-label mb-1">Apartment</label>
                <input type="text" required className="field-input text-sm"
                  value={form.apartment} onChange={e => setForm(f => ({ ...f, apartment: e.target.value }))}
                  placeholder="A-101" />
              </div>
              <div>
                <label className="field-label mb-1">Role</label>
                <select className="field-input text-sm" value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="resident">Resident</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="field-label mb-1">Password</label>
                <input type="password" required className="field-input text-sm"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="field-label mb-1">Confirm password</label>
                <input type="password" required className="field-input text-sm"
                  value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="••••••••" />
              </div>
            </div>

            {error && (
              <div className="border border-red-200 bg-red-50 text-red-700 rounded p-2.5 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading
                ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                : 'Create account'
              }
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5 pt-4 border-t border-gray-100">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
