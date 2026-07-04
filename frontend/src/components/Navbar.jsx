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
  SparklesIcon,
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
    <nav className="bg-white/95 backdrop-blur-lg shadow-2xl sticky top-0 z-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <BuildingOfficeIcon className="h-9 w-9 text-purple-600 group-hover:text-pink-600 transition-colors duration-300" />
                <SparklesIcon className="h-5 w-5 text-pink-500 absolute -top-2 -right-2 floating-animation" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700">
                  Society-Maintenance-Tracker
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl transition-all duration-200 group"
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">My Complaints</span>
                </Link>
                
                <Link 
                  to="/complaint/new" 
                  className="flex items-center space-x-2 btn-gradient px-5 py-2.5 shadow-xl hover:shadow-2xl"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="font-semibold">New Complaint</span>
                </Link>

                <Link 
                  to="/notices" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl transition-all duration-200 group"
                >
                  <BellIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Notices</span>
                </Link>

                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl transition-all duration-200 group"
                  >
                    <UserIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Admin Panel</span>
                  </Link>
                )}

                <div className="flex items-center space-x-3 border-l-2 border-purple-200 pl-4 ml-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                      <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-1 text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all duration-200 group"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl transition-all duration-200 group"
                >
                  <span className="font-medium">Login</span>
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-gradient px-5 py-2.5 shadow-xl hover:shadow-2xl font-semibold"
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