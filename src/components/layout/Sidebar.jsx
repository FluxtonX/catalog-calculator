import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  LogOut,
  X,
  User,
  ChevronRight,
  FileText,
  History,
  Trash2,
  Database,
  Clock
} from "lucide-react";
import { supabase } from "../../utils/supabase";
import ThemeToggle from "../ui/ThemeToggle";
import { useArtistStore } from "../../store/artistStore";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { platform } = useArtistStore();

  // ── Platform config ────────────────────────────────────────────────────────
  const platformConfig = {
    spotify: {
      logo: "/logo.png",
      logoGlow: "rgba(0,255,136,0.25)",
      navActive: "from-emerald-500 to-teal-600",
      activeShadow: "shadow-emerald-500/20",
      dot: "bg-emerald-500",
      userHoverBorder: "hover:border-emerald-500/30 dark:hover:border-emerald-500/30",
      userAvatar: "from-emerald-500 to-teal-600",
    },
    youtube: {
      logo: "/logoyoutube.png",
      logoGlow: "rgba(255,0,0,0.25)",
      navActive: "from-red-500 to-rose-600",
      activeShadow: "shadow-red-500/20",
      dot: "bg-red-500",
      userHoverBorder: "hover:border-red-500/30 dark:hover:border-red-500/30",
      userAvatar: "from-red-500 to-rose-600",
    },
    itunes: {
      logo: "/logoitune.png",
      logoGlow: "rgba(200,200,200,0.25)",
      navActive: "from-slate-600 to-slate-800",
      activeShadow: "shadow-slate-500/20",
      dot: "bg-slate-400 dark:bg-slate-300",
      userHoverBorder: "hover:border-slate-400/30 dark:hover:border-slate-400/30",
      userAvatar: "from-slate-600 to-slate-800",
    },
  };

  const theme = platformConfig[platform] || platformConfig.spotify;

  const fetchHistory = async (userId) => {
    try {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('extraction_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setHistory(data);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchHistory(currentUser.id);
      else setLoadingHistory(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
         fetchHistory(currentUser.id);
      } else {
         setHistory([]);
         setLoadingHistory(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDeleteHistory = async (id, e) => {
     e.stopPropagation();
     e.preventDefault();
     // Optimistic update
     setHistory(prev => prev.filter(item => item.id !== id));
     try {
        await supabase.from('extraction_history').delete().eq('id', id);
     } catch (err) {
        console.error("Failed to delete:", err);
     }
  };

  const loadHistoryItem = (item) => {
     // Save to localStorage so DataImport picks it up as if the extension just sent it
     window.localStorage.setItem('cc_pending_extraction', JSON.stringify({
         artistName: item.artist_name,
         totalRevenue: item.total_revenue,
         totalStreams: item.total_streams,
         totalTracks: item.total_tracks
     }));
     navigate('/import', { state: { distributor: item.distributor } });
     if (window.innerWidth < 1024) onClose();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const navItems = [
    {
      path: "/valuation",
      label: "Valuation Tool",
      icon: TrendingUp,
      description: "Analyze artist metrics",
    },
    {
      path: "/dashboard",
      label: "My Reports",
      icon: FileText,
      description: "View saved reports",
    },
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen
          bg-white dark:bg-[#0d0f14]
          border-r border-gray-100 dark:border-slate-800/60
          text-gray-900 dark:text-white
          flex flex-col z-50
          transition-transform duration-300 ease-in-out will-change-transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ width: "272px" }}
      >

        {/* ── Logo Section ─────────────────────────────────────────── */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between">

            {/* Logo + Brand */}
            <div className="flex items-center gap-2">

              {/* ✅ Dynamic logo — changes with platform */}
              <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                <img
                  key={platform} // forces re-render on platform change
                  src={theme.logo}
                  alt={`${platform} logo`}
                  className="w-11 h-11 object-contain transition-all duration-300"
                  style={{
                    filter: `drop-shadow(0 0 8px ${theme.logoGlow})`,
                  }}
                />
              </div>

              {/* Brand text */}
              <div>
                <h1 className="text-[15px] font-bold text-gray-900 dark:text-white leading-none tracking-tight">
                  Catalog Calculator
                </h1>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-medium uppercase tracking-widest">
                  Professional Suite
                </p>
              </div>
            </div>

            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
              aria-label="Close sidebar"
            >
              <X size={18} strokeWidth={2} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── Navigation ───────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {/* Section label */}
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3 flex items-center gap-2">
            <span className={`w-1 h-1 rounded-full ${theme.dot}`} />
            Analytics Tools
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${theme.navActive} text-white shadow-md ${theme.activeShadow}`
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/70 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? "bg-white/20"
                        : "bg-gray-100 dark:bg-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-slate-700"
                    }`}
                  >
                    <item.icon size={17} strokeWidth={2.2} />
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-none truncate">
                      {item.label}
                    </p>
                    <p
                      className={`text-xs mt-1 truncate ${
                        isActive
                          ? "text-white/75"
                          : "text-gray-400 dark:text-slate-500"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  {!isActive && (
                    <ChevronRight
                      size={14}
                      className="text-gray-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 flex-shrink-0"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* ── Distributor History Section ──────────────────────────── */}
          <div className="mt-8 mb-2">
             <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3 flex items-center gap-2">
               <Database size={12} />
               Distributor History
             </p>
             
             {!user ? (
                <div className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/30 rounded-lg mx-2 border border-gray-100 dark:border-slate-800">
                   Log in to view and save your extracted dashboards.
                </div>
             ) : loadingHistory ? (
                <div className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 animate-pulse flex items-center gap-2">
                   Loading history...
                </div>
             ) : history.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/30 rounded-lg mx-2 border border-gray-100 dark:border-slate-800">
                   No dashboards saved yet.
                </div>
             ) : (
                <div className="space-y-1">
                   {history.map((item) => {
                      const isUnknownDistributor = !item.distributor || item.distributor === 'Your Distributor';
                      const formattedDate = item.created_at 
                        ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : null;
                      
                      return (
                         <div 
                            key={item.id}
                            onClick={() => loadHistoryItem(item)}
                            className="group flex items-start justify-between px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
                         >
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                               <History size={14} className="flex-shrink-0 opacity-40 mt-1" />
                               <div className="min-w-0">
                                  <p className="text-sm font-semibold truncate leading-tight text-gray-800 dark:text-slate-200">{item.artist_name}</p>
                                  {isUnknownDistributor ? (
                                     <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                        Unknown Company
                                     </span>
                                  ) : (
                                     <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                        {item.distributor}
                                     </span>
                                  )}
                                  {formattedDate && (
                                     <div className="flex items-center gap-1 mt-1.5">
                                        <Clock size={9} className="text-gray-400 dark:text-slate-500" />
                                        <span className="text-[10px] text-gray-400 dark:text-slate-500">{formattedDate}</span>
                                     </div>
                                  )}
                               </div>
                            </div>
                            <button 
                               onClick={(e) => handleDeleteHistory(item.id, e)}
                               className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100 flex-shrink-0 mt-0.5"
                               title="Delete from history"
                            >
                               <Trash2 size={14} />
                            </button>
                         </div>
                      );
                   })}
                </div>
             )}
          </div>
        </nav>

        {/* ── Bottom Section ────────────────────────────────────────── */}
        <div className="px-3 pb-4 pt-3 border-t border-gray-100 dark:border-slate-800/60 space-y-2">

          {/* Theme Toggle row */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200">
            <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
              Appearance
            </span>
            <ThemeToggle />
          </div>

          {/* User Profile Card */}
          {user && (
            <div
              className={`
                group relative flex items-center gap-3 p-3 rounded-xl
                bg-gray-50 dark:bg-slate-800/50
                border border-gray-100 dark:border-slate-700/60
                ${theme.userHoverBorder}
                hover:shadow-md transition-all duration-200 cursor-pointer
              `}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${theme.userAvatar} flex items-center justify-center`}
                  >
                    <User size={17} className="text-white" strokeWidth={2.2} />
                  </div>
                )}
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-none">
                  {user.user_metadata?.full_name ||
                    user.email?.split("@")[0] ||
                    "User"}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 capitalize truncate">
                  {user.app_metadata?.provider || "Email"}
                </p>
              </div>

              <ChevronRight
                size={14}
                className="text-gray-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 flex-shrink-0"
              />
            </div>
          )}

          {/* Auth Button */}
          {user ? (
            <button
              onClick={handleLogout}
              className="
                w-full group flex items-center justify-center gap-2 px-4 py-2.5
                rounded-xl text-sm font-semibold
                text-red-500 dark:text-red-400
                bg-red-50 dark:bg-red-900/10
                border border-red-100 dark:border-red-900/30
                hover:bg-red-100 dark:hover:bg-red-900/20
                hover:border-red-200 dark:hover:border-red-800/50
                hover:shadow-md hover:shadow-red-500/10
                active:scale-[0.98] transition-all duration-200
              "
            >
              <LogOut
                size={16}
                strokeWidth={2.2}
                className="group-hover:-translate-x-0.5 transition-transform duration-200"
              />
              Log out
            </button>
          ) : (
            <button
              onClick={() => {
                navigate("/auth");
                onClose();
              }}
              className="
                w-full group flex items-center justify-center gap-2 px-4 py-2.5
                rounded-xl text-sm font-semibold
                text-white
                bg-emerald-500 hover:bg-emerald-600
                border border-emerald-600
                hover:shadow-md hover:shadow-emerald-500/20
                active:scale-[0.98] transition-all duration-200
              "
            >
              <User
                size={16}
                strokeWidth={2.2}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
              Log in
            </button>
          )}

        </div>
      </aside>
    </>
  );
};

export default Sidebar;