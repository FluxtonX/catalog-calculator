import { DollarSign } from "lucide-react";

const AnnualRevenueCard = ({ totalAnnualRevenue, annualViewPercentage, streamingRate, formatCurrency }) => (
  <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/10 rounded-3xl border-2 border-emerald-300 dark:border-emerald-500/40 shadow-xl overflow-hidden">
    <div className="p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        <div className="p-3 sm:p-4 bg-emerald-500/20 rounded-2xl">
          <DollarSign size={28} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">
            Estimated Annual Revenue
          </p>
       <p className="text-xs text-emerald-600 dark:text-emerald-500">
  Total projected yearly earnings (Ad + Streaming)
</p>
<p className="text-[10px] text-emerald-500 dark:text-emerald-600 mt-1">
  ✦ Based on {annualViewPercentage}% of lifetime views × $0.0054 Content ID rate
</p>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
          {formatCurrency(totalAnnualRevenue)}
        </p>
        <p className="text-xs text-emerald-500 dark:text-emerald-600 mt-1.5">per year</p>
      </div>
    </div>
  </div>
);

export default AnnualRevenueCard;