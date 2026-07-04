import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BuildingOfficeIcon,
  PlusIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
  HomeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const isNoticesPage = location.pathname === '/notices';

  return (
    <>
      {/* ── Row 1: Brand bar ── */}
      <nav className="topnav">
        <div className="topnav-inner">
          <Link to="/" className="topnav-brand">
            <BuildingOfficeIcon className="h-4 w-4" />
            <span>SocietyTrack</span>
          </Link>

          <div className="flex-1" />

          {isAuthenticated && !isNoticesPage ? (
            <div className="flex items-center gap-3">
              <Link to="/complaint/new" className="topnav-btn-primary">
                <PlusIcon className="h-3.5 w-3.5" />
                New Request
              </Link>

              <div className="flex items-center gap-2 pl-3 border-l border-white/20">
                <div className="w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold select-none">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white leading-tight">{user?.name}</span>
                  <span className="text-xs text-white/60 capitalize leading-tight">{user?.role}</span>
                </div>
              </div>

              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="topnav-link flex items-center gap-1.5"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="text-xs">Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-auto">
              <Link to="/login" className="topnav-link text-sm font-medium">Log in</Link>
              <Link to="/signup" className="topnav-btn-primary text-sm">Sign up</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Row 2: Sub-nav with page links ── */}
      {isAuthenticated && (
        <div className="subnav">
          <div className="subnav-inner">
            <Link
              to="/dashboard"
              className={`subnav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <HomeIcon className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              to="/complaint/new"
              className={`subnav-link ${isActive('/complaint/new') ? 'active' : ''}`}
            >
              <PlusIcon className="h-4 w-4" />
              New Request
            </Link>

            <Link
              to="/notices"
              className={`subnav-link ${isActive('/notices') ? 'active' : ''}`}
            >
              <BellIcon className="h-4 w-4" />
              Notices
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`subnav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                <ShieldCheckIcon className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
