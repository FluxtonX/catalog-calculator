import { DollarSign } from "lucide-react";

const AnnualRevenueCard = ({ totalAnnualRevenue, annualViewPercentage, streamingRate, formatCurrency }) => (
  <div className="bg-gradient-to-br from-[#CC0000]/5 to-[#CC0000]/10 dark:from-[#CC0000]/10 dark:to-[#CC0000]/5 rounded-3xl border-2 border-[#CC0000]/30 dark:border-[#CC0000]/40 shadow-xl overflow-hidden">
    <div className="p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        <div className="p-3 sm:p-4 bg-[#CC0000]/15 rounded-2xl">
          <DollarSign size={28} className="text-[#CC0000] dark:text-[#CC0000]" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#CC0000] dark:text-[#CC0000] uppercase tracking-widest mb-1">
            Estimated Annual Revenue
          </p>
       <p className="text-xs text-[#CC0000]/80 dark:text-[#CC0000]/80">
  Total projected yearly earnings (Ad + Streaming)
</p>
<p className="text-[10px] text-[#CC0000]/70 dark:text-[#CC0000]/70 mt-1">
  ✦ Based on {annualViewPercentage}% of lifetime views × ${streamingRate.toFixed(4)} Content ID rate
</p> </div>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-4xl sm:text-5xl font-black text-[#CC0000] dark:text-[#CC0000] leading-none">
          {formatCurrency(totalAnnualRevenue)}
        </p>
        <p className="text-xs text-[#CC0000]/70 dark:text-[#CC0000]/70 mt-1.5">per year</p>
      </div>
    </div>
  </div>
);

export default AnnualRevenueCard;
