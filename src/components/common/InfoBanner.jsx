// src/components/common/InfoBanner.jsx
import React from "react";

/**
 * Reusable info/warning/error banner
 * @param {Object} props
 * @param {string} props.type - 'info', 'warning', 'error', 'success'
 * @param {string} props.title - Banner title
 * @param {string} props.message - Banner message
 * @param {React.Component} props.icon - Icon component
 */
const InfoBanner = ({ type = "info", title, message, icon: Icon, children }) => {
  const typeStyles = {
    info: {
      bg: "from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20",
      border: "border-blue-200 dark:border-blue-500/30",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-700 dark:text-blue-400",
      titleColor: "text-blue-800 dark:text-blue-300",
    },
    warning: {
      bg: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
      border: "border-yellow-300 dark:border-yellow-500/50",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      textColor: "text-yellow-700 dark:text-yellow-400",
      titleColor: "text-yellow-800 dark:text-yellow-300",
    },
    error: {
      bg: "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
      border: "border-red-300 dark:border-red-500/50",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-600 dark:text-red-400",
      textColor: "text-red-700 dark:text-red-400",
      titleColor: "text-red-800 dark:text-red-300",
    },
    success: {
      bg: "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
      border: "border-emerald-300 dark:border-emerald-500/50",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      textColor: "text-emerald-700 dark:text-emerald-400",
      titleColor: "text-emerald-800 dark:text-emerald-300",
    },
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div className={`bg-gradient-to-r ${styles.bg} border-2 ${styles.border} rounded-xl shadow-xl`}>
      <div className="flex items-start gap-4 p-5">
        {Icon && (
          <div className={`p-3 ${styles.iconBg} rounded-xl flex-shrink-0`}>
            <Icon size={24} className={styles.iconColor} />
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3 className={`text-lg font-bold ${styles.titleColor} mb-2`}>
              {title}
            </h3>
          )}
          {message && (
            <p className={`text-sm ${styles.textColor}`}>
              {message}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;