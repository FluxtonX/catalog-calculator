// src/components/artist/TabNavigation.jsx
import React from "react";
import { Music, Users, Album, MapPin } from "lucide-react";

const TabNavigation = ({ activeTab, onTabChange, platform, hasRelated, hasCities }) => {
  const tabs = [
    { id: "tracks", label: "Top Tracks", icon: Music, shortLabel: "Tracks" },
    ...(platform !== "apify" ? [{ id: "related", label: "Related Artists", icon: Users, shortLabel: "Related" }] : []),
    { id: "albums", label: "Albums", icon: Album },
    ...(platform === "apify" && hasCities ? [{ id: "cities", label: "Top Cities", icon: MapPin, shortLabel: "Cities" }] : []),
  ];

  return (
    <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 border-b-2 border-slate-200 dark:border-slate-700 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-bold transition-all duration-300 border-b-2 whitespace-nowrap rounded-t-lg text-xs sm:text-base ${
              isActive
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 -mb-2"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Icon size={16} className="sm:w-5 sm:h-5" />
              {/* Always show label - use shortLabel on small screens, full label on larger screens */}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel || tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;