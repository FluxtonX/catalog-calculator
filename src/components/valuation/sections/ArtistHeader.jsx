import { DollarSign, Music, TrendingUp, Globe } from "lucide-react";
import InfoTooltip from "../ui/InfoTooltip";

// eslint-disable-next-line no-unused-vars
const MetricCard = ({ icon: Icon, label, value, sub, accent, tooltip, badge }) => (
  <div className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border-2 ${accent.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden cursor-default`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-xl ${accent.iconBg}`}>
        <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${accent.icon}`} />
      </div>
      {tooltip && <InfoTooltip content={tooltip} />}
    </div>
    <p className={`text-xl sm:text-2xl lg:text-3xl font-black ${accent.text} leading-none mb-1.5`}>{value}</p>
    <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{sub}</p>}
    {badge && <p className="text-[10px] text-[#1DB954] dark:text-[#1DB954]/70 font-semibold mt-1">✦ {badge}</p>}
  </div>
);

// eslint-disable-next-line no-unused-vars
const ArtistHeader = ({ artistName, marketValuation, monthlyStreamsEst, ltmSpotifyRevenue, effectiveSpotifyRate, geoMethodUsed, cfaConfidence, formatCurrency, formatToMillions, formatNumber }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
    {/* Title strip */}
    <div className="bg-gradient-to-r from-[#1DB954]/10 via-[#1DB954]/10 to-[#1DB954]/10 dark:from-[#1DB954]/5 dark:via-[#1DB954]/5 dark:to-[#1DB954]/5 px-5 sm:px-7 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#1DB954] to-[#1DB954] shadow-md">
          <DollarSign size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            CFA Estimated Catalog Valuation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {artistName} — Based on public streaming data
          </p>
        </div>
      </div>
    </div>

    {/* 4 metric cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6">
      <MetricCard
        icon={DollarSign}
        label="CFA Mid Estimate"
        value={formatCurrency(marketValuation)}
        sub="8× Multiple"
        badge="Top 10 Tracks"
        accent={{ border: "border-[#1DB954]/20 dark:border-[#1DB954]/30", iconBg: "bg-[#1DB954]/10 dark:bg-[#1DB954]/40", icon: "text-[#1DB954] dark:text-[#1DB954]", text: "text-[#1DB954] dark:text-[#1DB954]" }}
        tooltip="CFA Catalog value at the standard 8× revenue multiple."
      />
      <MetricCard
        icon={Music}
        label="Monthly Streams"
        value={formatToMillions(monthlyStreamsEst)}
        sub={formatNumber(monthlyStreamsEst)}
        badge="Top 10 Tracks"
        accent={{ border: "border-[#1DB954]/20 dark:border-[#1DB954]/30", iconBg: "bg-[#1DB954]/10 dark:bg-[#1DB954]/40", icon: "text-[#1DB954] dark:text-[#1DB954]/70", text: "text-[#1DB954] dark:text-[#1DB954]/70" }}
        tooltip="CFA estimated monthly streams based on run-rate logic."
      />
      <MetricCard
        icon={TrendingUp}
        label="Est. Annual Rev"
        value={formatCurrency(ltmSpotifyRevenue)}
        sub="Artist Attributed"
        badge="Top 10 Tracks"
        accent={{ border: "border-[#1DB954]/20 dark:border-[#1DB954]/30", iconBg: "bg-[#1DB954]/10 dark:bg-[#1DB954]/40", icon: "text-[#1DB954] dark:text-[#1DB954]/70", text: "text-[#1DB954] dark:text-[#1DB954]/70" }}
        tooltip="Estimated Annual Streaming Revenue attributable to the artist."
      />
      <MetricCard
        icon={Globe}
        label="Data Confidence"
        value={cfaConfidence || "HIGH"}
        sub={"Avg $" + (effectiveSpotifyRate * 1000).toFixed(2) + " CPM"}
        accent={{ border: "border-[#1DB954]/20 dark:border-[#1DB954]/30", iconBg: "bg-[#1DB954]/10 dark:bg-[#1DB954]/40", icon: "text-[#1DB954] dark:text-[#1DB954]/70", text: "text-[#1DB954] dark:text-[#1DB954]/70" }}
        tooltip="CFA Data Confidence based on public data availability."
      />
    </div>
  </div>
);

export default ArtistHeader;
