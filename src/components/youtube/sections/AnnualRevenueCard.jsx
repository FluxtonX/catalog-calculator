import { DollarSign } from "lucide-react";

const AnnualRevenueCard = ({ totalAnnualRevenue, annualViewPercentage, streamingRate, formatCurrency }) => (
  <div className="bg-gradient-to-br from-red-50 via-red-50 to-red-50 dark:from-red-900/20 dark:via-red-900/20 dark:to-red-900/10 rounded-3xl border-2 border-red-300 dark:border-red-500/40 shadow-xl overflow-hidden">
    <div className="p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        <div className="p-3 sm:p-4 bg-red-500/20 rounded-2xl">
          <DollarSign size={28} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-widest mb-1">
            Estimated Annual Revenue
          </p>
       <p className="text-xs text-red-600 dark:text-red-500">
  Total projected yearly earnings (Ad + Streaming)
</p>
<p className="text-[10px] text-red-500 dark:text-red-600 mt-1">
  ✦ Based on {annualViewPercentage}% of lifetime views × ${streamingRate.toFixed(4)} Content ID rate
</p> </div>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-4xl sm:text-5xl font-black text-red-600 dark:text-red-400 leading-none">
          {formatCurrency(totalAnnualRevenue)}
        </p>
        <p className="text-xs text-red-500 dark:text-red-600 mt-1.5">per year</p>
      </div>
    </div>
  </div>
);

export default AnnualRevenueCard;