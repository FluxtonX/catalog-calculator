import { BarChart3, Shield, TrendingUp, Star } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import SectionHeader from "../ui/SectionHeader";

const ValuationCard = ({ icon: Icon, title, multiple, value, accent, featured }) => (
  <div className={`relative flex flex-col items-center text-center rounded-2xl p-4 sm:p-5 border-2 h-full ${accent.border} ${accent.bg} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden ${featured ? `ring-4 ${accent.ring} ring-offset-2 ring-offset-white dark:ring-offset-slate-950` : ""}`}>
    {featured && (
      <div className={`absolute top-0 left-0 right-0 py-1.5 text-[10px] sm:text-xs font-black text-white uppercase tracking-widest ${accent.badge}`}>
        ★ Most Common
      </div>
    )}
    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${accent.iconBg} rounded-2xl flex items-center justify-center shadow-lg mt-6 mb-3 shrink-0`}>
      <Icon size={22} className="sm:w-6 sm:h-6 text-white" />
    </div>
    <div className="flex flex-col items-center justify-center flex-1 w-full">
      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className={`text-[9px] sm:text-[10px] font-bold ${accent.text} uppercase tracking-widest mb-3`}>{multiple} Rev Multiple</p>
      <Separator.Root className={`w-12 h-0.5 ${accent.sep} rounded-full mb-3 mt-auto`} decorative />
      <p className={`text-xl sm:text-2xl md:text-xl lg:text-lg xl:text-2xl 2xl:text-3xl font-black tracking-tight ${accent.text} w-full px-1`}>{value}</p>
    </div>
  </div>
);

const ValuationEstimates = ({ lowEstimate, midEstimate, highEstimate, acceleratorValue, formatCurrency }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-6 lg:p-8">
<SectionHeader icon={BarChart3} title="CFA Estimated Catalog Valuation" subtitle="Based on publicly available streaming data" gradient="from-[#1DB954] to-[#1DB954]" />
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <ValuationCard icon={Shield} title="Low Estimate" multiple="6×" value={formatCurrency(lowEstimate)}
        accent={{ border: "border-[#1DB954]/30 dark:border-[#1DB954]/30", bg: "bg-gradient-to-br from-[#1DB954]/5 to-[#1DB954]/10 dark:from-[#1DB954]/20 dark:to-[#1DB954]/10", iconBg: "bg-gradient-to-br from-[#1DB954] to-[#1DB954]", text: "text-[#1DB954] dark:text-[#1DB954]/70", sep: "bg-[#1DB954]/30 dark:bg-[#1DB954]/50", ring: "", badge: "" }}
      />
      <ValuationCard icon={TrendingUp} title="Mid Estimate" multiple="8×" value={formatCurrency(midEstimate)} featured
        accent={{ border: "border-[#1DB954] dark:border-[#1DB954]/50", bg: "bg-gradient-to-br from-[#1DB954]/5 to-[#1DB954]/10 dark:from-[#1DB954]/30 dark:to-[#1DB954]/10", iconBg: "bg-gradient-to-br from-[#1DB954] to-[#1DB954]", text: "text-[#1DB954] dark:text-[#1DB954]", sep: "bg-[#1DB954]", ring: "ring-[#1DB954] dark:ring-[#1DB954]", badge: "bg-[#1DB954]" }}
      />
      <ValuationCard icon={Star} title="High Estimate" multiple="10×" value={formatCurrency(highEstimate)}
        accent={{ border: "border-[#1DB954]/30 dark:border-[#1DB954]/30", bg: "bg-gradient-to-br from-[#1DB954]/5 to-[#1DB954]/10 dark:from-[#1DB954]/20 dark:to-[#1DB954]/10", iconBg: "bg-gradient-to-br from-[#1DB954] to-[#1DB954]", text: "text-[#1DB954] dark:text-[#1DB954]/70", sep: "bg-[#1DB954]/30 dark:bg-[#1DB954]/50", ring: "", badge: "" }}
      />
      <ValuationCard icon={TrendingUp} title="Catalog Accelerator" multiple="+30%" value={formatCurrency(acceleratorValue)}
        accent={{ border: "border-[#1DB954]/30 dark:border-[#1DB954]/30", bg: "bg-gradient-to-br from-[#1DB954]/5 to-[#1DB954]/10 dark:from-[#1DB954]/20 dark:to-[#1DB954]/10", iconBg: "bg-gradient-to-br from-[#1DB954] to-[#1DB954]", text: "text-[#1DB954] dark:text-[#1DB954]/70", sep: "bg-[#1DB954]/30 dark:bg-[#1DB954]/50", ring: "", badge: "" }}
      />
    </div>
  </div>
);

export default ValuationEstimates;
