import api from './base';

export const login = async (email, password, role) => {
  const response = await api.post('/auth/login', { email, password, role });
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};