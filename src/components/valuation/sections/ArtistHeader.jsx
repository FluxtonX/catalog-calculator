import { DollarSign, Music, TrendingUp, Globe } from "lucide-react";
import InfoTooltip from "../ui/InfoTooltip";

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
    {badge && <p className="text-[10px] text-purple-500 dark:text-purple-400 font-semibold mt-1">✦ {badge}</p>}
  </div>
);

const ArtistHeader = ({ 
  artistName, 
  marketValuation, minMarketValuation, maxMarketValuation,
  monthlyStreamsEst, minMonthlyStreams, maxMonthlyStreams,
  ltmSpotifyRevenue, minLtmRevenue, maxLtmRevenue,
  effectiveSpotifyRate, geoMethodUsed, 
  formatCurrency, formatToMillions 
}) => {
  const formatRange = (min, max, formatter) => {
    return `${formatter(min)} - ${formatter(max)}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Title strip */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 dark:from-emerald-500/5 dark:via-blue-500/5 dark:to-purple-500/5 px-5 sm:px-7 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-md">
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Catalog Valuation Analysis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {artistName} — Spotify Royalty Model
            </p>
          </div>
        </div>
      </div>

      {/* 4 metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6">
        <MetricCard
          icon={DollarSign}
          label="Market Value Est."
          value={minMarketValuation ? formatRange(minMarketValuation, maxMarketValuation, formatCurrency) : formatCurrency(marketValuation)}
          sub="8× Multiple Range"
          badge="Top 10 Tracks"
          accent={{ border: "border-emerald-200 dark:border-emerald-500/30", iconBg: "bg-emerald-100 dark:bg-emerald-900/40", icon: "text-emerald-600 dark:text-emerald-400", text: "text-emerald-600 dark:text-emerald-400" }}
          tooltip="Estimated catalog value range at the standard 8× revenue multiple."
        />
        <MetricCard
          icon={Music}
          label="Monthly Streams Est."
          value={minMonthlyStreams ? formatRange(minMonthlyStreams, maxMonthlyStreams, formatToMillions) : formatToMillions(monthlyStreamsEst)}
          sub="Monthly Run-rate Range"
          badge="Top 10 Tracks"
          accent={{ border: "border-purple-200 dark:border-purple-500/30", iconBg: "bg-purple-100 dark:bg-purple-900/40", icon: "text-purple-600 dark:text-purple-400", text: "text-purple-600 dark:text-purple-400" }}
          tooltip="Estimated monthly stream range using best available data source."
        />
        <MetricCard
          icon={TrendingUp}
          label="Annual Revenue Est."
          value={minLtmRevenue ? formatRange(minLtmRevenue, maxLtmRevenue, formatCurrency) : formatCurrency(ltmSpotifyRevenue)}
          sub="LTM Est. Range"
          badge="Top 10 Tracks"
          accent={{ border: "border-blue-200 dark:border-blue-500/30", iconBg: "bg-blue-100 dark:bg-blue-900/40", icon: "text-blue-600 dark:text-blue-400", text: "text-blue-600 dark:text-blue-400" }}
          tooltip="Estimated Annual (Last Twelve Months) Spotify royalty revenue range."
        />
        <MetricCard
          icon={Globe}
          label="Payout Rate"
          value={"$" + (effectiveSpotifyRate * 1000).toFixed(2)}
          sub="per 1,000 streams"
          accent={{ border: "border-orange-200 dark:border-orange-500/30", iconBg: "bg-orange-100 dark:bg-orange-900/40", icon: "text-orange-600 dark:text-orange-400", text: "text-orange-600 dark:text-orange-400" }}
          tooltip={geoMethodUsed === "WEIGHTED" ? "Geo-weighted rate based on listener distribution." : "Global average Spotify payout rate."}
        />
      </div>
    </div>
  );
};

export default ArtistHeader;