import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  UserPlusIcon,
  ArrowRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'resident',
    apartment: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.apartment) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Call register API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after signup
        const result = await login(formData.email, formData.password, formData.role);
        if (result.success) {
          navigate(formData.role === 'admin' ? '/admin' : '/dashboard');
        }
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Illustration/Branding */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative">
              <BuildingOfficeIcon className="h-20 w-20 text-purple-600" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center floating-animation">
                <UserPlusIcon className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join Our Community
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              Create Your Account
            </p>
            <p className="text-gray-600 leading-relaxed">
              Sign up to start reporting issues, tracking maintenance requests, 
              and staying connected with your community management.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6">
            {[
              { icon: '📝', label: 'Report Issues' },
              { icon: '📊', label: 'Track Progress' },
              { icon: '🔔', label: 'Get Updates' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-4 glass-card">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <div className="text-sm font-semibold text-gray-700">{feature.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="glass-card p-8 slide-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">Join our community today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 mr-2 text-purple-600" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-modern"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <EnvelopeIcon className="h-4 w-4 mr-2 text-purple-600" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-modern"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <HomeIcon className="h-4 w-4 mr-2 text-purple-600" />
                Apartment Number
              </label>
              <input
                type="text"
                value={formData.apartment}
                onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                className="input-modern"
                placeholder="A-101"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <LockClosedIcon className="h-4 w-4 mr-2 text-purple-600" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-modern"
                placeholder="••••••••"
                required
                minLength="6"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <LockClosedIcon className="h-4 w-4 mr-2 text-purple-600" />
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input-modern"
                placeholder="••••••••"
                required
                minLength="6"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 mr-2 text-purple-600" />
                I want to join as...
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-modern cursor-pointer"
              >
                <option value="resident">🏠 Resident</option>
                <option value="admin">👑 Administrator</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient-blue py-4 text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-800 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;