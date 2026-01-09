import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const location = useLocation();

  // Define page info based on route
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Your business analytics overview',
          icon: '📊'
        };
      case '/valuation':
        return {
          title: 'Valuation Tool',
          subtitle: 'Analyze artist metrics with real-time Spotify data',
          icon: '🎵'
        };
      case '/admin':
        return {
          title: 'Admin Panel',
          subtitle: 'Manage users and permissions',
          icon: '⚙️'
        };
      default:
        return {
          title: 'Catalog Calculator',
          subtitle: 'Professional Valuation Suite',
          icon: '🎯'
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            {/* Page Title with Icon */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{pageInfo.icon}</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {pageInfo.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {pageInfo.subtitle}
                </p>
              </div>
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button 
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;