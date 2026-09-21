import React from "react";
import { Calendar } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import InfoTooltip from "../ui/InfoTooltip";

const THEME = {
  spotify: {
    text: "text-[#1DB954]",
    textDark: "dark:text-[#1DB954]/70",
    textMono: "text-[#1DB954] dark:text-[#1DB954]",
    bg: "bg-[#1DB954]",
    gradient: "from-[#1DB954] to-[#1DB954]",
    gradientSubtle: "from-[#1DB954]/5 to-[#1DB954]/5 dark:from-[#1DB954]/20 dark:to-[#1DB954]/20",
    bgSubtle: "bg-[#1DB954]/5 dark:bg-[#1DB954]/20",
    border: "border-[#1DB954]/20 dark:border-[#1DB954]/30",
    borderHover: "hover:border-[#1DB954]/30 dark:hover:border-[#1DB954]/40",
    platformName: "Spotify",
  },
  apple: {
    text: "text-slate-900 dark:text-white",
    textDark: "dark:text-slate-300",
    textMono: "text-slate-900 dark:text-white",
    bg: "bg-slate-900 dark:bg-slate-100",
    gradient: "from-slate-800 to-slate-900 dark:from-slate-100 dark:to-white",
    gradientSubtle: "from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/30",
    bgSubtle: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-slate-200 dark:border-slate-700",
    borderHover: "hover:border-slate-300 dark:hover:border-slate-600",
    platformName: "Apple Music",
  },
  youtube: {
    text: "text-[#FF0000]",
    textDark: "dark:text-[#FF0000]/70",
    textMono: "text-[#FF0000] dark:text-[#FF0000]",
    bg: "bg-[#FF0000]",
    gradient: "from-[#FF0000] to-[#FF0000]",
    gradientSubtle: "from-[#FF0000]/5 to-[#FF0000]/5 dark:from-[#FF0000]/20 dark:to-[#FF0000]/20",
    bgSubtle: "bg-[#FF0000]/5 dark:bg-[#FF0000]/20",
    border: "border-[#FF0000]/20 dark:border-[#FF0000]/30",
    borderHover: "hover:border-[#FF0000]/30 dark:hover:border-[#FF0000]/40",
    platformName: "YouTube",
  }
};

const AverageCatalogAge = ({ dollarAgeData, platform = "spotify" }) => {
  const { dollarAge, trackBreakdown } = dollarAgeData;
  const theme = THEME[platform === "itunes" ? "apple" : platform] || THEME.spotify;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <SectionHeader icon={Calendar} title="Average Catalog Age" subtitle="Arithmetic mean of track ages" gradient={theme.gradient} />
          <InfoTooltip content="Average Catalog Age = Sum of the ages of all tracks ÷ Total number of tracks. Unweighted arithmetic mean." />
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${theme.bgSubtle} ${theme.textMono} ${theme.border} border`}>
          {theme.platformName}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Main Number */}
        <div className={`bg-gradient-to-br ${theme.gradientSubtle} border-2 ${theme.border} rounded-2xl p-5 text-center flex flex-col justify-center items-center`}>
          <p className={`text-xs font-bold ${theme.text} ${theme.textDark} uppercase tracking-wide mb-2`}>Average Age</p>
          <p className={`text-5xl font-black ${theme.text} ${theme.textDark} leading-none`}>{dollarAge.toFixed(1)}</p>
          <p className={`text-xs ${theme.text} mt-1`}>years</p>
        </div>

        {/* Formula */}
        <div className="sm:col-span-2 flex flex-col gap-3">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center">
             <p className={`text-[10px] font-bold ${theme.text} uppercase mb-2 tracking-widest`}>Client Formula</p>
             <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
               Sum of the ages of all tracks ÷ Total number of tracks
             </p>
             <p className="text-xs text-slate-400 mt-2">
               Each track is weighted equally, regardless of revenue or streaming performance.
             </p>
          </div>
        </div>
      </div>

      {/* Track Breakdown */}
      {trackBreakdown.length > 0 && (
        <>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Track Ages Overview</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trackBreakdown.map((track, idx) => (
              <div key={idx} className={`bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 ${theme.borderHover} transition-colors flex items-center justify-between gap-3`}>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-xs sm:text-sm ${theme.text} truncate`}>{track.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {track.releaseDate ? `Released ${new Date(track.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}` : "Estimated 2.0 years (Fallback)"}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg text-center border border-slate-200 dark:border-slate-700">
                  <span className={`text-sm font-black ${theme.text}`}>{track.ageInYears.toFixed(1)}y</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AverageCatalogAge;
