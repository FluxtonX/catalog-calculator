import { DollarSign, Info } from "lucide-react";
import SectionHeader from "../../valuation/ui/SectionHeader"; // reuse existing

const RevenueAnalysis = ({
  estimatedAnnualViews, monetizedViews, grossAdRevenue,
  adRevenue, estimatedTotalPlays, streamingRevenue,
  totalAnnualRevenue, monetizationRate, creatorCut,
  streamingRate, formatNumber, formatCurrency,
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
    <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#FF0000] to-[#FF0000]/80 shadow-md">
        <DollarSign size={18} className="text-white" />
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#FF0000] dark:text-[#FF0000]">
          YouTube Comprehensive Revenue Analysis
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Ad revenue + Content ID breakdown</p>
      </div>
    </div>

    <div className="p-5 sm:p-7">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Col 1: Ad Revenue */}
        <div className="space-y-1">
          <h4 className="font-bold text-[#FF0000] dark:text-[#FF0000] text-xs sm:text-sm uppercase tracking-wide mb-3">
            1. Channel Ad Revenue (YPP)
          </h4>
          {[
            { label: "Est. Annual Views", value: formatNumber(estimatedAnnualViews) },
            { label: `Monetized Views (${monetizationRate}%)`, value: formatNumber(monetizedViews) },
            { label: "Gross Ad Revenue", value: formatCurrency(grossAdRevenue) },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{row.label}</span>
              <span className="text-xs sm:text-sm font-bold text-[#FF0000] dark:text-[#FF0000]">{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2.5 bg-[#FF0000]/10 dark:bg-[#FF0000]/20 rounded-xl px-3 mt-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Net Ad Revenue ({creatorCut}%)</span>
            <span className="text-xs sm:text-sm font-black text-[#FF0000] dark:text-[#FF0000]">{formatCurrency(adRevenue)}</span>
          </div>
        </div>

        {/* Col 2: Streaming */}
        <div className="space-y-1">
          <h4 className="font-bold text-[#FF0000] dark:text-[#FF0000] text-xs sm:text-sm uppercase tracking-wide mb-3">
            2. Content ID &amp; Streaming
          </h4>
          {[
           { label: "Est. Annual Platform Plays", value: formatNumber(estimatedTotalPlays) },
            { label: "Streaming Rate", value: `$${streamingRate.toFixed(4)}/play` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{row.label}</span>
              <span className="text-xs sm:text-sm font-bold text-[#FF0000] dark:text-[#FF0000]">{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2.5 bg-[#FF0000]/10 dark:bg-[#FF0000]/20 rounded-xl px-3 mt-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Streaming Revenue</span>
            <span className="text-xs sm:text-sm font-black text-[#FF0000] dark:text-[#FF0000]">{formatCurrency(streamingRevenue)}</span>
          </div>
        </div>

        {/* Col 3: Total */}
        <div className="space-y-1">
          <h4 className="font-bold text-[#FF0000] dark:text-[#FF0000] text-xs sm:text-sm uppercase tracking-wide mb-3">
            3. Total Annual Revenue
          </h4>
          {[
            { label: "Ad Revenue", value: formatCurrency(adRevenue), color: "text-[#FF0000] dark:text-[#FF0000]" },
            { label: "Streaming Revenue", value: formatCurrency(streamingRevenue), color: "text-[#FF0000] dark:text-[#FF0000]" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{row.label}</span>
              <span className={`text-xs sm:text-sm font-bold ${row.color}`}>{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2.5 bg-[#FF0000]/10 dark:bg-[#FF0000]/20 rounded-xl px-3 mt-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Total Annual Revenue</span>
            <span className="text-xs sm:text-sm font-black text-[#FF0000] dark:text-[#FF0000]">{formatCurrency(totalAnnualRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-6 flex items-start gap-2.5 p-4 bg-[#FF0000]/5 dark:bg-[#FF0000]/20 border border-[#FF0000]/20 dark:border-[#FF0000]/30 rounded-xl">
        <Info size={15} className="text-[#FF0000] mt-0.5 flex-shrink-0" />
        <p className="text-xs sm:text-sm text-[#FF0000]/80 dark:text-[#FF0000]/90">
          This includes both YouTube Partner Program ad revenue and Content ID/streaming royalties. Adjust sliders above to model different scenarios.
        </p>
      </div>
    </div>
  </div>
);

export default RevenueAnalysis;

