import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardDocumentListIcon, BellIcon, ShieldCheckIcon, PlusIcon } from '@heroicons/react/24/outline';
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
                    <ClipboardDocumentListIcon className="h-3.5 w-3.5" />
                    My Requests
                </Link>
            </div>

            <div className="mx-2 mb-1 rounded overflow-hidden border border-gray-100">
                <Link to="/notices" className={`sidebar-link mx-0 rounded-none w-full ${isActive('/notices') ? 'active' : ''}`}>
                    <BellIcon className="h-3.5 w-3.5" />
                    Notices
                </Link>
            </div>

            {user?.role === 'admin' && (
                <div className="mx-2 mb-1 rounded overflow-hidden border border-gray-100">
                    <Link to="/admin" className={`sidebar-link mx-0 rounded-none w-full ${isActive('/admin') ? 'active' : ''}`}>
                        <ShieldCheckIcon className="h-3.5 w-3.5" />
                        Admin Panel
                    </Link>
                </div>
            )}

            <div className="sidebar-section mt-4">Actions</div>
            <div className="mx-2 mb-1 rounded overflow-hidden border border-gray-100">
                <Link to="/complaint/new" className={`sidebar-link mx-0 rounded-none w-full ${isActive('/complaint/new') ? 'active' : ''}`}>
                    <PlusIcon className="h-3.5 w-3.5" />
                    Create Request
                </Link>
            </div>
        </aside>
    );
}
