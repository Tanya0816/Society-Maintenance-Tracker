import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { PhotoIcon, XMarkIcon, PaperAirplaneIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const CATEGORIES = [
  { value: 'Plumbing', label: 'Plumbing', emoji: '🔧' },
  { value: 'Electrical', label: 'Electrical', emoji: '⚡' },
  { value: 'Structural', label: 'Structural', emoji: '🏗️' },
  { value: 'Cleaning', label: 'Cleaning', emoji: '🧹' },
  { value: 'Security', label: 'Security', emoji: '🔒' },
  { value: 'Garden', label: 'Garden', emoji: '🌿' },
  { value: 'Other', label: 'Other', emoji: '📋' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', desc: 'Non-urgent, can wait', color: '#36b37e' },
  { value: 'medium', label: 'Medium', desc: 'Needs attention soon', color: '#ff8b00' },
  { value: 'high', label: 'High', desc: 'Urgent, affects daily life', color: '#de350b' },
];

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (p) => location.pathname === p;
  return (
    <aside className="sidebar hidden md:flex flex-col">
      <div className="sidebar-section">Navigation</div>
      <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
        <ClipboardDocumentListIcon className="h-4 w-4" /> My Requests
      </Link>
      <Link to="/notices" className={`sidebar-link ${isActive('/notices') ? 'active' : ''}`}>
        <BellIcon className="h-4 w-4" /> Notices
      </Link>
      {user?.role === 'admin' && (
        <Link to="/admin" className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}>
          <ShieldCheckIcon className="h-4 w-4" /> Admin Panel
        </Link>
      )}
      <div className="sidebar-section mt-4">Actions</div>
      <Link to="/complaint/new" className="sidebar-link active">
        <PlusIcon className="h-4 w-4" /> Create Request
      </Link>
    </aside>
  );
}

export default function ComplaintForm() {
  const navigate = useNavigate();
  const { createComplaint } = useComplaints();
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'medium', photos: [] });
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setForm(f => ({ ...f, photos: [...f.photos, ...files] }));
    setPreviews(p => [...p, ...files.map(file => URL.createObjectURL(file))]);
  };

  const removePhoto = (i) => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await createComplaint(form);
    if (result.success) navigate('/dashboard');
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="btn-secondary p-1.5">
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Request</h1>
            <p className="text-sm text-gray-500 mt-0.5">Submit a new maintenance complaint</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Summary */}
            <div className="card p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="field-label mb-1">Summary *</label>
                  <input type="text" required className="field-input text-sm"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Brief description of the issue" />
                </div>
                <div>
                  <label className="field-label mb-1">Description *</label>
                  <textarea required rows="5" className="field-input text-sm resize-none"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Provide full details — location, when it started, how it affects you..." />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="card p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Category *</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <label key={cat.value}
                    className={`cursor-pointer border rounded p-3 text-center transition-all ${form.category === cat.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}>
                    <input type="radio" name="category" value={cat.value} required className="sr-only"
                      checked={form.category === cat.value}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="text-xs font-semibold text-gray-700">{cat.label}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="card p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Priority *</h2>
              <div className="grid grid-cols-3 gap-3">
                {PRIORITIES.map(p => (
                  <label key={p.value}
                    className={`cursor-pointer border rounded p-3 transition-all ${form.priority === p.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}>
                    <input type="radio" name="priority" value={p.value} className="sr-only"
                      checked={form.priority === p.value}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                      <span className="text-sm font-semibold text-gray-800">{p.label}</span>
                    </div>
                    <div className="text-xs text-gray-500">{p.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div className="card p-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Attachments (optional)</h2>
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt={`Preview ${i + 1}`}
                        className="h-16 w-16 object-cover rounded border border-gray-200" />
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handlePhotos} className="sr-only" />
                <PhotoIcon className="h-7 w-7 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600"><span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</span>
              </label>
            </div>

            {error && (
              <div className="border border-red-200 bg-red-50 text-red-700 rounded p-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /><span>Submitting...</span></>
                ) : (
                  <><PaperAirplaneIcon className="h-3.5 w-3.5" /><span>Submit Request</span></>
                )}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
