import React from "react";
import { formatCurrency } from "../../core/calculations";

const ITunesScenarioCard = ({
  label,
  multiple,
  value,
  color,
  gradient,
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  isHighlighted,
}) => (
  <div
    className={`relative rounded-2xl p-4 sm:p-6 border-2 text-center transition-all duration-300 ${
      isHighlighted
        ? `${gradient} border-transparent shadow-2xl scale-105`
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-1"
    }`}
  >
    {isHighlighted && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[10px] font-black text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-700 shadow-md">
        MARKET RATE
      </div>
    )}
    <div
      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${
        isHighlighted ? "bg-white/20" : `bg-gradient-to-br ${color}`
      }`}
    >
      <Icon
        size={20}
        className={`sm:w-6 sm:h-6 ${isHighlighted ? "text-white" : "text-white"}`}
      />
    </div>
    <p
      className={`text-sm sm:text-base font-black mb-1 ${isHighlighted ? "text-white" : "text-slate-900 dark:text-white"}`}
    >
      {label}
    </p>
    <p
      className={`text-[10px] sm:text-xs mb-3 ${isHighlighted ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
    >
      {multiple}x Revenue Multiple
    </p>
    <p
      className={`text-xl sm:text-3xl font-black ${isHighlighted ? "text-white" : color.includes("pink") ? "text-pink-600 dark:text-pink-400" : color.includes("blue") ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400"}`}
    >
      {formatCurrency(value)}
    </p>
  </div>
);

export default ITunesScenarioCard;
