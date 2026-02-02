const StatCard = ({ label, value, icon: Icon }) => {
  return (
    <div className="group relative bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
      
      {/* Optional Glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-wide">
          {Icon && <Icon size={14} className="text-white/60" />}
          <span>{label}</span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          {value}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
