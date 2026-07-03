import api from './base';

export const getAllNotices = async (params = {}) => {
  const response = await api.get('/notices', { params });
  return response.data;
};

export const getNotice = async (id) => {
  const response = await api.get(`/notices/${id}`);
  return response.data;
};