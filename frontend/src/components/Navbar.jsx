import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  PlusIcon, 
  BellIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2 group">
              <BuildingOfficeIcon className="h-5 w-5 text-purple-600 group-hover:text-pink-600 transition-colors duration-300" />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold text-gray-700">
                  Society-Maintenance-Tracker
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-2 py-1.5 rounded-lg transition-all duration-200 group text-sm"
                >
                  <ClipboardDocumentListIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden md:inline font-medium">My Complaints</span>
                </Link>
                
                <Link 
                  to="/complaint/new" 
                  className="flex items-center space-x-1 btn-gradient px-3 py-1.5 shadow-md hover:shadow-lg text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="hidden md:inline font-semibold">New Complaint</span>
                </Link>

                <Link 
                  to="/notices" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-2 py-1.5 rounded-lg transition-all duration-200 group text-sm"
                >
                  <BellIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden md:inline font-medium">Notices</span>
                </Link>

                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-2 py-1.5 rounded-lg transition-all duration-200 group text-sm"
                  >
                    <UserIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden md:inline font-medium">Admin</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 border-l border-purple-200 pl-2 ml-1">
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:flex flex-col">
                      <span className="text-xs font-semibold text-gray-800">{user?.name}</span>
                      <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-1 text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-all duration-200 group"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-1">
                <Link 
                  to="/login" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all duration-200 group text-sm"
                >
                  <span className="font-medium">Login</span>
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-gradient px-3 py-1.5 shadow-md hover:shadow-lg font-semibold text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;