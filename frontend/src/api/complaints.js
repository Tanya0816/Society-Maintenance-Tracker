import api from './base';

export const getAllComplaints = async (params = {}) => {
  const response = await api.get('/complaints', { params });
  return response.data;
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

export const addComment = async (id, comment) => {
  const response = await api.post(`/complaints/${id}/comments`, { comment });
  return response.data;
};