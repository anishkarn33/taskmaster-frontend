import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  ListBulletIcon,       // For Tasks
  Squares2X2Icon,       // For Board (Kanban)
  ChartBarIcon,         // For Analytics
  XMarkIcon,
  ArrowRightOnRectangleIcon, // For Logout
  BellIcon,             // For Notifications
  UserIcon              // For User profile
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext'; // Update path as needed

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth(); // Get user and logout from context

  // ================= NAVIGATION ITEMS =================
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: ListBulletIcon,
      current: location.pathname === '/tasks'
    },
    {
      name: 'Board',
      href: '/board',
      icon: Squares2X2Icon,
      current: location.pathname === '/board',
      badge: 'NEW'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      current: location.pathname === '/analytics'
    }
  ];

  // ================= USER HELPER FUNCTIONS =================
  const getUserInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false); // Close sidebar on mobile after logout
  };

  return (
    <>
      {/* ================= MOBILE SIDEBAR ================= */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent 
            navigation={navigation} 
            user={user} 
            getUserInitials={getUserInitials}
            handleLogout={handleLogout}
          />
        </div>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <SidebarContent 
            navigation={navigation} 
            user={user} 
            getUserInitials={getUserInitials}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </>
  );
};

// ================= SIDEBAR CONTENT COMPONENT =================
const SidebarContent = ({ navigation, user, getUserInitials, handleLogout }) => {
  return (
    <div className="flex flex-col h-full">
      {/* ================= LOGO SECTION ================= */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
          <Squares2X2Icon className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">TaskMaster</span>
      </div>

      {/* ================= NAVIGATION SECTION ================= */}
      <nav className="flex-1 px-4 py-6">
        <ul role="list" className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${
                    item.current ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-blue-600'
                  }`} />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ================= BOTTOM SECTION (User + Logout) ================= */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* ================= NOTIFICATIONS ================= */}
        <div className="flex justify-center">
          <button className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 bg-red-400 rounded-full ring-1 ring-white dark:ring-gray-800"></span>
          </button>
        </div>

        {/* ================= USER PROFILE SECTION ================= */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.full_name || user?.username || 'User'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || 'user@example.com'}
            </div>
          </div>
        </div>

        {/* ================= LOGOUT BUTTON ================= */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;