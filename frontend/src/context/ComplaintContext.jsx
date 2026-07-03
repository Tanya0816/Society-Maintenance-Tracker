import React, { createContext, useContext, useState } from 'react';
import * as api from '../api/complaints';

const ComplaintContext = createContext(null);

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getComplaints();
      setComplaints(response.data);
    } catch (err) {
      setError('Failed to fetch complaints');
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const createComplaint = async (complaintData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.createComplaint(complaintData);
      setComplaints([...complaints, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create complaint';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateComplaint = async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.updateComplaint(id, updates);
      setComplaints(complaints.map(c => c.id === id ? response.data : c));
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update complaint';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteComplaint = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteComplaint(id);
      setComplaints(complaints.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete complaint';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    complaints,
    loading,
    error,
    fetchComplaints,
    createComplaint,
    updateComplaint,
    deleteComplaint,
  };

  return <ComplaintContext.Provider value={value}>{children}</ComplaintContext.Provider>;
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};