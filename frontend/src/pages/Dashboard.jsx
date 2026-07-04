import React, { useEffect, useState } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import * as complaintsApi from '../api/complaints';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter] = useState({ status: '', search: '' });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintsApi.getAllComplaints(filter);
      setComplaints(response.data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'in_progress': return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />;
      case 'resolved': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'closed': return <XCircleIcon className="w-5 h-5 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress': 
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved': 
        return 'bg-green-100 text-green-800 border-green-300';
      case 'closed': 
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStats = () => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      inProgress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      urgent: complaints.filter(c => c.priority === 'urgent').length,
    };
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter.status && c.status !== filter.status) return false;
    if (filter.search && !c.title.toLowerCase().includes(filter.search.toLowerCase()) && 
        !c.description.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const stats = getStats();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 slide-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <SparklesIcon className="h-8 w-8 text-purple-600" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Society Complaint Tracker
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Monitor and manage all maintenance requests across your community
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: ChartBarIcon, color: 'from-purple-600 to-pink-600', bgColor: 'bg-purple-50' },
            { label: 'Pending', value: stats.pending, icon: ClockIcon, color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-50' },
            { label: 'In Progress', value: stats.inProgress, icon: ExclamationTriangleIcon, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircleIcon, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50' },
            { label: 'Urgent', value: stats.urgent, icon: SparklesIcon, color: 'from-red-500 to-pink-500', bgColor: 'bg-red-50' },
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.bgColor} glass-card p-6 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card p-6 mb-6 slide-in">
          <div className="flex items-center space-x-2 mb-4">
            <FunnelIcon className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filter Complaints</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Search by title or description..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
            <div>
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="pending">⏳ Pending</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="resolved">✅ Resolved</option>
                <option value="closed">🔒 Closed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchComplaints}
                className="w-full btn-gradient-blue py-3 flex items-center justify-center space-x-2"
              >
                <ArrowPathIcon className="h-5 w-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="glass-card overflow-hidden slide-in">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center">
              <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No complaints found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters or create a new complaint</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Apartment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComplaints.map((complaint, idx) => (
                    <tr 
                      key={complaint.id} 
                      className={`hover:bg-purple-50 transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-purple-600">#{complaint.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {complaint.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          {complaint.category_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        🏠 {complaint.user_apartment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(complaint.status)}
                          <span className={`status-badge border ${getStatusBadge(complaint.status)}`}>
                            {complaint.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-badge border ${getPriorityBadge(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(complaint.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedComplaint(complaint)}
                          className="btn-gradient px-4 py-2 text-sm flex items-center space-x-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 fade-in">
          <div className="relative top-20 mx-auto p-5 border-0 w-11/12 md:w-3/4 lg:w-1/2 glass-card shadow-2xl rounded-3xl slide-in">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="h-8 w-8 text-purple-600" />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Complaint #{selectedComplaint.id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition-colors duration-200"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Title & Description */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-xl text-gray-900 mb-3">{selectedComplaint.title}</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedComplaint.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</div>
                    <div className="text-lg font-semibold text-gray-800">{selectedComplaint.category_name}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Apartment</div>
                    <div className="text-lg font-semibold text-gray-800">🏠 {selectedComplaint.user_apartment}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</div>
                    <div className={`status-badge border ${getStatusBadge(selectedComplaint.status)}`}>
                      {selectedComplaint.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Priority</div>
                    <div className={`status-badge border ${getPriorityBadge(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority.toUpperCase()}
                    </div>
                  </div>
                  {selectedComplaint.location && (
                    <div className="col-span-2 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</div>
                      <div className="text-lg font-semibold text-gray-800">📍 {selectedComplaint.location}</div>
                    </div>
                  )}
                </div>

                {/* Photos */}
                {selectedComplaint.photo_urls && selectedComplaint.photo_urls.length > 0 && (
                  <div>
                    <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                      <SparklesIcon className="h-5 w-5 text-purple-600" />
                      <span>Photos</span>
                    </h5>
                    <div className="flex space-x-4">
                      {selectedComplaint.photo_urls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={`http://localhost:3000${url}`} 
                            alt="Complaint photo" 
                            className="h-24 w-24 object-cover rounded-xl border-2 border-purple-200 group-hover:border-purple-400 transition-colors duration-200 cursor-pointer shadow-md hover:shadow-xl"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200 flex items-center justify-center">
                            <EyeIcon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* History Section */}
                <div>
                  <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-purple-600" />
                    <span>Complaint History</span>
                  </h5>
                  {selectedComplaint.history && selectedComplaint.history.length > 0 ? (
                    <div className="space-y-4">
                      {selectedComplaint.history.map((entry, idx) => (
                        <div key={entry.id} className="relative pl-8 py-3">
                          {/* Timeline line */}
                          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 to-pink-600"></div>
                          
                          {/* Timeline dot */}
                          <div className="absolute left-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">{idx + 1}</span>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 ml-2">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {entry.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(entry.created_at).toLocaleString()} by {entry.user_name} ({entry.user_role})
                              </span>
                            </div>
                            {(entry.old_value || entry.new_value) && (
                              <div className="text-sm text-gray-700 bg-white p-3 rounded-lg">
                                {entry.old_value && <span className="text-red-600 font-medium">From: {entry.old_value}</span>}
                                {entry.old_value && entry.new_value && <span className="mx-2">→</span>}
                                {entry.new_value && <span className="text-green-600 font-medium">To: {entry.new_value}</span>}
                              </div>
                            )}
                            {entry.comment && (
                              <p className="text-sm text-gray-800 mt-2 italic border-l-4 border-purple-400 pl-3">
                                "{entry.comment}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 font-medium">No history available yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;