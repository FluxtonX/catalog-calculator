
import { Calendar } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import InfoTooltip from "../ui/InfoTooltip";
import RadixProgress from "../ui/RadixProgress";

const DollarAgeAnalysis = ({ dollarAgeData, formatCurrency }) => {
  const { dollarAge, trackBreakdown, totalWeightedAge, totalLTMEarnings } = dollarAgeData;

  const stability = dollarAge >= 5
    ? { label: "Mature Catalog", sub: "High Stability", color: "text-[#1DB954] dark:text-[#1DB954]", dot: "bg-[#1DB954]", pct: 100, bar: "from-[#1DB954] to-[#1DB954]" }
    : dollarAge >= 3
    ? { label: "Established Catalog", sub: "Moderate Stability", color: "text-[#1DB954] dark:text-[#1DB954]/70", dot: "bg-[#1DB954]", pct: 65, bar: "from-[#1DB954] to-[#1DB954]/70" }
    : { label: "Young Catalog", sub: "Growth Phase", color: "text-[#1DB954] dark:text-[#1DB954]/70", dot: "bg-[#1DB954]", pct: 35, bar: "from-[#1DB954] to-[#1DB954]" };

  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2">
        <SectionHeader icon={Calendar} title="Dollar Age Analysis" subtitle="Weighted average age of catalog earnings" gradient="from-[#1DB954] to-[#1DB954]" />
        <InfoTooltip content="Dollar Age = Σ(Track Age × LTM Earnings) / Total LTM Earnings. Higher = more stable income." />
      </div>

      {/* Top section — big number + summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Dollar Age */}
        <div className="bg-gradient-to-br from-[#1DB954]/5 to-[#1DB954]/5 dark:from-[#1DB954]/20 dark:to-[#1DB954]/20 border-2 border-[#1DB954]/20 dark:border-[#1DB954]/30 rounded-2xl p-5 text-center">
          <p className="text-xs font-bold text-[#1DB954] dark:text-[#1DB954]/70 uppercase tracking-wide mb-2">Dollar Age</p>
          <p className="text-5xl font-black text-[#1DB954] dark:text-[#1DB954]/70 leading-none">{dollarAge.toFixed(1)}</p>
          <p className="text-xs text-[#1DB954] mt-1">years</p>
          <div className="mt-3 pt-3 border-t border-[#1DB954]/20 dark:border-[#1DB954]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full animate-pulse ${stability.dot}`} />
              <span className={`text-xs font-bold ${stability.color}`}>{stability.label}</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">{stability.sub}</p>
            <RadixProgress value={stability.pct} colorClass={stability.bar} />
          </div>
        </div>

        {/* Summary stats */}
        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Total LTM Earnings</p>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{formatCurrency(totalLTMEarnings)}</p>
          </div>
       <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
  <div className="flex items-center gap-1 mb-1">
    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Weighted Age Sum</p>
    <InfoTooltip content="The sum of (Track Age × LTM Earnings) for all tracks. Example: a 5-year-old track earning $10K contributes 50K to this sum. Dividing this by Total LTM Earnings gives the Dollar Age." />
  </div>
  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{(totalWeightedAge / 1000).toFixed(1)}K</p>
</div>
          <div className="col-span-2 bg-[#1DB954]/5 dark:bg-[#1DB954]/20 border border-[#1DB954]/20 dark:border-[#1DB954]/30 rounded-2xl p-3">
            <p className="text-[10px] font-bold text-[#1DB954] dark:text-[#1DB954]/70 uppercase mb-1">Formula</p>
            <p className="text-xs text-[#1DB954] dark:text-[#1DB954] font-mono">
              Σ(Track Age × LTM Earnings) ÷ Total LTM Earnings
            </p>
          </div>
        </div>
      </div>

      {/* Track Breakdown */}
      {trackBreakdown.length > 0 && (
        <>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Top Tracks Contribution</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trackBreakdown.map((track, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 hover:border-[#1DB954]/30 dark:hover:border-[#1DB954]/40 transition-colors">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{track.name}</p>
                    <p className="text-[10px] text-slate-400">
                      Released {new Date(track.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className="text-base font-black text-[#1DB954] flex-shrink-0">{track.ageInYears.toFixed(1)}y</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-1.5 text-center">
                    <p className="text-slate-400">LTM Earnings</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(track.ltmEarnings)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-1.5 text-center">
                    <p className="text-slate-400">Weighted</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{(track.weightedAge / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DollarAgeAnalysis;