import React, { useEffect, useState } from "react";
import {
  Menu,
  LayoutDashboard,
  TrendingUp,
  Settings,
  Target,
  Sparkles,
  Music,
  Youtube,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useArtistStore } from "../../store/artistStore";

const SpotifyIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const PLATFORM_META = {
  spotify: {
    title: "Spotify Artist Catalog Valuation Tool",
    subtitle: "Real-time stream analytics & listener insights",
    icon: SpotifyIcon,
    gradient: "from-emerald-500 to-teal-500",
  },
  youtube: {
    title: "YouTube Artist Catalog Valuation Tool",
    subtitle: "Subscriber analytics & channel performance",
    icon: Youtube,
    gradient: "from-red-500 to-rose-500",
  },
  itunes: {
    title: "Apple Music Artist Catalog Valuation Tool",
    subtitle: "Track catalog, popularity scores & royalty insights",
    icon: Music,
    gradient: "from-slate-700 to-slate-900",
  },
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const { platform } = useArtistStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getPageInfo = () => {
    // On valuation page — use platform-aware info
    if (location.pathname === "/valuation") {
      return PLATFORM_META[platform] ?? PLATFORM_META.spotify;
    }

    switch (location.pathname) {
      case "/dashboard":
        return {
          title: "Dashboard",
          subtitle: "Your business analytics overview",
          icon: LayoutDashboard,
          gradient: "from-blue-500 to-cyan-500",
        };
      case "/valuation/detail":
        return {
          title: "Artist Valuation",
          subtitle: "Professional financial analysis & projections",
          icon: Sparkles,
          gradient: "from-purple-500 to-pink-500",
        };
      case "/admin":
        return {
          title: "Admin Panel",
          subtitle: "Manage users and permissions",
          icon: Settings,
          gradient: "from-orange-500 to-red-500",
        };
      default:
        return {
          title: "Catalog Calculator",
          subtitle: "Professional Valuation Suite",
          icon: Target,
          gradient: "from-indigo-500 to-purple-500",
        };
    }
  };

  const pageInfo = getPageInfo();
  const IconComponent = pageInfo.icon;

  const formatTime = () =>
    currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDate = () =>
    currentTime.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
              aria-label="Toggle menu"
              title="Toggle sidebar"
            >
              <Menu size={22} className="text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`relative p-2.5 rounded-xl bg-gradient-to-br ${pageInfo.gradient} shadow-lg transition-all duration-300`}
              >
                <IconComponent size={24} className="text-white relative z-10" />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${pageInfo.gradient} rounded-xl blur-md opacity-50`}
                />
              </div>

              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-all duration-300">
                  {pageInfo.title}
                  {(location.pathname === "/valuation" ||
                    location.pathname === "/dashboard") && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-all duration-300">
                  {pageInfo.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex flex-col items-end bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatTime()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {formatDate()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
