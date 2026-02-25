// src/components/itunes/iTunesValuationTab.jsx
import React, { useMemo, useState } from "react";
import {
  DollarSign,
  Music,
  TrendingUp,
  BarChart3,
  Info,
  Disc3,
  Star,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ── Apple Music payout rate (avg $0.01/stream — ~2.5x Spotify) ───
const APPLE_MUSIC_RATE = 0.01;

// ── Helpers ───────────────────────────────────────────────────────
const formatCurrency = (n) => {
  if (!n || isNaN(n)) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};

const formatNumber = (n) => {
  if (!n || isNaN(n)) return "0";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
};

// Estimate monthly streams from popularity score (0-100)
// Apple Music popularity 100 ≈ ~100M streams/month, scaled down
const estimateMonthlyStreams = (popularityScore) => {
  if (!popularityScore) return 0;
  // Exponential scale: 100→100M, 80→20M, 60→5M, 40→1M, 20→200K
  return Math.round(Math.pow(popularityScore / 100, 2.5) * 100_000_000);
};

// Metric card component
const MetricCard = ({ icon: Icon, label, value, sub, borderColor, iconBg, iconColor, valueColor }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 ${borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}>
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={`p-2.5 ${iconBg} rounded-xl`}>
        <Icon size={18} className={`sm:w-5 sm:h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className={`text-base sm:text-xl lg:text-2xl font-black ${valueColor}`}>{value}</p>
        {sub && (
          <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            {sub}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Valuation scenario card
const ScenarioCard = ({ label, multiple, value, color, gradient, icon: Icon, isHighlighted }) => (
  <div className={`relative rounded-2xl p-4 sm:p-6 border-2 text-center transition-all duration-300 ${
    isHighlighted
      ? `${gradient} border-transparent shadow-2xl scale-105`
      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-1"
  }`}>
    {isHighlighted && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[10px] font-black text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-700 shadow-md">
        MARKET RATE
      </div>
    )}
    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${
      isHighlighted ? "bg-white/20" : `bg-gradient-to-br ${color}`
    }`}>
      <Icon size={20} className={`sm:w-6 sm:h-6 ${isHighlighted ? "text-white" : "text-white"}`} />
    </div>
    <p className={`text-sm sm:text-base font-black mb-1 ${isHighlighted ? "text-white" : "text-slate-900 dark:text-white"}`}>
      {label}
    </p>
    <p className={`text-[10px] sm:text-xs mb-3 ${isHighlighted ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
      {multiple}x Revenue Multiple
    </p>
    <p className={`text-xl sm:text-3xl font-black ${isHighlighted ? "text-white" : color.includes("pink") ? "text-pink-600 dark:text-pink-400" : color.includes("blue") ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400"}`}>
      {formatCurrency(value)}
    </p>
  </div>
);

const ITunesValuationTab = ({ artistData }) => {
  const { name, image, topTracks, albums, singles, stats, popularity, genres } = artistData;
  const [showMethodology, setShowMethodology] = useState(false);

  // ── Core calculations ──────────────────────────────────
  const calculations = useMemo(() => {
    const avgPopularity = stats?.averageTrackPopularity || popularity || 50;
    const monthlyStreams = estimateMonthlyStreams(avgPopularity);
    const monthlyRevenue = monthlyStreams * APPLE_MUSIC_RATE;
    const ltmRevenue = monthlyRevenue * 12;

    const totalAlbums = stats?.totalAlbums || albums?.length || 0;
    const totalSingles = singles?.length || 0;
    const totalTracks = stats?.totalTopTracks || topTracks?.length || 0;

    // Catalog depth bonus (more releases = more passive income)
    const catalogBonus = Math.min(totalAlbums * 0.05 + totalSingles * 0.01, 0.5);
    const adjustedLtm = ltmRevenue * (1 + catalogBonus);

    const conservative = adjustedLtm * 6;
    const market = adjustedLtm * 8;
    const premium = adjustedLtm * 10;

    // Deal score: 0-100 based on catalog depth + popularity
    const dealScore = Math.round(
      Math.min(
        avgPopularity * 0.5 +
        totalAlbums * 2 +
        totalTracks * 0.5 +
        (monthlyStreams > 10_000_000 ? 20 : monthlyStreams > 1_000_000 ? 10 : 0),
        100
      )
    );

    return {
      avgPopularity,
      monthlyStreams,
      monthlyRevenue,
      ltmRevenue: adjustedLtm,
      conservative,
      market,
      premium,
      dealScore,
      totalAlbums,
      totalSingles,
      totalTracks,
      catalogBonus: catalogBonus * 100,
    };
  }, [stats, popularity, albums, singles, topTracks]);

  const dealScoreColor =
    calculations.dealScore >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : calculations.dealScore >= 40
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-slate-500 dark:text-slate-400";

  const dealScoreLabel =
    calculations.dealScore >= 70
      ? "Strong Deal"
      : calculations.dealScore >= 40
      ? "Moderate Interest"
      : "Developing Artist";

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* ── Header banner ────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 p-5 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {image && (
            <img
              src={image}
              alt={name}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover shadow-xl ring-2 ring-white/30 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
                Apple Music Valuation
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white truncate mb-2">{name}</h2>
            {genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.slice(0, 3).map((g, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-white/15 rounded-full text-white text-[10px] font-bold capitalize">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Deal score */}
          <div className="flex-shrink-0 text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20">
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wide mb-1">Deal Score</p>
            <p className="text-3xl sm:text-4xl font-black text-white">{calculations.dealScore}</p>
            <p className="text-white/80 text-[10px] font-bold">{dealScoreLabel}</p>
          </div>
        </div>

        {/* Key metrics row inside banner */}
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 mt-5 sm:mt-6">
          {[
            { label: "Monthly Streams (est.)", value: formatNumber(calculations.monthlyStreams) },
            { label: "Monthly Revenue (est.)", value: formatCurrency(calculations.monthlyRevenue) },
            { label: "LTM Revenue (est.)", value: formatCurrency(calculations.ltmRevenue) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/15 text-center">
              <p className="text-white/70 text-[9px] sm:text-xs font-bold uppercase tracking-wide mb-1">{label}</p>
              <p className="text-white font-black text-sm sm:text-xl">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detailed metrics ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          icon={Music}
          label="Avg Popularity"
          value={`${Math.round(calculations.avgPopularity)}/100`}
          sub="Apple Music score"
          borderColor="border-pink-200 dark:border-pink-800/40"
          iconBg="bg-pink-500/15"
          iconColor="text-pink-600 dark:text-pink-400"
          valueColor="text-pink-600 dark:text-pink-400"
        />
        <MetricCard
          icon={Globe}
          label="Payout Rate"
          value="$0.0100"
          sub="per stream"
          borderColor="border-rose-200 dark:border-rose-800/40"
          iconBg="bg-rose-500/15"
          iconColor="text-rose-600 dark:text-rose-400"
          valueColor="text-rose-600 dark:text-rose-400"
        />
        <MetricCard
          icon={Disc3}
          label="Catalog Depth"
          value={`${calculations.totalAlbums}A / ${calculations.totalSingles}S`}
          sub="Albums / Singles"
          borderColor="border-red-200 dark:border-red-800/40"
          iconBg="bg-red-500/15"
          iconColor="text-red-600 dark:text-red-400"
          valueColor="text-red-600 dark:text-red-400"
        />
        <MetricCard
          icon={Star}
          label="Catalog Bonus"
          value={`+${calculations.catalogBonus.toFixed(0)}%`}
          sub="LTM adjustment"
          borderColor="border-purple-200 dark:border-purple-800/40"
          iconBg="bg-purple-500/15"
          iconColor="text-purple-600 dark:text-purple-400"
          valueColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* ── Valuation scenarios ───────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="p-2.5 bg-pink-500/15 rounded-xl">
            <BarChart3 size={20} className="text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Valuation Scenarios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Based on Apple Music payout rates & catalog analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <ScenarioCard
            label="Conservative"
            multiple={6}
            value={calculations.conservative}
            color="from-blue-400 to-blue-600"
            icon={TrendingUp}
            isHighlighted={false}
          />
          <ScenarioCard
            label="Market"
            multiple={8}
            value={calculations.market}
            color="from-pink-400 to-rose-600"
            gradient="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500"
            icon={DollarSign}
            isHighlighted={true}
          />
          <ScenarioCard
            label="Premium"
            multiple={10}
            value={calculations.premium}
            color="from-purple-400 to-purple-600"
            icon={Star}
            isHighlighted={false}
          />
        </div>
      </div>

      {/* ── Revenue breakdown bar ────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xl">
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-4">
          Revenue Comparison vs. Spotify
        </h3>
        <div className="space-y-3">
          {[
            { label: "Apple Music (est.)", rate: APPLE_MUSIC_RATE, color: "bg-gradient-to-r from-pink-500 to-rose-500", pct: 100 },
            { label: "Spotify (avg.)", rate: 0.004, color: "bg-gradient-to-r from-emerald-500 to-green-500", pct: 40 },
          ].map(({ label, rate, color, pct }) => (
            <div key={label}>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>{label}</span>
                <span className="font-black text-slate-900 dark:text-white">${rate.toFixed(4)}/stream</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-3">
          Apple Music pays ~2.5x more per stream than Spotify, making catalog valuation significantly higher.
        </p>
      </div>

      {/* ── Methodology toggle ───────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-50 to-pink-50/30 dark:from-slate-900 dark:to-pink-950/20 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <button
          onClick={() => setShowMethodology((v) => !v)}
          className="w-full flex items-center justify-between gap-3 p-4 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/15 rounded-xl">
              <Info size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Methodology & Notes
            </span>
          </div>
          {showMethodology
            ? <ChevronUp size={18} className="text-slate-400" />
            : <ChevronDown size={18} className="text-slate-400" />}
        </button>

        {showMethodology && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5">
            <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
              <li>Monthly stream estimates are derived from Apple Music popularity scores (0–100) using an exponential model where 100 = ~100M streams/month.</li>
              <li>Apple Music payout rate used: <strong className="text-slate-900 dark:text-white">$0.01 per stream</strong> (industry average as of 2024).</li>
              <li>LTM (Last Twelve Months) Revenue = Monthly Streams × Rate × 12, adjusted for catalog depth.</li>
              <li>Catalog bonus adds up to +50% based on number of albums and singles in the artist's discography.</li>
              <li>Valuations use revenue multiples: Conservative (6×), Market (8×), Premium (10×).</li>
              <li>Deal Score (0–100) combines popularity, catalog depth, and stream volume estimates.</li>
              <li><strong className="text-slate-900 dark:text-white">Disclaimer:</strong> These are estimates only. Actual royalties vary by territory, subscription tier, and label agreements.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ITunesValuationTab;