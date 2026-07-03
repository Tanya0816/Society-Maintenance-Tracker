import React, { useEffect, useState } from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, EyeIcon } from '@heroicons/react/24/outline';
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter.status && c.status !== filter.status) return false;
    if (filter.search && !c.title.toLowerCase().includes(filter.search.toLowerCase()) && 
        !c.description.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Society Complaint Tracker</h1>
          <p className="mt-2 text-gray-600">View and track all maintenance complaints across the society</p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Description/Title</label>
              <input
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Search..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchComplaints}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No complaints found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apartment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{complaint.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.category_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.user_apartment}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(complaint.status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{complaint.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedComplaint(complaint)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View History
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Complaint #{selectedComplaint.id}</h3>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedComplaint.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedComplaint.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span> {selectedComplaint.category_name}
                  </div>
                  <div>
                    <span className="font-medium">Apartment:</span> {selectedComplaint.user_apartment}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {selectedComplaint.status}
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span> {selectedComplaint.priority}
                  </div>
                  {selectedComplaint.location && (
                    <div className="col-span-2">
                      <span className="font-medium">Location:</span> {selectedComplaint.location}
                    </div>
                  )}
                </div>

                {selectedComplaint.photo_urls && selectedComplaint.photo_urls.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Photos</h5>
                    <div className="flex space-x-2">
                      {selectedComplaint.photo_urls.map((url, idx) => (
                        <img key={idx} src={`http://localhost:3000${url}`} alt="Complaint photo" className="h-20 w-20 object-cover rounded" />
                      ))}
                    </div>
                  </div>
                )}

                {/* History Section */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Complaint History</h5>
                  {selectedComplaint.history && selectedComplaint.history.length > 0 ? (
                    <div className="space-y-3">
                      {selectedComplaint.history.map((entry) => (
                        <div key={entry.id} className="border-l-2 border-indigo-500 pl-4 py-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm text-indigo-700">
                              {entry.action_type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.created_at).toLocaleString()} by {entry.user_name} ({entry.user_role})
                            </span>
                          </div>
                          {(entry.old_value || entry.new_value) && (
                            <div className="text-sm text-gray-600 mt-1">
                              {entry.old_value && <span>From: {entry.old_value}</span>}
                              {entry.old_value && entry.new_value && <span> → </span>}
                              {entry.new_value && <span>To: {entry.new_value}</span>}
                            </div>
                          )}
                          {entry.comment && (
                            <p className="text-sm text-gray-800 mt-1 italic">"{entry.comment}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No history available.</p>
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