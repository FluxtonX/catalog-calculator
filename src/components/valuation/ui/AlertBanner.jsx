const AlertBanner = ({ icon: Icon, title, message, accent, action }) => (
  <div className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border-2 ${accent.border} ${accent.bg} shadow-sm`}>
    <div className={`p-2 sm:p-2.5 rounded-xl ${accent.iconBg} flex-shrink-0`}>
      <Icon size={18} className={`sm:w-5 sm:h-5 ${accent.icon}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm sm:text-base font-bold ${accent.title} mb-0.5`}>{title}</p>
      <p className={`text-xs sm:text-sm ${accent.text} leading-relaxed`}>{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  </div>
);

export default AlertBanner;