import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon,
  ArrowUpIcon, ArrowDownIcon, PhotoIcon, MagnifyingGlassIcon,
  ArrowPathIcon, PlusIcon, ClipboardDocumentListIcon, EyeIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import * as adminApi from '../api/admin';
import * as categoriesApi from '../api/categories';
import Sidebar from '../components/Sidebar';

const statusMeta = {
  pending: { label: 'Pending', cls: 'badge-pending' },
  in_progress: { label: 'In Progress', cls: 'badge-progress' },
  resolved: { label: 'Resolved', cls: 'badge-resolved' },
  closed: { label: 'Closed', cls: 'badge-closed' },
};

const priorityMeta = {
  low: { label: 'Low', cls: 'badge-low', dot: 'priority-dot-low' },
  medium: { label: 'Medium', cls: 'badge-medium', dot: 'priority-dot-medium' },
  high: { label: 'High', cls: 'badge-high', dot: 'priority-dot-high' },
  urgent: { label: 'Urgent', cls: 'badge-urgent', dot: 'priority-dot-urgent' },
};

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState({
    status: '', priority: '', category_id: '', search: '',
    has_photo: '', sort_by: 'created_at', sort_order: 'DESC',
  });

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, catRes] = await Promise.all([
        adminApi.getAdminComplaints(filter),
        categoriesApi.getAllCategories(),
      ]);
      setComplaints(cRes.data || []);
      setStats(cRes.stats || null);
      setCategories(catRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try { await adminApi.updateComplaintStatus(id, status, ''); fetchData(); }
    catch { alert('Failed to update status'); }
  };

  const updatePriority = async (id, priority) => {
    try { await adminApi.updateComplaintPriority(id, priority, ''); fetchData(); }
    catch { alert('Failed to update priority'); }
  };

  const handleSort = (field) => setFilter(p => ({
    ...p, sort_by: field,
    sort_order: p.sort_by === field && p.sort_order === 'DESC' ? 'ASC' : 'DESC',
  }));

  const SortIcon = ({ field }) => {
    if (filter.sort_by !== field) return null;
    return filter.sort_order === 'ASC'
      ? <ArrowUpIcon className="h-3 w-3 ml-1 inline" />
      : <ArrowDownIcon className="h-3 w-3 ml-1 inline" />;
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="page-content">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">All Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and resolve society maintenance complaints</p>
          </div>
          <Link to="/complaint/new" className="btn-primary">
            <PlusIcon className="h-3.5 w-3.5" /> Create Request
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: stats.total_complaints, color: '#0052cc' },
              { label: 'Pending', value: stats.pending, color: '#ff8b00' },
              { label: 'In Progress', value: stats.in_progress, color: '#0747a6' },
              { label: 'Resolved', value: stats.resolved, color: '#006644' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{s.label}</div>
                  <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input type="text" className="field-input pl-9 text-sm" placeholder="Search..."
                value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
            </div>
            <select className="field-input text-sm" value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select className="field-input text-sm" value={filter.priority}
              onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select className="field-input text-sm" value={filter.category_id}
              onChange={e => setFilter(f => ({ ...f, category_id: e.target.value }))}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="field-input text-sm" value={filter.has_photo}
              onChange={e => setFilter(f => ({ ...f, has_photo: e.target.value }))}>
              <option value="">All (photos)</option>
              <option value="true">With Photos</option>
              <option value="false">Without Photos</option>
            </select>
            <select className="field-input text-sm" value={filter.sort_by}
              onChange={e => setFilter(f => ({ ...f, sort_by: e.target.value }))}>
              <option value="created_at">Sort: Date Created</option>
              <option value="updated_at">Sort: Last Updated</option>
              <option value="priority">Sort: Priority</option>
              <option value="status">Sort: Status</option>
            </select>
            <button className="btn-secondary text-sm" onClick={() =>
              setFilter({ status: '', priority: '', category_id: '', search: '', has_photo: '', sort_by: 'created_at', sort_order: 'DESC' })}>
              Clear Filters
            </button>
            <button className="btn-primary text-sm" onClick={fetchData}>
              <ArrowPathIcon className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="empty-state">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-sm">Loading...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="empty-state">
              <ClipboardDocumentListIcon className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">No requests match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="issues-table">
                <thead>
                  <tr>
                    <th className="cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                      Date <SortIcon field="created_at" />
                    </th>
                    <th>Key</th>
                    <th>Summary</th>
                    <th>Category</th>
                    <th>Resident</th>
                    <th className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                      Status <SortIcon field="status" />
                    </th>
                    <th className="cursor-pointer select-none" onClick={() => handleSort('priority')}>
                      Priority <SortIcon field="priority" />
                    </th>
                    <th>Photos</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => {
                    const sm = statusMeta[c.status] || statusMeta.closed;
                    const pm = priorityMeta[c.priority] || priorityMeta.low;
                    return (
                      <tr key={c.id}>
                        <td className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td><span className="issue-key">SMT-{c.id}</span></td>
                        <td className="max-w-[180px]">
                          <button onClick={() => setSelected(c)}
                            className="text-left font-medium text-blue-700 hover:underline text-sm truncate block w-full">
                            {c.title}
                          </button>
                        </td>
                        <td>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded"
                            style={{ background: (c.category_color || '#0052cc') + '18', color: c.category_color || '#0052cc' }}>
                            {c.category_name}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs font-medium text-gray-800">{c.user_name}</div>
                          <div className="text-xs text-gray-400">{c.user_apartment}</div>
                        </td>
                        <td><span className={`badge ${sm.cls}`}>{sm.label}</span></td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className={`priority-dot ${pm.dot}`} />
                            <span className="text-xs">{pm.label}</span>
                          </div>
                        </td>
                        <td>
                          {c.photo_urls?.length > 0
                            ? <PhotoIcon className="h-4 w-4 text-blue-500" title={`${c.photo_urls.length} photo(s)`} />
                            : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <select className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                              value={c.status} onChange={e => updateStatus(c.id, e.target.value)}>
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                            <select className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                              value={c.priority} onChange={e => updatePriority(c.id, e.target.value)}>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                            <button onClick={() => setSelected(c)} className="btn-secondary py-1 px-2 text-xs">
                              <EyeIcon className="h-3 w-3" />
                            </button>
                          </div>
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
                <button onClick={() => setSelected(null)} className="btn-secondary p-1.5 mt-0.5 shrink-0">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`badge ${(statusMeta[selected.status] || statusMeta.closed).cls}`}>
                  {(statusMeta[selected.status] || statusMeta.closed).label}
                </span>
                <span className={`badge ${(priorityMeta[selected.priority] || priorityMeta.low).cls}`}>
                  {(priorityMeta[selected.priority] || priorityMeta.low).label}
                </span>
              </div>
            </div>

            <div className="drawer-body space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label mb-1">Update Status</label>
                  <select className="field-input text-sm" value={selected.status}
                    onChange={e => { updateStatus(selected.id, e.target.value); setSelected(s => ({ ...s, status: e.target.value })); }}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="field-label mb-1">Update Priority</label>
                  <select className="field-input text-sm" value={selected.priority}
                    onChange={e => { updatePriority(selected.id, e.target.value); setSelected(s => ({ ...s, priority: e.target.value })); }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <hr className="divider" />

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div><div className="field-label mb-1">Category</div><div>{selected.category_name}</div></div>
                <div><div className="field-label mb-1">Apartment</div><div>{selected.user_apartment}</div></div>
                <div><div className="field-label mb-1">Reporter</div><div>{selected.user_name}</div></div>
                <div>
                  <div className="field-label mb-1">Reported</div>
                  <div className="text-xs text-gray-600">
                    {new Date(selected.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {selected.location && (
                  <div className="col-span-2"><div className="field-label mb-1">Location</div><div>{selected.location}</div></div>
                )}
              </div>

              <hr className="divider" />

              <div>
                <div className="field-label mb-2">Description</div>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded p-3">
                  {selected.description}
                </p>
              </div>

              {selected.photo_urls?.length > 0 && (
                <div>
                  <div className="field-label mb-2">Attachments</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.photo_urls.map((url, i) => (
                      <img key={i} src={`http://localhost:3000${url}`} alt={`Attachment ${i + 1}`}
                        className="h-20 w-20 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80" />
                    ))}
                  </div>
                </div>
              )}

              <hr className="divider" />

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
                          <p className="text-xs text-gray-600 mt-1 italic border-l-2 border-blue-300 pl-2">{entry.comment}</p>
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
