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
  LogIn,
} from "lucide-react";
import { generateITunesValuationPDF } from "../../utils/itunesValuationPdfGenerator";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import ITunesMetricCard from "./ITunesMetricCard";
import PlatformContributionBanner from "../valuation/PlatformContributionBanner";
import AverageCatalogAge from "../valuation/sections/AverageCatalogAge";
import ValuationEstimates from "../valuation/sections/ValuationEstimates";
import { formatCurrency, formatNumber } from "../valuation/hooks/useValuationLogic";
import { useArtistStore } from "../../store/artistStore";

import {
  APPLE_MUSIC_RATE,
  estimateMonthlyStreams,
  formatRange,
  calculateCfaPhase1,
  getCombinedCfaValuations
} from "../../core/calculations";

import { Download } from "lucide-react";

const ITunesValuationTab = ({ artistData }) => {
  const { name, image, topTracks, albums, singles, stats, popularity, genres } =
    artistData;
  const [showMethodology, setShowMethodology] = useState(false);
  const { selectedArtists } = useArtistStore();

  // ── ADD THESE ──────────────────────────────────────────
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(undefined);
  // eslint-disable-next-line no-unused-vars
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
  // eslint-disable-next-line no-unused-vars
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

  const cfaResult = useMemo(() => {
    const combined = getCombinedCfaValuations(selectedArtists);
    if (combined && combined.breakdown) {
      const p = artistData.platform || "itunes";
      if (combined.breakdown[p]) return combined.breakdown[p];
      if (combined.breakdown[p.toLowerCase()]) return combined.breakdown[p.toLowerCase()];
      if (combined.breakdown["itunes"]) return combined.breakdown["itunes"];
      if (combined.breakdown["apple"]) return combined.breakdown["apple"];
      // If we got here, none of the keys worked.
      console.error("CFA Breakdown keys available:", Object.keys(combined.breakdown), "Looking for:", p);
    }
    return calculateCfaPhase1({ ...artistData, popularity: calculations.avgTop10Popularity }, "itunes");
  }, [selectedArtists, artistData, calculations.avgTop10Popularity]);

  const dollarAgeData = {
    dollarAge: cfaResult.averageDollarAge,
    trackBreakdown: cfaResult.trackDetails.map(t => ({
      name: t.title,
      ageInYears: t.ageInYears,
      releaseDate: t.releaseDate || (t.releaseYear ? `${t.releaseYear}-01-01` : "")
    }))
  };

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* ── Header banner ────────────────────────────────── */}
  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-zinc-800 to-slate-900 p-5 sm:p-8 shadow-2xl border border-slate-800">
  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
        label: "Catalog Value (est.)",
        value: formatCurrency(cfaResult.midEstimate || 0),
        note: `Based on cross-platform inference`,
        tooltip: {
          title: "Catalog Value (Est.)",
          body: `Estimated value using the CFA Phase 1 formula, mathematically inferred from proxy platform data if direct streaming metrics are unavailable.`,
        },
      },
      {
        label: "Monthly Revenue (est.)",
        value: formatCurrency((cfaResult.totalAnnualRevenue || 0) / 12),
        note: "Derived from LTM revenue",
        tooltip: {
          title: "Monthly Revenue (Est.)",
          body: "Average monthly revenue calculated from the inferred annual run-rate.",
        },
      },
      {
        label: "LTM Revenue (est.)",
        value: formatCurrency(cfaResult.totalAnnualRevenue || 0),
        note: `Annual revenue run-rate`,
        tooltip: {
          title: "LTM Revenue (Est.)",
          body: `Last twelve months (LTM) revenue mathematically inferred based on proxy platform data to estimate Apple Music performance.`,
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

      {/* Login to Dashboard */}
      <div className="flex justify-center my-8">
        <a
          href="https://artists.apple.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-base font-bold rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
        >
          <LogIn size={20} />
          Login to your iTunes dashboard
        </a>
      </div>

      <PlatformContributionBanner platform="itunes" />

      {/* ── Detailed metrics ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="relative group">
  <ITunesMetricCard
    icon={Music}
    label="Avg Track Popularity"
    value={`${Math.round(calculations.avgTop10Popularity)}/100`}
    sub={`Top ${calculations.tracksUsed} tracks avg`}
    borderColor="border-slate-200 dark:border-slate-800"
    iconBg="bg-slate-100 dark:bg-slate-800"
    iconColor="text-slate-900 dark:text-white"
    valueColor="text-slate-900 dark:text-white"
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
          borderColor="border-slate-200 dark:border-slate-800"
          iconBg="bg-slate-100 dark:bg-slate-800"
          iconColor="text-slate-900 dark:text-white"
          valueColor="text-slate-900 dark:text-white"
        />
        <ITunesMetricCard
          icon={Disc3}
          label="Catalog Depth"
          value={`${calculations.totalAlbums}A / ${calculations.totalSingles}S`}
          sub="Albums / Singles"
          borderColor="border-slate-200 dark:border-slate-800"
          iconBg="bg-slate-100 dark:bg-slate-800"
          iconColor="text-slate-900 dark:text-white"
          valueColor="text-slate-900 dark:text-white"
        />
        <ITunesMetricCard
          icon={Star}
          label="Catalog Bonus"
          value={`+${calculations.catalogBonus.toFixed(0)}%`}
          sub="LTM adjustment"
          borderColor="border-slate-200 dark:border-slate-800"
          iconBg="bg-slate-100 dark:bg-slate-800"
          iconColor="text-slate-900 dark:text-white"
          valueColor="text-slate-900 dark:text-white"
        />
      </div>


      

      {/* ── CFA Estimated Catalog Valuation ───────────────────────────── */}
      <ValuationEstimates
        lowEstimate={cfaResult.lowEstimate}
        midEstimate={cfaResult.midEstimate}
        highEstimate={cfaResult.highEstimate}
        acceleratorValue={cfaResult.acceleratorValue}
        formatCurrency={formatCurrency}
        platformName="Apple Music"
      />

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
              color: "bg-gradient-to-r from-slate-800 to-slate-900",
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

      </div>

      {/* ── Average Catalog Age ──────────────────────────── */}
      <AverageCatalogAge
        platform="apple"
        dollarAgeData={dollarAgeData}
      />

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
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap border border-slate-700"
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
