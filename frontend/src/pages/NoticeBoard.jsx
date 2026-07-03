import React, { useEffect, useState } from 'react';
import { BellIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as adminApi from '../api/admin';
import * as noticesApi from '../api/notices';
import { useAuth } from '../context/AuthContext';

const NoticeBoard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    priority: 'normal',
    expires_at: ''
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await noticesApi.getAllNotices();
      setNotices(response.data || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createNotice(newNotice);
      setNewNotice({ title: '', content: '', priority: 'normal', expires_at: '' });
      setShowCreateForm(false);
      fetchNotices();
    } catch (error) {
      console.error('Error creating notice:', error);
      alert('Failed to create notice');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-500';
      case 'high': return 'bg-orange-100 border-orange-500';
      case 'normal': return 'bg-blue-100 border-blue-500';
      case 'low': return 'bg-gray-100 border-gray-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notice Board</h1>
            <p className="mt-2 text-gray-600">Stay updated with society announcements and important information</p>
          </div>
          {user.role === 'admin' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Notice
            </button>
          )}
        </div>

        {/* Create Notice Form (Admin Only) */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Notice</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="Enter notice title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  required
                  rows="4"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  placeholder="Enter notice content"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={newNotice.expires_at}
                    onChange={(e) => setNewNotice({ ...newNotice, expires_at: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Notice
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notices List */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <BellIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No notices available</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {notices
              .filter(notice => notice.is_active && !isExpired(notice.expires_at))
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((notice) => (
                <div key={notice.id} className={`rounded-lg border-l-4 p-6 ${getPriorityColor(notice.priority)} ${isExpired(notice.expires_at) ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <BellIcon className={`w-6 h-6 ${notice.priority === 'urgent' ? 'text-red-600' : notice.priority === 'high' ? 'text-orange-600' : 'text-blue-600'}`} />
                        <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notice.priority === 'urgent' ? 'bg-red-200 text-red-800' :
                          notice.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                          notice.priority === 'normal' ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {notice.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{notice.content}</p>
                      <div className="mt-4 text-sm text-gray-500">
                        Posted by {notice.author_name} • {new Date(notice.created_at).toLocaleDateString()}
                        {notice.expires_at && (
                          <span> • Expires: {new Date(notice.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;