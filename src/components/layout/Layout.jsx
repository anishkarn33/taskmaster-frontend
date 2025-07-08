import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
// ================= REMOVED: Navbar import =================
// import Navbar from './Navbar';  // ← Remove this line
import Sidebar from './Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* ================= REMOVED: Top navbar ================= */}
        {/* <Navbar setSidebarOpen={setSidebarOpen} /> */}
        
        {/* ================= NEW: Mobile menu button (only for mobile) ================= */}
        <div className="lg:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">TaskMaster</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>
        
        {/* ================= UPDATED: Page content with better spacing ================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;