// AFTER
import { Calculator, TrendingUp, DollarSign, Info } from "lucide-react";

import * as Separator from "@radix-ui/react-separator";

// eslint-disable-next-line no-unused-vars
const ScenarioCard = ({ icon: Icon, title, subtitle, value, color, featured }) => (
  <div className={`relative flex flex-col items-center text-center rounded-2xl p-4 sm:p-6 border-2 ${color.border} ${color.bg} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${featured ? `ring-4 ${color.ring} ring-offset-2 ring-offset-white dark:ring-offset-slate-950` : ""}`}>
    {featured && (
      <div className={`absolute top-0 left-0 right-0 py-1.5 text-[10px] font-black text-white uppercase tracking-widest rounded-t-xl ${color.badge}`}>
        ★ Market Standard
      </div>
    )}
    <div className={`w-11 h-11 sm:w-14 sm:h-14 ${color.iconBg} rounded-2xl flex items-center justify-center ${featured ? "mt-6" : "mt-0"} mb-3 shadow-md`}>
      <Icon size={20} className="sm:w-6 sm:h-6 text-white" />
    </div>
    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1">{title}</h4>
    <p className={`text-[10px] sm:text-xs font-bold ${color.text} uppercase tracking-widest mb-3`}>{subtitle}</p>
    <Separator.Root className={`w-10 h-0.5 ${color.sep} rounded-full mb-3`} decorative />
    <p className={`text-2xl sm:text-3xl font-black ${color.text}`}>{value}</p>
  </div>
);

const ValuationScenarios = ({
  conservativeValuation, marketValuation, premiumValuation,
  totalAnnualRevenue, caccAdjustedValuation, formatCurrency,
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
    <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
        <DollarSign size={18} className="text-white" />
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Professional Valuation Scenarios
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Based on annual revenue of{" "}
          <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(totalAnnualRevenue)}</span>
        </p>
      </div>
    </div>

    <div className="p-5 sm:p-7 space-y-6">
      {/* 3 scenario cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ScenarioCard icon={Calculator} title="Conservative" subtitle="6× Multiple" value={formatCurrency(conservativeValuation)}
          color={{ border: "border-blue-200 dark:border-blue-500/30", bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10", iconBg: "bg-gradient-to-br from-blue-500 to-blue-700", text: "text-blue-600 dark:text-blue-400", sep: "bg-blue-300", ring: "", badge: "" }}
        />
        <ScenarioCard icon={TrendingUp} title="Market Standard" subtitle="8× Multiple" value={formatCurrency(marketValuation)} featured
          color={{ border: "border-emerald-300 dark:border-emerald-500/40", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10", iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-700", text: "text-emerald-600 dark:text-emerald-400", sep: "bg-emerald-400", ring: "ring-emerald-400 dark:ring-emerald-500", badge: "bg-emerald-500" }}
        />
        <ScenarioCard icon={TrendingUp} title="Premium" subtitle="10× Multiple" value={formatCurrency(premiumValuation)}
          color={{ border: "border-purple-200 dark:border-purple-500/30", bg: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10", iconBg: "bg-gradient-to-br from-purple-500 to-purple-700", text: "text-purple-600 dark:text-purple-400", sep: "bg-purple-300", ring: "", badge: "" }}
        />
      </div>

      {/* Growth-Adjusted Valuation — full width */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-500" />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Growth-Adjusted Valuation</h4>
        </div>
       <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
  <span className="text-slate-500 dark:text-slate-400">Base 8× Valuation</span>
  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalAnnualRevenue * 8)}</span>
</div>
<div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
  <div className="flex items-center gap-1.5">
    <span className="text-slate-500 dark:text-slate-400">CACC Growth (+30%)</span>
    <div className="group relative flex items-center">
      <Info size={13} className="text-blue-400 cursor-pointer flex-shrink-0" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 leading-relaxed">
        <span className="font-bold text-blue-300">CACC (Catalog Asset & Content Claims)</span> represents unclaimed revenue we have identified and located within this catalog. This recovered revenue is applied as a 30% uplift to reflect the catalog's true earning potential.
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
      </div>
    </div>
  </div>
  <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(totalAnnualRevenue * 8 * 0.3)}</span>
</div>
        <div className="flex justify-between items-center py-2 mt-1 text-xs sm:text-sm">
          <span className="font-bold text-slate-900 dark:text-white">Adjusted Valuation</span>
          <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(caccAdjustedValuation)}</span>
        </div>
      </div>
    </div>
  </div>
);

export default ValuationScenarios;