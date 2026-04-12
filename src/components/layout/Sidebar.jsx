// Update your existing Sidebar.jsx component
// Add this to the navItems array and update the user section

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Music,
  TrendingUp,
  Users,
  LogOut,
  X,
  User,
  ChevronRight,
  FileText,
} from "lucide-react";
import { supabase } from "../../utils/supabase";
import ThemeToggle from "../ui/ThemeToggle";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const navItems = [
    {
      path: "/valuation",
      label: "Artist Catalog Valuation Tool",
      icon: TrendingUp,
      description: "Analyze artist metrics",
    },
    {
      path: "/dashboard",
      label: "My Reports",
      icon: FileText,
      description: "View saved reports",
    },
    {
      path: "/admin",
      label: "Admin Panel",
      icon: Users,
      description: "Manage users",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed left-0 top-0 h-screen w-72 
        bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-900 dark:to-slate-950
        border-r border-gray-200/80 dark:border-slate-800/80
        text-gray-900 dark:text-white 
        flex flex-col z-50 shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-md opacity-50"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Music size={28} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight tracking-tight">
                  Catalog
                </h1>
                <h2 className="text-xl font-bold leading-tight tracking-tight">
                  Calculator
                </h2>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 font-semibold uppercase tracking-widest">
                  Professional Suite
                </p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 hover:rotate-90"
              aria-label="Close sidebar"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5 px-4 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
            Analytics Tools
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80 hover:shadow-md hover:scale-[1.01]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Animated background effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}

                  <div
                    className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-white/20 shadow-lg"
                        : "bg-gray-100 dark:bg-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-slate-700 group-hover:scale-110"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 relative z-10">
                    <p className="font-semibold tracking-tight">{item.label}</p>
                    <p
                      className={`text-xs mt-0.5 font-medium ${
                        isActive
                          ? "text-white/90"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                  {!isActive && (
                    <ChevronRight
                      size={16}
                      className="text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200/50 dark:border-slate-800/50 space-y-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-100/50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Appearance
            </span>
            <ThemeToggle />
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="group relative overflow-hidden flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-11 h-11 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-sm opacity-50"></div>
                    <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <User
                        size={20}
                        className="text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="font-bold truncate text-gray-900 dark:text-white tracking-tight">
                  {user.user_metadata?.full_name ||
                    user.email?.split("@")[0] ||
                    "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">
                  {user.app_metadata?.provider || "User"}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 relative z-10"
              />
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full group relative overflow-hidden flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 hover:from-red-100 hover:to-red-200/50 dark:hover:from-red-900/30 dark:hover:to-red-900/20 transition-all duration-300 text-red-600 dark:text-red-400 font-bold border border-red-200/80 dark:border-red-800/80 hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <LogOut
              size={18}
              strokeWidth={2.5}
              className="group-hover:-translate-x-1 transition-transform duration-300 relative z-10"
            />
            <span className="relative z-10 tracking-tight">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
