// src/components/artist/TopCitiesList.jsx
import React from "react";
import { MapPin, Users } from "lucide-react";
import Badge from "../common/Badge";

const TopCitiesList = ({ cities }) => {
  if (!cities || cities.length === 0) return null;

  return (
    <div className="space-y-2 sm:space-y-3">
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
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold flex-shrink-0 ml-2" size="sm">
            <Users size={12} className="mr-0.5 sm:mr-1 sm:w-[14px] sm:h-[14px]" />
            <span className="hidden xs:inline">{city.numberOfListeners.toLocaleString()}</span>
            <span className="xs:hidden">{(city.numberOfListeners / 1000).toFixed(0)}k</span>
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default TopCitiesList;