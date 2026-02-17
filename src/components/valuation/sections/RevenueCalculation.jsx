import { Calculator } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import CalcRow from "../ui/CalcRow";

const RevenueCalculation = ({
  monthlyStreamsEst, effectiveSpotifyRate, geoMethodUsed,
  monthlySpotifyRevenue, ltmSpotifyRevenue,
  methodUsed, featuredTrackCount, totalTrackCount,
  formatNumber, formatCurrency,
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-6 lg:p-8">
    <SectionHeader icon={Calculator} title="Revenue Calculation" subtitle="Step-by-step royalty breakdown" gradient="from-purple-500 to-blue-600" />

    <div className="space-y-3">
      <CalcRow label="Monthly Streams (Estimated)"
        value={formatNumber(monthlyStreamsEst)}
        sub={methodUsed === "RECENT_30D" ? "Based on recent 30-day streams" : methodUsed === "RECENT_28D_NORMALIZED" ? "Based on recent 28-day streams" : "Lifetime streams with age decay"}
      />
      <CalcRow label="Spotify Payout Rate"
        value={`$${effectiveSpotifyRate.toFixed(4)}`}
        sub={`${geoMethodUsed === "WEIGHTED" ? "Geo-weighted" : "Global average"} Spotify payout rate`}
        valueColor="text-emerald-600 dark:text-emerald-400"
      />
      <CalcRow label="Monthly Revenue"
        value={formatCurrency(monthlySpotifyRevenue)}
        sub={`${formatNumber(monthlyStreamsEst)} streams × $${effectiveSpotifyRate.toFixed(4)}`}
        valueColor="text-blue-600 dark:text-blue-400"
      />

      {/* LTM highlight */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-2 border-emerald-300 dark:border-emerald-500/30 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300">
              Last Twelve Months (LTM) Revenue
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(monthlySpotifyRevenue)} × 12 months
              {methodUsed === "TOP_TRACKS_FEATURED_ADJ" && featuredTrackCount > 0 &&
                ` · featured track adj: ${featuredTrackCount}/${totalTrackCount} at 25%`}
            </p>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(ltmSpotifyRevenue)}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default RevenueCalculation;