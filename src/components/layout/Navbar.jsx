import React from 'react';
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        {/* Right side - User info and logout */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Welcome back, {user?.full_name || user?.username}!
          </span>
          <button
            onClick={logout}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;