import React, { useEffect, useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as adminApi from '../api/admin';
import * as noticesApi from '../api/notices';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const PRIORITY = {
  urgent: { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700 font-bold', border: 'border-red-400' },
  high: { bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700 font-bold', border: 'border-orange-400' },
  normal: { bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 font-bold', border: 'border-blue-300' },
  low: { bar: 'bg-gray-300', badge: 'bg-gray-100 text-gray-600 font-bold', border: 'border-gray-300' },
};

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', expires_at: '' });

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await noticesApi.getAllNotices();
      setNotices(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createNotice(form);
      setForm({ title: '', content: '', priority: 'normal', expires_at: '' });
      setShowForm(false);
      fetchNotices();
    } catch { alert('Failed to create notice'); }
  };

  const isExpired = (d) => d && new Date(d) < new Date();

  const visible = notices
    .filter(n => n.is_active && !isExpired(n.expires_at))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notice Board</h1>
            <p className="text-sm text-gray-500 mt-0.5">Society announcements and important information</p>
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <PlusIcon className="h-3.5 w-3.5" /> Post Notice
            </button>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">New Notice</h3>
              <button onClick={() => setShowForm(false)} className="btn-secondary p-1.5">
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="field-label mb-1">Title</label>
                <input type="text" required className="field-input text-sm"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notice title" />
              </div>
              <div>
                <label className="field-label mb-1">Content</label>
                <textarea required rows="4" className="field-input text-sm resize-none"
                  value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Notice content..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label mb-1">Priority</label>
                  <select className="field-input text-sm" value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="field-label mb-1">Expires At (optional)</label>
                  <input type="datetime-local" className="field-input text-sm"
                    value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" className="btn-primary text-sm">Post Notice</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="empty-state card">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-sm">Loading notices...</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state card">
            <p className="text-sm font-semibold text-gray-600">No active notices</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for announcements</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(n => {
              const p = PRIORITY[n.priority] || PRIORITY.normal;
              return (
                <div key={n.id} className={`card flex overflow-hidden border-l-4 ${p.border}`}>
                  <div className="flex-1 p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900">{n.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wide ${p.badge}`}>
                        {n.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{n.content}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span>Posted by <span className="text-gray-600 font-medium">{n.author_name}</span></span>
                      <span>{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {n.expires_at && (
                        <span>Expires {new Date(n.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
