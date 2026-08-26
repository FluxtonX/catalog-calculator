// src/components/itunes/iTunesValuationTab.jsx
import React, { useMemo, useState } from "react";
import { useEffect } from "react";
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
import { generateITunesValuationPDF } from "../../utils/itunesValuationPdfGenerator";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import ITunesMetricCard from "./ITunesMetricCard";
import ITunesScenarioCard from "./ITunesScenarioCard";

import {
  APPLE_MUSIC_RATE,
  formatCurrency,
  formatNumber,
  estimateMonthlyStreams,
  formatRange,
} from "./valuationHelpers";

import { Download } from "lucide-react";

const ITunesValuationTab = ({ artistData }) => {
  const { name, image, topTracks, albums, singles, stats, popularity, genres } =
    artistData;
  const [showMethodology, setShowMethodology] = useState(false);

  // ── ADD THESE ──────────────────────────────────────────
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(undefined);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!user) {
      navigate("/auth", { state: { from: location } });
      return;
    }

    const isProEnabled = false;
    if (!isProEnabled) {
      navigate("/pro-plan");
      return;
    }

    try {
      setIsSaving(true);
      const reportData = {
        artist: name,
        date: new Date().toISOString(),
        generatedBy: {
          email: user.email,
          provider: user.app_metadata?.provider || "unknown",
          userId: user.id,
        },
        inputs: { platform: "itunes" },
        calculations: {
          avgPopularity: calculations.avgPopularity,
          monthlyStreams: calculations.monthlyStreams,
          monthlyStreamsRange: {
            min: calculations.monthlyStreamsLow,
            max: calculations.monthlyStreamsHigh,
          },
          monthlyRevenue: calculations.monthlyRevenue,
          monthlyRevenueRange: {
            min: calculations.monthlyRevenueLow,
            max: calculations.monthlyRevenueHigh,
          },
          ltmRevenue: calculations.ltmRevenue,
          ltmRevenueRange: {
            min: calculations.ltmRevenueLow,
            max: calculations.ltmRevenueHigh,
          },
          catalogBonus: calculations.catalogBonus,
          dealScore: calculations.dealScore,
          totalAlbums: calculations.totalAlbums,
          totalSingles: calculations.totalSingles,
        },
        valuations: {
          conservative: calculations.conservative,
          market: calculations.market,
          premium: calculations.premium,
        },
      };
      generateITunesValuationPDF(reportData);
      const { error: saveError } = await supabase
        .from("user_reports")
        .insert([
          {
            user_id: user.id,
            artist_name: name,
            report_type: "itunes_valuation",
            report_data: reportData,
          },
        ])
        .select()
        .single();
      if (saveError) {
        alert("PDF downloaded, but failed to save: " + saveError.message);
        return;
      }
      if (window.confirm("Report saved!\n\nView saved reports?"))
        navigate("/dashboard");
    } catch {
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  // ── END ADD ─────────────────────────────────────────────

  // ── Core calculations ──────────────────────────────────
const calculations = useMemo(() => {
  const totalAlbums  = stats?.totalAlbums ?? albums?.length ?? 0;
  const totalSingles = singles?.length ?? 0;
  const totalTracks  = stats?.totalTopTracks ?? topTracks?.length ?? 0;

  // ── Top 10 tracks with rank-based popularity fallback ─
  const top10 = (topTracks ?? []).slice(0, 10);
const top10Popularities = top10.map((t, i) => {
  const real = t.popularity ?? t.trackPopularity ?? 0;
  if (real > 0) return real;

  // Use catalog size to scale the base score
  // Bigger catalog = higher assumed popularity
  const catalogSize = totalAlbums * 3 + totalSingles + totalTracks;
  const catalogMultiplier = Math.min(catalogSize / 50, 1.2); // scale up to 1.2x (was 1.5)

  // Base rank score scaled by catalog size
  const baseScore = Math.round(45 - (i * 4)); // Starts at 45 (was 85)
  return Math.min(Math.round(baseScore * catalogMultiplier), 100);
});

  const avgTop10Popularity =
    top10Popularities.length > 0
      ? top10Popularities.reduce((a, b) => a + b, 0) / top10Popularities.length
      : popularity ?? 50;

  // ── Streams & revenue from top 10 avg popularity ──────
  const estimatedMonthlyStreams = estimateMonthlyStreams(avgTop10Popularity);
  const top10StreamEstimates = top10Popularities.map((score) =>
    estimateMonthlyStreams(score),
  );
  const variance =
    top10StreamEstimates.length > 1
      ? top10StreamEstimates.reduce((sum, value) => {
          const delta = value - estimatedMonthlyStreams;
          return sum + delta * delta;
        }, 0) / top10StreamEstimates.length
      : 0;
  const stdDev = Math.sqrt(variance);
  const volatilityFactor =
    estimatedMonthlyStreams > 0
      ? Math.min(Math.max(stdDev / estimatedMonthlyStreams, 0.15), 0.45)
      : 0.2;

  const monthlyStreamsLow = Math.max(
    0,
    Math.round(estimatedMonthlyStreams * (1 - volatilityFactor)),
  );
  const monthlyStreamsHigh = Math.round(
    estimatedMonthlyStreams * (1 + volatilityFactor),
  );

  const monthlyRevenue = estimatedMonthlyStreams * APPLE_MUSIC_RATE;
  const monthlyRevenueLow = monthlyStreamsLow * APPLE_MUSIC_RATE;
  const monthlyRevenueHigh = monthlyStreamsHigh * APPLE_MUSIC_RATE;
  const annualRevenue = monthlyRevenue * 12;
  const annualRevenueLow = monthlyRevenueLow * 12;
  const annualRevenueHigh = monthlyRevenueHigh * 12;

  // ── Catalog bonus ──────────────────────────────────────
 // Albums matter more (deeper catalog = more passive income)
// Singles matter less (shorter shelf life)
const catalogBonus = Math.min(
  totalAlbums * 0.08 +    // each album = 8% (max ~40% for 5 albums)
  totalSingles * 0.005,   // each single = 0.5% (need 20 singles to add 10%)
  0.5
);
  const ltmRevenue = annualRevenue * (1 + catalogBonus);
  const ltmRevenueLow = annualRevenueLow * (1 + catalogBonus);
  const ltmRevenueHigh = annualRevenueHigh * (1 + catalogBonus);

  // ── Valuations based on top 10 tracks ─────────────────
  const conservative = ltmRevenue * 6;
  const market       = ltmRevenue * 8;
  const premium      = ltmRevenue * 10;

  // ── Deal score ─────────────────────────────────────────
  const dealScore = Math.round(
    Math.min(
      avgTop10Popularity * 0.5 +
        totalAlbums * 2 +
        totalTracks * 0.5 +
        (estimatedMonthlyStreams > 10_000_000 ? 20
          : estimatedMonthlyStreams > 1_000_000 ? 10 : 0),
      100,
    ),
  );

  return {
    totalAlbums,
    totalSingles,
    totalTracks,
    avgPopularity: avgTop10Popularity,
    avgTop10Popularity,
    top10Popularities,       // ← per-track scores for the table
    tracksUsed: top10.length,
    monthlyStreams: estimatedMonthlyStreams,
    estimatedMonthlyStreams,
    monthlyStreamsLow,
    monthlyStreamsHigh,
    volatilityFactor,
    monthlyRevenue,
    monthlyRevenueLow,
    monthlyRevenueHigh,
    ltmRevenue,
    ltmRevenueLow,
    ltmRevenueHigh,
    conservative,
    market,
    premium,
    dealScore,
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
      <h2 className="text-xl sm:text-3xl font-black text-white truncate mb-2">
        {name}
      </h2>
      {genres?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {genres.slice(0, 3).map((g, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 bg-white/15 rounded-full text-white text-[10px] font-bold capitalize"
            >
              {g}
            </span>
          ))}
        </div>
      )}
    </div>

    {/* Deal score with tooltip */}
    <div className="relative group flex-shrink-0">
      <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20 cursor-default">
        <div className="flex items-center justify-center gap-1 mb-1">
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-wide">
            Deal Score
          </p>
          <Info size={11} className="text-white/50" />
        </div>
        <p className="text-3xl sm:text-4xl font-black text-white">
          {calculations.dealScore}
        </p>
        <p className="text-white/80 text-[10px] font-bold">
          {dealScoreLabel}
        </p>
      </div>
      {/* Tooltip */}
   <div className="absolute z-50 top-0 right-full mr-2 w-64 p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl
  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <p className="font-bold mb-1 text-slate-900 dark:text-white">About Deal Score</p>
        <p className="text-slate-600 dark:text-slate-400">
          Score from 0–100 combining avg track popularity (50%), catalog album depth (30%), and stream volume (20%).
          <br /><br />
          <strong className="text-slate-800 dark:text-slate-200">70+</strong> = Strong Deal &nbsp;·&nbsp;
          <strong className="text-slate-800 dark:text-slate-200">40–69</strong> = Moderate &nbsp;·&nbsp;
          <strong className="text-slate-800 dark:text-slate-200">&lt;40</strong> = Developing
        </p>
      </div>
    </div>
  </div>

  {/* Key metrics row inside banner */}
<div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 mt-5 sm:mt-6 overflow-visible">
    {[
      {
        label: "Monthly Streams (est.)",
        value: formatRange(
          calculations.monthlyStreamsLow,
          calculations.monthlyStreamsHigh,
          formatNumber,
        ),
        note: `Range modeled from top ${calculations.tracksUsed} track volatility`,
        tooltip: {
          title: "Monthly Streams (Est.)",
          body: `Estimated from the average popularity of the top ${calculations.tracksUsed} tracks using (popularity/100)^2.5 × 10M, then expanded into a low/high band using observed track-to-track volatility.`,
        },
      },
      {
        label: "Monthly Revenue (est.)",
        value: formatRange(
          calculations.monthlyRevenueLow,
          calculations.monthlyRevenueHigh,
          formatCurrency,
        ),
        note: "$0.0080 per stream × stream range",
        tooltip: {
          title: "Monthly Revenue (Est.)",
          body: "Revenue is shown as a range: low/high monthly streams × $0.008 Apple Music average payout rate.",
        },
      },
      {
        label: "LTM Revenue (est.)",
        value: formatRange(
          calculations.ltmRevenueLow,
          calculations.ltmRevenueHigh,
          formatCurrency,
        ),
        note: `Incl. +${calculations.catalogBonus.toFixed(0)}% catalog bonus`,
        tooltip: {
          title: "LTM Revenue (Est.)",
          body: `LTM revenue is shown as a range: monthly revenue range × 12, then adjusted upward by a catalog depth bonus of +${calculations.catalogBonus.toFixed(0)}% based on total albums and singles (max +50%).`,
        },
      },
    ].map(({ label, value, note, tooltip }) => (
      <div key={label} className="relative group">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/15 text-center cursor-default">
          <div className="flex items-center justify-center gap-1 mb-1">
            <p className="text-white/70 text-[9px] sm:text-xs font-bold uppercase tracking-wide">
              {label}
            </p>
            <Info size={10} className="text-white/40 flex-shrink-0" />
          </div>
          <p className="text-white font-black text-sm sm:text-xl">
            {value}
          </p>
          {note && (
            <p className="text-white/50 text-[9px] mt-1">{note}</p>
          )}
        </div>

        {/* Tooltip */}
   <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl
  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <p className="font-bold mb-1 text-slate-900 dark:text-white">
            {tooltip.title}
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {tooltip.body}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>



      {/* ── Detailed metrics ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="relative group">
  <ITunesMetricCard
    icon={Music}
    label="Avg Track Popularity"
    value={`${Math.round(calculations.avgTop10Popularity)}/100`}
    sub={`Top ${calculations.tracksUsed} tracks avg`}
    borderColor="border-pink-200 dark:border-pink-800/40"
    iconBg="bg-pink-500/15"
    iconColor="text-pink-600 dark:text-pink-400"
    valueColor="text-pink-600 dark:text-pink-400"
  />
  {/* hover tooltip */}
  <div className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-slate-800 cursor-default">
    <Info size={14} className="text-slate-500" />
  </div>
  <div className="absolute z-20 top-10 right-0 w-64 p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl
    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
    <p className="font-bold mb-1 text-slate-900 dark:text-white">About Avg Track Popularity</p>
    <p className="text-slate-600 dark:text-slate-400">
      Average popularity score (0–100) across the artist's top{" "}
      {calculations.tracksUsed} tracks on Apple Music. Higher score =
      more streams = higher estimated revenue.
    </p>
  </div>
</div>
        <ITunesMetricCard
          icon={Globe}
          label="Payout Rate"
          value="$0.0080"
          sub="per stream"
          borderColor="border-rose-200 dark:border-rose-800/40"
          iconBg="bg-rose-500/15"
          iconColor="text-rose-600 dark:text-rose-400"
          valueColor="text-rose-600 dark:text-rose-400"
        />
        <ITunesMetricCard
          icon={Disc3}
          label="Catalog Depth"
          value={`${calculations.totalAlbums}A / ${calculations.totalSingles}S`}
          sub="Albums / Singles"
          borderColor="border-red-200 dark:border-red-800/40"
          iconBg="bg-red-500/15"
          iconColor="text-red-600 dark:text-red-400"
          valueColor="text-red-600 dark:text-red-400"
        />
        <ITunesMetricCard
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

{/* ── Top 10 Tracks Breakdown ─────────────────────────── */}
{topTracks?.length > 0 && (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
    <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
      <div className="p-2.5 bg-pink-500/15 rounded-xl">
        <Music size={18} className="text-pink-600 dark:text-pink-400" />
      </div>
      <div>
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
          Top {calculations.tracksUsed} Tracks — Valuation Basis
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Rank-based popularity score drives stream & revenue estimate
        </p>
      </div>
    </div>

    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {(topTracks ?? []).slice(0, 10).map((track, i) => {
        const real = track.popularity ?? track.trackPopularity ?? 0;
        const pop  = real > 0 ? real : Math.round(45 - (i * 4));
        const streams = estimateMonthlyStreams(pop);
        const revenue = streams * APPLE_MUSIC_RATE * 12;
const trackName =
  track.trackName ??
  track.name ??
  track.title ??
  track.trackCensoredName ??
  track.collectionName ??
  "Unknown Track";

const rawImage =
  track.artworkUrl100 ??
  track.artworkUrl60 ??
  track.image ??
  track.thumbnail ??
  track.artwork ??
  null;

// iTunes returns 100x100 — upgrade to 300x300 for better quality
const trackImage = rawImage
  ? rawImage.replace("100x100", "300x300").replace("60x60", "300x300")
  : null;
        const barColor =
          pop >= 70 ? "bg-emerald-500" :
          pop >= 40 ? "bg-yellow-500" :
                      "bg-pink-400";

        return (
          <div
            key={i}
            className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {/* Rank */}
            <span className="text-xs font-black text-slate-400 w-5 flex-shrink-0 text-center">
              {i + 1}
            </span>

            {/* Track image */}
            {trackImage ? (
              <img
                src={trackImage}
                alt={trackName}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0">
                <Music size={14} className="text-white" />
              </div>
            )}

            {/* Track name + popularity bar */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {trackName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${pop}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {pop}/100
                  {(track.popularity ?? track.trackPopularity ?? 0) === 0 && (
                    <span className="text-slate-400 dark:text-slate-500 ml-1">(est.)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Est. streams */}
            <div className="hidden sm:block text-right flex-shrink-0 w-20">
              <p className="text-[10px] text-slate-400 font-medium">Streams/mo</p>
              <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                {formatNumber(streams)}
              </p>
            </div>

            {/* Est. annual revenue */}
            <div className="text-right flex-shrink-0 w-20">
              <p className="text-[10px] text-slate-400 font-medium">Annual Rev.</p>
              <p className="text-xs font-black text-pink-600 dark:text-pink-400">
                {formatCurrency(revenue)}
              </p>
            </div>
          </div>
        );
      })}
    </div>

    {/* Footer summary */}
    <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
        Avg Popularity:{" "}
        <span className="text-slate-900 dark:text-white">
          {Math.round(calculations.avgTop10Popularity)}/100
        </span>
      </span>
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
        Total Est. Annual:{" "}
        <span className="text-pink-600 dark:text-pink-400">
          {formatCurrency(
            (topTracks ?? []).slice(0, 10).reduce((sum, t, i) => {
              const real = t.popularity ?? t.trackPopularity ?? 0;
              const pop  = real > 0 ? real : Math.round(45 - (i * 4));
              return sum + estimateMonthlyStreams(pop) * APPLE_MUSIC_RATE * 12;
            }, 0)
          )}
        </span>
      </span>
    </div>
  </div>
)}
      

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
          <ITunesScenarioCard
            label="Conservative"
            multiple={6}
            value={calculations.conservative}
            color="from-blue-400 to-blue-600"
            icon={TrendingUp}
            isHighlighted={false}
          />
          <ITunesScenarioCard
            label="Market"
            multiple={8}
            value={calculations.market}
            color="from-pink-400 to-rose-600"
            gradient="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500"
            icon={DollarSign}
            isHighlighted={true}
          />
          <ITunesScenarioCard
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
            {
              label: "Apple Music (est.)",
              rate: APPLE_MUSIC_RATE,
              color: "bg-gradient-to-r from-pink-500 to-rose-500",
              pct: 100,
            },
            {
             label: "Spotify (avg.)",
  rate: 0.004,
  pct: Math.round((0.004 / APPLE_MUSIC_RATE) * 100), // dynamic — always correct
  color: "bg-gradient-to-r from-emerald-500 to-green-500",
            },
          ].map(({ label, rate, color, pct }) => (
            <div key={label}>
              <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>{label}</span>
                <span className="font-black text-slate-900 dark:text-white">
                  ${rate.toFixed(4)}/stream
                </span>
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
          "Apple Music pays ~$0.008/stream" vs Spotify's average
          $0.003–$0.005/stream (2024 industry rates). Actual payouts vary by
          region, subscription tier, and label agreement.
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
          {showMethodology ? (
            <ChevronUp size={18} className="text-slate-400" />
          ) : (
            <ChevronDown size={18} className="text-slate-400" />
          )}
        </button>

        {showMethodology && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5">
            <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
              <li>
                Monthly stream estimates are derived from Apple Music popularity
                scores (0–100) using an exponential model where 100 = ~6M
                streams/month, 50 = ~1.1M streams/month.
              </li>
              <li>
                Apple Music payout rate used:{" "}
                <strong className="text-slate-900 dark:text-white">
                  $0.0080 per stream
                </strong>{" "}
                (industry average as of 2024).
              </li>
              <li>
                LTM (Last Twelve Months) Revenue is shown as a low/high range:
                Monthly Streams range × Rate × 12, then adjusted for catalog
                depth.
              </li>
              <li>
                Catalog bonus adds up to +50% based on number of albums and
                singles in the artist's discography.
              </li>
              <li>
                Valuations use revenue multiples: Conservative (6×), Market
                (8×), Premium (10×).
              </li>
              <li>
                Deal Score (0–100) combines popularity, catalog depth, and
                stream volume estimates.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">
                  Disclaimer:
                </strong>{" "}
                These are estimates only. Actual royalties vary by territory,
                subscription tier, and label agreements.
              </li>
            </ul>
          </div>
        )}
      </div>
      {/* ── Save / Download PDF ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xl">
        <div>
          <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            Download Apple Music Valuation Report
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Save a PDF copy of this full analysis
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download size={16} />
              Download PDF Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ITunesValuationTab;