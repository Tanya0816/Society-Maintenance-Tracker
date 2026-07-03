import api from './base';

export const getAdminComplaints = async (params = {}) => {
  const response = await api.get('/admin/complaints', { params });
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const updateComplaintStatus = async (id, status, comment = '') => {
  const response = await api.patch(`/admin/complaints/${id}/status`, { status, comment });
  return response.data;
};

export const updateComplaintPriority = async (id, priority, comment = '') => {
  const response = await api.patch(`/admin/complaints/${id}/priority`, { priority, comment });
  return response.data;
};

export const addAdminNote = async (id, note) => {
  const response = await api.post(`/admin/complaints/${id}/notes`, { note });
  return response.data;
};

export const createNotice = async (noticeData) => {
  const response = await api.post('/admin/notices', noticeData);
  return response.data;
};