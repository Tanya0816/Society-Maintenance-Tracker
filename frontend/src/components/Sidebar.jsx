import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const location = useLocation();
    const { user } = useAuth();
    const isActive = (p) => location.pathname === p;

    return (
        <aside className="sidebar hidden md:flex flex-col">
            <div className="sidebar-section">Navigation</div>

            <div className="mx-2 mb-1 rounded overflow-hidden border border-gray-100">
                <Link to="/dashboard" className={`sidebar-link mx-0 rounded-none w-full ${isActive('/dashboard') ? 'active' : ''}`}>
                    My Requests
                </Link>
            </div>

            <div className="mx-2 mb-1 rounded overflow-hidden border border-gray-100">
                <Link to="/notices" className={`sidebar-link mx-0 rounded-none w-full ${isActive('/notices') ? 'active' : ''}`}>
                    Notices
                </Link>
            </div>

            {user?.role === 'admin' && (
                <div className="mx-2 mb-1 rounded overflow-hidden border border-gray-100">
                    <Link to="/admin" className={`sidebar-link mx-0 rounded-none w-full ${isActive('/admin') ? 'active' : ''}`}>
                        Admin Panel
                    </Link>
                </div>
            )}

            <div className="sidebar-section mt-4">Actions</div>
            <div className="mx-2 mb-1 rounded overflow-hidden border border-gray-100">
                <Link to="/complaint/new" className={`sidebar-link mx-0 rounded-none w-full ${isActive('/complaint/new') ? 'active' : ''}`}>
                    Create Request
                </Link>
            </div>
        </aside>
    );
}
