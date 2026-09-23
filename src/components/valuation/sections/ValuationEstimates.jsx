import { BarChart3, Shield, TrendingUp, Star } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import SectionHeader from "../ui/SectionHeader";
import { useArtistStore } from "../../../store/artistStore";
import { CFA_MULTIPLIERS } from "../../../core/calculations/constants";

const ValuationCard = ({ icon: Icon, title, multiple, value, accent, featured }) => (
  <div className={`relative flex flex-col items-center text-center rounded-2xl p-4 sm:p-5 border-2 h-full ${accent.border} ${accent.bg} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden ${featured ? `ring-4 ${accent.ring} ring-offset-2 ring-offset-white dark:ring-offset-slate-950` : ""}`}>
    {featured && (
      <div className={`absolute top-0 left-0 right-0 py-1.5 text-[10px] sm:text-xs font-black text-white uppercase tracking-widest ${accent.badge}`}>
        ★ Most Common
      </div>
    )}
    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${accent.iconBg} rounded-2xl flex items-center justify-center shadow-lg mt-6 mb-3 shrink-0`}>
      <Icon size={22} className={`sm:w-6 sm:h-6 ${accent.iconText || "text-white"}`} />
    </div>
    <div className="flex flex-col items-center justify-center flex-1 w-full">
      <h3 className={`text-sm sm:text-base font-black ${accent.titleText || accent.text} mb-1`}>{title}</h3>
      <p className={`text-[9px] sm:text-[10px] font-bold ${accent.text} uppercase tracking-widest mb-3`}>{multiple} Rev Multiple</p>
      <Separator.Root className={`w-12 h-0.5 ${accent.sep} rounded-full mb-3 mt-auto`} decorative />
      <p className={`text-xl sm:text-2xl md:text-xl lg:text-lg xl:text-2xl 2xl:text-3xl font-black tracking-tight ${accent.text} w-full px-1`}>{value}</p>
    </div>
  </div>
);

const ValuationEstimates = ({ lowEstimate, midEstimate, highEstimate, acceleratorValue, formatCurrency, platformName }) => {
  const { royaltyShare = 100, currency = 'USD' } = useArtistStore();
  
  let settingText = "";
  if (royaltyShare < 100 || currency !== 'USD') {
    settingText = ` · Adjusted for ${royaltyShare}% share${currency !== 'USD' ? ` in ${currency}` : ''}`;
  }

  const isYouTube = platformName?.toLowerCase().includes("youtube");
  const isApple = platformName?.toLowerCase().includes("apple") || platformName?.toLowerCase().includes("itunes");

  const colors = isYouTube 
    ? {
        main: "from-[#FF0000] to-[#FF0000]",
        accentMid: { border: "border-[#FF0000] dark:border-[#FF0000]/50", bg: "bg-gradient-to-br from-[#FF0000]/5 to-[#FF0000]/10 dark:from-[#FF0000]/30 dark:to-[#FF0000]/10", iconBg: "bg-gradient-to-br from-[#FF0000] to-[#FF0000]", text: "text-[#FF0000] dark:text-[#FF0000]", sep: "bg-[#FF0000]", ring: "ring-[#FF0000] dark:ring-[#FF0000]", badge: "bg-[#FF0000]" },
        accentNorm: { border: "border-[#FF0000]/30 dark:border-[#FF0000]/30", bg: "bg-gradient-to-br from-[#FF0000]/5 to-[#FF0000]/10 dark:from-[#FF0000]/20 dark:to-[#FF0000]/10", iconBg: "bg-gradient-to-br from-[#FF0000] to-[#FF0000]", titleText: "text-[#FF0000] dark:text-[#FF0000]", text: "text-[#FF0000] dark:text-[#FF0000]/70", sep: "bg-[#FF0000]/30 dark:bg-[#FF0000]/50", ring: "", badge: "" }
      }
    : isApple 
    ? {
        main: "from-slate-900 to-slate-900 dark:from-white dark:to-white",
        accentMid: { border: "border-slate-900 dark:border-white/50", bg: "bg-gradient-to-br from-slate-900/5 to-slate-900/10 dark:from-white/10 dark:to-white/5", iconBg: "bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200", iconText: "text-white dark:text-slate-900", text: "text-slate-900 dark:text-white", sep: "bg-slate-900 dark:bg-white", ring: "ring-slate-900 dark:ring-white", badge: "bg-slate-900 dark:bg-white text-white dark:text-slate-900" },
        accentNorm: { border: "border-slate-900/30 dark:border-white/30", bg: "bg-gradient-to-br from-slate-900/5 to-slate-900/10 dark:from-white/10 dark:to-white/5", iconBg: "bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200", iconText: "text-white dark:text-slate-900", titleText: "text-slate-900 dark:text-white", text: "text-slate-900/70 dark:text-white/70", sep: "bg-slate-900/30 dark:bg-white/50", ring: "", badge: "" }
      }
    : {
        main: "from-[#1DB954] to-[#1DB954]",
        accentMid: { border: "border-[#1DB954] dark:border-[#1DB954]/50", bg: "bg-gradient-to-br from-[#1DB954]/5 to-[#1DB954]/10 dark:from-[#1DB954]/30 dark:to-[#1DB954]/10", iconBg: "bg-gradient-to-br from-[#1DB954] to-[#1DB954]", text: "text-[#1DB954] dark:text-[#1DB954]", sep: "bg-[#1DB954]", ring: "ring-[#1DB954] dark:ring-[#1DB954]", badge: "bg-[#1DB954]" },
        accentNorm: { border: "border-[#1DB954]/30 dark:border-[#1DB954]/30", bg: "bg-gradient-to-br from-[#1DB954]/5 to-[#1DB954]/10 dark:from-[#1DB954]/20 dark:to-[#1DB954]/10", iconBg: "bg-gradient-to-br from-[#1DB954] to-[#1DB954]", titleText: "text-[#1DB954] dark:text-[#1DB954]", text: "text-[#1DB954] dark:text-[#1DB954]/70", sep: "bg-[#1DB954]/30 dark:bg-[#1DB954]/50", ring: "", badge: "" }
      };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-6 lg:p-8">
      <SectionHeader 
        icon={BarChart3} 
        title="CFA Estimated Catalog Valuation" 
        subtitle={`Based on publicly available streaming data${settingText}`} 
        gradient={colors.main} 
      />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <ValuationCard icon={Shield} title="Low Estimate" multiple={`${CFA_MULTIPLIERS.LOW}×`} value={formatCurrency(lowEstimate)} accent={colors.accentNorm} />
        <ValuationCard icon={TrendingUp} title="Mid Estimate" multiple={`${CFA_MULTIPLIERS.MID}×`} value={formatCurrency(midEstimate)} featured accent={colors.accentMid} />
        <ValuationCard icon={Star} title="High Estimate" multiple={`${CFA_MULTIPLIERS.HIGH}×`} value={formatCurrency(highEstimate)} accent={colors.accentNorm} />
        <ValuationCard icon={TrendingUp} title="Catalog Accelerator" multiple={`+${Math.round((CFA_MULTIPLIERS.ACCELERATOR - 1) * 100)}%`} value={formatCurrency(acceleratorValue)} accent={colors.accentNorm} />
      </div>

      <div className="flex items-start gap-3 mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
        <div className="w-5 h-5 mt-0.5 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">i</span>
        </div>
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
          <strong>Note:</strong> The valuation shown above represents {platformName ? `your ${platformName} catalog` : "this platform"} only. 
          To see your complete, combined catalog valuation across all platforms, please check the <strong>Overview</strong> tab.
        </p>
      </div>
    </div>
  );
};

export default ValuationEstimates;
