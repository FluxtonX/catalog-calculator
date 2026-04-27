// src/components/artist/TopCitiesList.jsx
import React from "react";
import { MapPin, Users, Info } from "lucide-react";
import Badge from "../common/Badge";

const TopCitiesList = ({ cities }) => {
  if (!cities || cities.length === 0) return null;

  return (
    <div className="space-y-2 sm:space-y-3">

      {/* Header with explanation */}
      <div className="flex items-center gap-2 mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl">
        <Info size={14} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Numbers show <strong>monthly listeners per city</strong> — unique Spotify users who streamed this artist at least once in the last 28 days.
        </p>
      </div>

      {cities.map((city, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg group"
        >
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <span className="text-lg sm:text-2xl font-bold text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors w-6 sm:w-10 text-center flex-shrink-0">
              {idx + 1}
            </span>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
              <MapPin size={20} className="text-blue-600 dark:text-blue-400 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {city.city}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium truncate">
                {city.country}
              </p>
            </div>
          </div>

          {/* Badge with hover tooltip */}
          <div className="relative group/badge flex-shrink-0 ml-2">
            <Badge
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold cursor-default"
              size="sm"
            >
              <Users size={12} className="mr-0.5 sm:mr-1 sm:w-[14px] sm:h-[14px]" />
              <span className="hidden xs:inline">{city.numberOfListeners.toLocaleString()}</span>
              <span className="xs:hidden">{(city.numberOfListeners / 1000).toFixed(0)}k</span>
            </Badge>

            {/* Hover tooltip */}
            <div className="absolute z-50 bottom-full mb-2 right-0 w-56 p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl
              opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200 pointer-events-none">
              <p className="font-bold mb-1 text-slate-900 dark:text-white flex items-center gap-1">
                <Users size={11} className="text-blue-500" />
                Monthly Listeners
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-800 dark:text-slate-200">{city.numberOfListeners.toLocaleString()}</strong> unique Spotify users in <strong className="text-slate-800 dark:text-slate-200">{city.city}</strong> streamed this artist in the last 28 days.
              </p>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default TopCitiesList;