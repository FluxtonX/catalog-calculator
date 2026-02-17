const SectionHeader = ({ icon: Icon, title, subtitle, gradient }) => (
  <div className="flex items-center gap-3 mb-5 sm:mb-6">
    <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md flex-shrink-0`}>
      <Icon size={18} className="sm:w-5 sm:h-5 text-white" />
    </div>
    <div>
      <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export default SectionHeader;