// src/components/common/StatCard.jsx
import React from "react";

/**
 * Reusable stat display card
 * @param {Object} props
 * @param {React.Component} props.icon - Icon component
 * @param {string} props.label - Stat label
 * @param {string} props.value - Main value to display
 * @param {string} props.subtitle - Optional subtitle
 * @param {string} props.iconBg - Icon background color class
 * @param {string} props.iconColor - Icon color class
 */
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subtitle, 
  iconBg = "bg-emerald-500/20",
  iconColor = "text-emerald-400"
}) => {

  return (
    <div className="bg-white/8 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
      <div className="flex flex-col items-center gap-2">
        {Icon && (
          <div className={`p-2 ${iconBg} rounded-xl`}>
            <Icon size={20} className={iconColor} />
          </div>
        )}
        <div className="text-center w-full">
          <p className="text-gray-700 dark:text-white/60 text-[10px] sm:text-xs font-semibold mb-1 sm:mb-2 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-600 dark:text-white/50 font-mono mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;