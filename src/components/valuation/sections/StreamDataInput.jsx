import { Music, TrendingUp, Calendar, Zap, Info } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import InfoTooltip from "../ui/InfoTooltip";

const StreamDataInput = ({
  lifetimeStreamsInput, setLifetimeStreamsInput,
  releaseDate, setReleaseDate,
  methodUsed, methodLabel,
  featuredTrackCount, totalTrackCount,
  formatNumber,
}) => (
  <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
    <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
        <Music size={18} className="text-white" />
      </div>
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Stream Data</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Enter lifetime catalog streaming data</p>
      </div>
    </div>

    <div className="p-4 sm:p-6 space-y-5">
      {/* Lifetime Streams */}
      <div className="space-y-2">

<label className="flex items-center text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
  <TrendingUp size={14} className="mr-2" /> Lifetime Streams (All Songs)
  <InfoTooltip content="Total cumulative streams across ALL songs in the artist's catalog — not just top 10. Include streams from every track, album, and single." />
</label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <TrendingUp size={16} />
          </div>
          <input
            type="text"
            value={formatNumber(parseFloat(lifetimeStreamsInput.replace(/,/g, "")))}
            onChange={(e) => setLifetimeStreamsInput(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full pl-10 pr-4 py-3 sm:py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm sm:text-base font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            placeholder="0"
          />
        </div>
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <label className="flex items-center text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
          <Calendar size={14} className="mr-2" /> Average Dollar Date
          <InfoTooltip content="The average release date of the artist's catalog, used to estimate how old the music is. Auto-calculated from top tracks — adjust if you have a more accurate date." />
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            <Calendar size={16} />
          </div>
          <DatePicker
            placeholderText="YYYY-MM-DD"
            selected={releaseDate ? new Date(releaseDate) : null}
            onChange={(date) => { if (date) setReleaseDate(date.toISOString().split("T")[0]); }}
            withPortal withFullScreenPortal portalContainer={document.body} portalId="date-picker-portal"
            dateFormat="yyyy-MM-dd" maxDate={new Date()} showMonthDropdown showYearDropdown dropdownMode="select"
            wrapperClassName="w-full block"
            className="w-full pl-10 pr-4 py-3 sm:py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm sm:text-base font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Method badge */}
 <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl">
  <Zap size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
  <div>
    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-0.5">Calculation Method</p>
    <p className="text-xs text-blue-600 dark:text-blue-500">{methodLabel}</p>
    <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1">
      ⚠️ Auto-calculated from top 10 tracks only — update Lifetime Streams above to include all songs for a more accurate valuation.
    </p>
  </div>
</div>

      {/* Featured track notice */}
      {methodUsed === "TOP_TRACKS_FEATURED_ADJ" && featuredTrackCount > 0 && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 rounded-xl">
          <Info size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <strong>Featured Track Adjustment:</strong> {featuredTrackCount}/{totalTrackCount} tracks are featured collaborations at 25% revenue share.
          </p>
        </div>
      )}
    </div>
  </div>
);

export default StreamDataInput;