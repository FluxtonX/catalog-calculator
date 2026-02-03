// src/components/common/SectionHeader.jsx
import React from "react";

/**
 * Reusable section header with icon
 * @param {Object} props
 * @param {React.Component} props.icon - Icon component
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Optional subtitle
 * @param {string} props.iconBg - Icon background gradient
 * @param {string} props.iconColor - Icon color class
 */
const SectionHeader = ({ 
  icon: Icon, 
  title, 
  subtitle,
  iconBg = "from-emerald-500/20 to-blue-500/20",
  iconColor = "text-emerald-600 dark:text-emerald-400"
}) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      {Icon && (
        <div className={`p-3 bg-gradient-to-br ${iconBg} rounded-xl`}>
          <Icon size={24} className={iconColor} />
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;