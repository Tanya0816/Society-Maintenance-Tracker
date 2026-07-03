import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComplaintForm from './pages/ComplaintForm';
import AdminDashboard from './pages/AdminDashboard';
import NoticeBoard from './pages/NoticeBoard';

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/complaint/new" element={user ? <ComplaintForm /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/notices" element={<NoticeBoard />} />
        </Routes>
      </main>
    </div>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <App />
      </ComplaintProvider>
    </AuthProvider>
  );
}

export default AppWrapper;