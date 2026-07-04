import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon,
  EyeIcon, MagnifyingGlassIcon, ArrowPathIcon, PlusIcon,
  ClipboardDocumentListIcon, PhotoIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import * as complaintsApi from '../api/complaints';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const statusMeta = {
  pending: { label: 'Pending', cls: 'badge-pending', icon: ClockIcon },
  in_progress: { label: 'In Progress', cls: 'badge-progress', icon: ExclamationTriangleIcon },
  resolved: { label: 'Resolved', cls: 'badge-resolved', icon: CheckCircleIcon },
  closed: { label: 'Closed', cls: 'badge-closed', icon: XCircleIcon },
};

const priorityMeta = {
  low: { label: 'Low', cls: 'badge-low', dot: 'priority-dot-low' },
  medium: { label: 'Medium', cls: 'badge-medium', dot: 'priority-dot-medium' },
  high: { label: 'High', cls: 'badge-high', dot: 'priority-dot-high' },
  urgent: { label: 'Urgent', cls: 'badge-urgent', dot: 'priority-dot-urgent' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState({ status: '', search: '' });

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintsApi.getAllComplaints(filter);
      setComplaints(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const filtered = complaints.filter(c => {
    if (filter.status && c.status !== filter.status) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="page-layout">
      <Sidebar />

      <main className="page-content">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-700 text-gray-900" style={{ fontWeight: 700 }}>My Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your maintenance complaints</p>
          </div>
          <Link to="/complaint/new" className="btn-primary">
            <PlusIcon className="h-3.5 w-3.5" />
            Create Request
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: '#0052cc' },
            { label: 'Pending', value: stats.pending, color: '#ff8b00' },
            { label: 'In Progress', value: stats.inProgress, color: '#0747a6' },
            { label: 'Resolved', value: stats.resolved, color: '#006644' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{s.label}</div>
                <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              className="field-input pl-9 text-sm"
              placeholder="Search requests..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <select
            className="field-input text-sm w-full sm:w-44"
            value={filter.status}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button onClick={fetchComplaints} className="btn-secondary">
            <ArrowPathIcon className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="empty-state">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-sm">Loading requests...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <ClipboardDocumentListIcon className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold mb-1">No requests found</p>
              <p className="text-xs text-gray-400">Try adjusting your filters or create a new request</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="issues-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Summary</th>
                    <th>Category</th>
                    <th>Apt</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const sm = statusMeta[c.status] || statusMeta.closed;
                    const pm = priorityMeta[c.priority] || priorityMeta.low;
                    return (
                      <tr key={c.id}>
                        <td><span className="issue-key">SMT-{c.id}</span></td>
                        <td className="max-w-xs">
                          <button
                            onClick={() => setSelected(c)}
                            className="text-left font-medium text-blue-700 hover:underline text-sm"
                          >
                            {c.title}
                          </button>
                        </td>
                        <td>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {c.category_name}
                          </span>
                        </td>
                        <td className="text-xs text-gray-500">{c.user_apartment}</td>
                        <td><span className={`badge ${sm.cls}`}>{sm.label}</span></td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className={`priority-dot ${pm.dot}`} />
                            <span className="text-xs text-gray-600">{pm.label}</span>
                          </div>
                        </td>
                        <td className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <button onClick={() => setSelected(c)} className="btn-secondary py-1 px-2.5 text-xs">
                            <EyeIcon className="h-3 w-3" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Detail Drawer */}
      {selected && (
        <>
          <div className="drawer-overlay fade-in" onClick={() => setSelected(null)} />
          <aside className="drawer slide-from-right">
            <div className="drawer-header">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="issue-key text-xs">SMT-{selected.id}</span>
                  <h2 className="text-base font-bold text-gray-900 mt-1">{selected.title}</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="btn-secondary p-1.5 mt-0.5 shrink-0"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Status + Priority row */}
              <div className="flex flex-wrap gap-2 mt-3">
                {(() => {
                  const sm = statusMeta[selected.status] || statusMeta.closed;
                  const pm = priorityMeta[selected.priority] || priorityMeta.low;
                  return (
                    <>
                      <span className={`badge ${sm.cls}`}>{sm.label}</span>
                      <span className={`badge ${pm.cls}`}>{pm.label}</span>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="drawer-body space-y-6">
              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <div className="field-label mb-1">Category</div>
                  <div className="text-gray-800">{selected.category_name}</div>
                </div>
                <div>
                  <div className="field-label mb-1">Apartment</div>
                  <div className="text-gray-800">{selected.user_apartment}</div>
                </div>
                {selected.location && (
                  <div className="col-span-2">
                    <div className="field-label mb-1">Location</div>
                    <div className="text-gray-800">{selected.location}</div>
                  </div>
                )}
                <div className="col-span-2">
                  <div className="field-label mb-1">Reported</div>
                  <div className="text-gray-800">
                    {new Date(selected.created_at).toLocaleString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <hr className="divider" />

              {/* Description */}
              <div>
                <div className="field-label mb-2">Description</div>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200">
                  {selected.description}
                </p>
              </div>

              {/* Photos */}
              {selected.photo_urls?.length > 0 && (
                <div>
                  <div className="field-label mb-2">Attachments ({selected.photo_urls.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.photo_urls.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={`http://localhost:3000${url}`}
                          alt={`Photo ${i + 1}`}
                          className="h-20 w-20 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-90"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded flex items-center justify-center transition-opacity">
                          <EyeIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <hr className="divider" />

              {/* History / Activity */}
              <div>
                <div className="field-label mb-4">Activity</div>
                {selected.history?.length > 0 ? (
                  <div className="timeline">
                    {selected.history.map((entry, i) => (
                      <div key={entry.id || i} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="text-xs font-bold text-blue-700 mb-0.5">
                          {entry.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(entry.created_at).toLocaleString()} · {entry.user_name} ({entry.user_role})
                        </div>
                        {(entry.old_value || entry.new_value) && (
                          <div className="text-xs bg-gray-50 border border-gray-200 rounded p-2 flex items-center gap-2">
                            {entry.old_value && <span className="text-red-600 line-through">{entry.old_value}</span>}
                            {entry.old_value && entry.new_value && <span className="text-gray-400">→</span>}
                            {entry.new_value && <span className="text-green-700 font-semibold">{entry.new_value}</span>}
                          </div>
                        )}
                        {entry.comment && (
                          <p className="text-xs text-gray-600 mt-1 italic border-l-2 border-blue-300 pl-2">
                            {entry.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded border border-dashed border-gray-300">
                    <ClockIcon className="h-7 w-7 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No activity yet</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
