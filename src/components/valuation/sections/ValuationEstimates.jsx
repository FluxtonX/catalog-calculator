import { BarChart3, Shield, TrendingUp, Star } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import SectionHeader from "../ui/SectionHeader";

const ValuationCard = ({ icon: Icon, title, multiple, value, accent, featured }) => (
  <div className={`relative flex flex-col items-center text-center rounded-2xl p-5 sm:p-7 border-2 ${accent.border} ${accent.bg} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden ${featured ? `ring-4 ${accent.ring} ring-offset-2 ring-offset-white dark:ring-offset-slate-950` : ""}`}>
    {featured && (
      <div className={`absolute top-0 left-0 right-0 py-1.5 text-[10px] sm:text-xs font-black text-white uppercase tracking-widest ${accent.badge}`}>
        ★ Most Common
      </div>
    )}
    <div className={`w-12 h-12 sm:w-16 sm:h-16 ${accent.iconBg} rounded-2xl flex items-center justify-center shadow-lg ${featured ? "mt-6" : "mt-0"} mb-4`}>
      <Icon size={22} className="sm:w-7 sm:h-7 text-white" />
    </div>
    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1">{title}</h3>
    <p className={`text-[10px] sm:text-xs font-bold ${accent.text} uppercase tracking-widest mb-4`}>{multiple} Revenue Multiple</p>
    <Separator.Root className={`w-12 h-0.5 ${accent.sep} rounded-full mb-4`} decorative />
    <p className={`text-3xl sm:text-4xl font-black ${accent.text}`}>{value}</p>
  </div>
);

const ValuationEstimates = ({ lowEstimate, midEstimate, highEstimate, acceleratorValue, formatCurrency }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-6 lg:p-8">
<SectionHeader icon={BarChart3} title="CFA Estimated Catalog Valuation" subtitle="Based on publicly available streaming data" gradient="from-emerald-500 to-teal-600" />
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <ValuationCard icon={Shield} title="Low Estimate" multiple="6×" value={formatCurrency(lowEstimate)}
        accent={{ border: "border-blue-300 dark:border-blue-500/30", bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10", iconBg: "bg-gradient-to-br from-blue-500 to-blue-700", text: "text-blue-600 dark:text-blue-400", sep: "bg-blue-300 dark:bg-blue-500/50", ring: "", badge: "" }}
      />
      <ValuationCard icon={TrendingUp} title="Mid Estimate" multiple="8×" value={formatCurrency(midEstimate)} featured
        accent={{ border: "border-emerald-400 dark:border-emerald-500/50", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/10", iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-700", text: "text-emerald-600 dark:text-emerald-400", sep: "bg-emerald-400", ring: "ring-emerald-400 dark:ring-emerald-500", badge: "bg-emerald-500" }}
      />
      <ValuationCard icon={Star} title="High Estimate" multiple="10×" value={formatCurrency(highEstimate)}
        accent={{ border: "border-purple-300 dark:border-purple-500/30", bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10", iconBg: "bg-gradient-to-br from-purple-500 to-purple-700", text: "text-purple-600 dark:text-purple-400", sep: "bg-purple-300 dark:bg-purple-500/50", ring: "", badge: "" }}
      />
      <ValuationCard icon={TrendingUp} title="Catalog Accelerator" multiple="+30%" value={formatCurrency(acceleratorValue)}
        accent={{ border: "border-amber-300 dark:border-amber-500/30", bg: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10", iconBg: "bg-gradient-to-br from-amber-500 to-amber-700", text: "text-amber-600 dark:text-amber-400", sep: "bg-amber-300 dark:bg-amber-500/50", ring: "", badge: "" }}
      />
    </div>
  </div>
);

export default ValuationEstimates;