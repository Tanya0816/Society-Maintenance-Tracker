import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BuildingOfficeIcon,
  HomeIcon,
  BellIcon,
  ShieldCheckIcon,
  PlusIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const NAV_LINKS = [
  { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { to: '/complaint/new', icon: PlusIcon, label: 'New Request' },
  { to: '/notices', icon: BellIcon, label: 'Notices' },
  { to: '/login', icon: UserCircleIcon, label: 'Login' },
  { to: '/signup', icon: UserCircleIcon, label: 'Sign Up' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', role: 'resident' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password, form.role);
    if (result.success) navigate(form.role === 'admin' ? '/admin' : '/dashboard');
    else setError(result.error);
    setLoading(false);
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
              key={to}
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
          <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-5">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label mb-1">Email address</label>
              <input
                type="email"
                required
                className="field-input text-sm"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="field-label mb-1">Password</label>
              <input
                type="password"
                required
                className="field-input text-sm"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="field-label mb-1">Role</label>
              <select
                className="field-input text-sm"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                <option value="resident">Resident</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {error && (
              <div className="border border-red-200 bg-red-50 text-red-700 rounded p-2.5 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading
                ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                : 'Sign in'
              }
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5 pt-4 border-t border-gray-100">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
