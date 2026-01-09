import React from 'react';
import { NavLink } from 'react-router-dom';
import { Music, TrendingUp, Users, LogOut, X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { path: '/valuation', label: 'Valuation Tool', icon: TrendingUp, description: 'Analyze artist metrics' },
    { path: '/admin', label: 'Admin Panel', icon: Users, description: 'Manage users' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 
        bg-white dark:bg-slate-900
        border-r border-gray-200 dark:border-slate-800
        text-gray-900 dark:text-white 
        flex flex-col z-50 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Music size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">Catalog</h1>
                <h2 className="text-xl font-bold leading-tight">Calculator</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Professional Suite</p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-4">
            Analytics Tools
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:shadow-md'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 dark:bg-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-slate-700'
                  }`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className={`text-xs mt-0.5 ${
                      isActive 
                        ? 'text-white/80' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-4">
          {/* Theme Toggle - Standalone with label */}
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Theme
            </span>
            <ThemeToggle />
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800/50 border border-gray-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-lg">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-gray-900 dark:text-white">Muhammad Nasir</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Account</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 text-red-600 dark:text-red-400 font-medium border border-red-200 dark:border-red-800 hover:shadow-md">
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar