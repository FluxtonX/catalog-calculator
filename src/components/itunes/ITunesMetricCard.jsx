import React from "react";

const ITunesMetricCard = ({
  icon: Icon,
  label,
  value,
  sub,
  borderColor,
  iconBg,
  iconColor,
  valueColor,
}) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 ${borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
  >
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={`p-2.5 ${iconBg} rounded-xl`}>
        <Icon size={18} className={`sm:w-5 sm:h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-1">
          {label}
        </p>
        <p
          className={`text-base sm:text-xl lg:text-2xl font-black ${valueColor}`}
        >
          {value}
        </p>
        {sub && (
          <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            {sub}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default ITunesMetricCard;
