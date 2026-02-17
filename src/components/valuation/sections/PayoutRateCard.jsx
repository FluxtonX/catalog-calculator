import { Globe, Info } from "lucide-react";
import { RATE_BY_REGION } from "../hooks/useValuationLogic";
import RadixProgress from "../ui/RadixProgress";

const PayoutRateCard = ({ effectiveSpotifyRate, geoMethodUsed, geoRateData }) => (
  <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
    <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
        <Globe size={18} className="text-white" />
      </div>
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Payout Rate</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {geoMethodUsed === "WEIGHTED" ? "Geo-weighted" : "Global average"}
        </p>
      </div>
    </div>

    <div className="p-4 sm:p-5 flex-1 space-y-4">
      {/* Big rate number */}
      <div className="text-center py-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-500/30">
        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Effective Rate</p>
        <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
          ${effectiveSpotifyRate.toFixed(4)}
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">per stream</p>
      </div>

      {/* Geo breakdown */}
      {geoMethodUsed === "WEIGHTED" && geoRateData.breakdown ? (
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Geographic Distribution</p>
          {Object.entries(geoRateData.breakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([region, share]) => (
              <div key={region} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{region}</span>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {(share * 100).toFixed(1)}% · ${RATE_BY_REGION[region]?.toFixed(4)}
                  </span>
                </div>
                <RadixProgress value={share * 100} />
              </div>
            ))}
        </div>
      ) : (
        <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <Info size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Using global average rate. Add city data to enable geo-weighted calculation.
          </p>
        </div>
      )}
    </div>
  </div>
);

export default PayoutRateCard;