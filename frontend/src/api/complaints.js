import api from './base';

export const getAllComplaints = async (params = {}) => {
  const response = await api.get('/complaints', { params });
  return response.data;
};

// Alias for getAllComplaints to match import in ComplaintContext
export const getComplaints = async (params = {}) => {
  return getAllComplaints(params);
};

export const getComplaint = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const createComplaint = async (formData) => {
  const response = await api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateComplaint = async (id, updates) => {
  const response = await api.put(`/complaints/${id}`, updates);
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/complaints/${id}`);
  return response.data;
};

export const addComment = async (id, comment) => {
  const response = await api.post(`/complaints/${id}/comments`, { comment });
  return response.data;
};