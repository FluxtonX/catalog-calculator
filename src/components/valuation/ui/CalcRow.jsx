const CalcRow = ({ label, value, sub, valueColor = "text-slate-900 dark:text-white" }) => (
  <div className="flex items-start justify-between gap-4 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{label}</p>
      {sub && <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
    <p className={`text-lg sm:text-xl font-black ${valueColor} flex-shrink-0`}>{value}</p>
  </div>
);

export default CalcRow;