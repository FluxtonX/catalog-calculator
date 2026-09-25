import React, { useMemo } from "react";
import { TrendingUp, PieChart } from "lucide-react";
import { useArtistStore } from "../../store/artistStore";
import { getCombinedCfaValuations } from "../../core/calculations";

const formatCompact = (value, currencyCode = 'USD') => {
  if (!value || isNaN(value)) return "$0";
  
  let symbol = '$';
  try {
    symbol = (0).toLocaleString('en-US', { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).replace(/\d|\.|,/g, '').trim();
  } catch(e) {}

  if (value >= 1_000_000_000) return symbol + (value / 1_000_000_000).toFixed(2) + "B";
  if (value >= 1_000_000) return symbol + (value / 1_000_000).toFixed(2) + "M";
  if (value >= 1_000) return symbol + (value / 1_000).toFixed(1) + "K";
  return symbol + value.toFixed(0);
};

const PLATFORM_META = {
  spotify: { label: "Spotify", color: "#1DB954", bgFrom: "from-[#1DB954]/10", bgTo: "to-[#1DB954]/5", border: "border-[#1DB954]/20", text: "text-[#1DB954]" },
  itunes:  { label: "Apple Music", color: "#000000", bgFrom: "from-slate-100", bgTo: "to-slate-50", border: "border-slate-200 dark:border-slate-700", text: "text-slate-900 dark:text-white" },
  youtube: { label: "YouTube", color: "#FF0000", bgFrom: "from-[#FF0000]/10", bgTo: "to-[#FF0000]/5", border: "border-[#FF0000]/20", text: "text-[#FF0000]" },
};

/**
 * Shows how much a specific platform contributes to the total combined catalog value.
 * @param {string} platform - "spotify" | "itunes" | "youtube"
 */
const PlatformContributionBanner = ({ platform }) => {
  const selectedArtists = useArtistStore((s) => s.selectedArtists);
  const royaltyShare = useArtistStore((s) => s.royaltyShare) || 100;
  const currency = useArtistStore((s) => s.currency) || 'USD';
  const exchangeRates = useArtistStore((s) => s.exchangeRates) || { USD: 1 };

  const data = useMemo(() => {
    if (!selectedArtists || Object.keys(selectedArtists).length === 0) return null;
    return getCombinedCfaValuations(selectedArtists);
  }, [selectedArtists]);

  if (!data || !data.breakdown) return null;

  const platformKey = platform === "apple" ? "itunes" : platform;
  const platformData = data.breakdown[platformKey];
  if (!platformData) return null;

  const rawTotalMid = data.midEstimate || 0;
  const rawPlatformMid = platformData.midEstimate || 0;

  const activeKeys = Object.keys(data.breakdown)
    .filter(k => !k.includes("_proxy") && (data.breakdown[k].midEstimate || 0) > 0)
    .sort();

  // Only show if there are multiple platforms contributing
  if (activeKeys.length < 2) return null;

  let percentage = "0.0";
  if (rawTotalMid > 0 && activeKeys.includes(platformKey)) {
    let sumPercentages = 0;
    const percentages = {};
    
    for (let i = 0; i < activeKeys.length - 1; i++) {
      const key = activeKeys[i];
      const pMid = data.breakdown[key].midEstimate || 0;
      const p = parseFloat(((pMid / rawTotalMid) * 100).toFixed(1));
      percentages[key] = p;
      sumPercentages += p;
    }
    
    const lastKey = activeKeys[activeKeys.length - 1];
    // This perfectly ensures that all shares sum up to exactly 100.0%
    percentages[lastKey] = parseFloat((100.0 - sumPercentages).toFixed(1));
    
    percentage = percentages[platformKey].toFixed(1);
  }

  const rate = exchangeRates[currency] || 1;
  const adjustedTotalMid = rawTotalMid * (royaltyShare / 100) * rate;
  const adjustedPlatformMid = rawPlatformMid * (royaltyShare / 100) * rate;

  const meta = PLATFORM_META[platformKey] || PLATFORM_META.spotify;

  return (
    <div className={`bg-gradient-to-r ${meta.bgFrom} ${meta.bgTo} dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl border-2 ${meta.border} dark:border-slate-700 p-4 sm:p-5 mb-5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm`}>
          <PieChart size={16} className={meta.text} />
        </div>
        <div>
          <h3 className={`text-sm font-black ${meta.text}`}>
            {meta.label} Contribution to Total Catalog Value
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Combined across all selected platforms
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Platform value */}
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{meta.label} (8× Mid)</p>
          <p className={`text-xl sm:text-2xl font-black ${meta.text}`}>
            {formatCompact(adjustedPlatformMid, currency)}
          </p>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Total value */}
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Total Catalog Value</p>
          <p className={`text-xl sm:text-2xl font-black ${meta.text}`}>
            {formatCompact(adjustedTotalMid, currency)}
          </p>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Percentage */}
        <div className="flex-shrink-0 text-center">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Share</p>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className={meta.text} />
            <p className={`text-xl sm:text-2xl font-black ${meta.text}`}>
              {percentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percentage}%`, backgroundColor: meta.color }}
        />
      </div>
    </div>
  );
};

export default PlatformContributionBanner;
