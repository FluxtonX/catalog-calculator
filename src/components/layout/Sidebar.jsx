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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 
        bg-white dark:bg-slate-900
        border-r border-gray-200 dark:border-slate-800
        text-gray-900 dark:text-white 
        flex flex-col z-50 shadow-xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Music size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Catalog</h1>
                <h2 className="text-xl font-bold">Calculator</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Professional Valuation Suite</p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={20} />
              <div className="flex-1">
                <p className="font-medium">{item.label}</p>
                <p className={`text-xs opacity-80 ${({ isActive }) => isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.description}
                </p>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <ThemeToggle />
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-slate-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-md">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Muhammad Nasir</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
            </div>
          </div>
          
          <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-300">
            <LogOut size={18} />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;