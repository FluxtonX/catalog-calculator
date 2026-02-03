// src/components/common/EmptyState.jsx
import React from "react";

/**
 * Reusable empty state component
 * @param {Object} props
 * @param {React.Component} props.icon - Icon component
 * @param {string} props.message - Empty state message
 * @param {string} props.iconColor - Icon color class
 */
const EmptyState = ({ icon: Icon, message, iconColor = "text-slate-400" }) => {
  return (
    <div className="text-center py-12 sm:py-16">
      <div className="inline-flex p-4 sm:p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 sm:mb-4">
        <Icon size={40} className={`${iconColor} sm:w-14 sm:h-14`} />
      </div>
      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;