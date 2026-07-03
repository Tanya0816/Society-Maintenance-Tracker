import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, ClipboardDocumentListIcon, PlusIcon, BellIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <HomeIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">SocietyTracker</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2">
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                  <span>My Complaints</span>
                </Link>
                
                <Link to="/complaint/new" className="flex items-center space-x-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg">
                  <PlusIcon className="h-5 w-5" />
                  <span>New Complaint</span>
                </Link>

                <Link to="/notices" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2">
                  <BellIcon className="h-5 w-5" />
                  <span>Notices</span>
                </Link>

                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2">
                    <UserIcon className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 border-l pl-4">
                  <span className="text-gray-600">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;