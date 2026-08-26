import React, { useState, useEffect, useMemo } from "react";
import { calculateMonthlyStreamsAndRevenue } from "../../utils/calculations";
import { generateValuationPDF } from "../../utils/pdfGenerator";
import { AlertTriangle, LogIn } from "lucide-react";
import { useArtistStore } from "../../store/artistStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import { calculateDollarAge } from "../../utils/calculations";

// Logic helpers
import {
  calculateGeoWeightedRate,
  getLifetimeStreams,
  getAverageReleaseDate,
  getDecayFactor,
  getMonthsBetween,
  formatNumber,
  formatToMillions,
  formatCurrency,
} from "./hooks/useValuationLogic";

// UI primitives
import AlertBanner from "./ui/AlertBanner";

// Sections
import ArtistHeader from "./sections/ArtistHeader";
import StreamDataInput from "./sections/StreamDataInput";
import PayoutRateCard from "./sections/PayoutRateCard";
import RevenueCalculation from "./sections/RevenueCalculation";
import DollarAgeAnalysis from "./sections/DollarAgeAnalysis";
import ValuationEstimates from "./sections/ValuationEstimates";
import MethodologyNote from "./sections/MethodologyNote";
import SaveButton from "./sections/SaveButton";

import { useLocation } from "react-router-dom";

const ValuationTab = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedArtist: artistData } = useArtistStore();
  const [user, setUser] = useState(undefined);
const [authLoading, setAuthLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const initialLifetimeStreams = getLifetimeStreams(artistData);
  const [lifetimeStreamsInput, setLifetimeStreamsInput] = useState(
    initialLifetimeStreams.toString(),
  );
  const [releaseDate, setReleaseDate] = useState(() =>
    getAverageReleaseDate(artistData),
  );

  useEffect(() => {
    if (artistData) {
      setLifetimeStreamsInput(getLifetimeStreams(artistData).toString());
      setReleaseDate(getAverageReleaseDate(artistData));
    }
  }, [artistData]);

// Replace the auth useEffect with this:
useEffect(() => {
  // getSession() reads from local cache — instant, no network call
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setAuthLoading(false);
  });

  // Also listen for auth state changes (login/logout)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
    setAuthLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
  useEffect(() => {
    if (!artistData) navigate("/valuation");
  }, [artistData, navigate]);
  if (!artistData) return null;

  // ── All original calculations — UNCHANGED ────────────────
  const lifetimeStreams =
    parseFloat(lifetimeStreamsInput.replace(/,/g, "")) || 0;
  const currentDate = new Date();
  const monthsLive = getMonthsBetween(releaseDate, currentDate);
  const geoRateData = calculateGeoWeightedRate(artistData.topCities);
  const effectiveSpotifyRate = geoRateData.rate;
  const geoMethodUsed = geoRateData.method;



const {
  monthlyStreamsEst,
  monthlyRevenue,
  methodUsed,
  featuredTrackCount,
  totalTrackCount,
} = calculateMonthlyStreamsAndRevenue(
  artistData,
  lifetimeStreams,
  monthsLive,
  effectiveSpotifyRate,
);

const monthlySpotifyRevenue = monthlyRevenue;
const ltmSpotifyRevenue = monthlyRevenue * 12;

// ✅ Now ltmSpotifyRevenue is defined — pass it in so Dollar Age LTM matches
const dollarAgeData = useMemo(
  () => calculateDollarAge(artistData, effectiveSpotifyRate, currentDate, ltmSpotifyRevenue),
  [artistData, effectiveSpotifyRate, ltmSpotifyRevenue],
);
  const conservativeValuation = ltmSpotifyRevenue * 6;
  const marketValuation = ltmSpotifyRevenue * 8;
  const premiumValuation = ltmSpotifyRevenue * 10;
  const hasValidData = lifetimeStreams > 0;

  const methodLabel =
    {
      RECENT_30D: "Recent 30-day streams",
      RECENT_28D_NORMALIZED: "Recent 28-day streams (normalized)",
      TOP_TRACKS_FEATURED_ADJ: `Top Tracks + Featured Adjustment (${totalTrackCount} tracks)`,
      LIFETIME_RUNRATE_ADJ: `Lifetime with Age Decay (${(getDecayFactor(monthsLive) * 100).toFixed(0)}% factor, ${monthsLive}mo)`,
    }[methodUsed] || methodUsed;

  // ── handleSave — UNCHANGED ────────────────────────────────
  const handleSave = async () => {
  if (!user) {
    navigate("/auth", { state: { from: location } });
    return;
  }

  // TODO: Remove this when Pro is implemented
  const isProEnabled = false;
  if (!isProEnabled) {
    navigate("/pro-plan");
    return;
  }

    try {
      setIsSaving(true);
      const reportData = {
        artist: artistData.name,
        date: new Date().toISOString(),
        generatedBy: {
          email: user.email,
          provider: user.app_metadata?.provider || "unknown",
          userId: user.id,
        },
        inputs: { lifetimeStreams, releaseDate },
        calculations: {
          monthsLive,
          monthlyStreamsEst,
          methodUsed,
          decayFactor:
            methodUsed === "LIFETIME_RUNRATE_ADJ"
              ? getDecayFactor(monthsLive)
              : null,
          effectiveSpotifyRate,
          geoMethodUsed,
          geoBreakdown: geoRateData.breakdown,
          monthlySpotifyRevenue,
          ltmSpotifyRevenue,
          featuredTrackCount: featuredTrackCount || 0,
          totalTrackCount: totalTrackCount || 0,
          dollarAge: dollarAgeData.dollarAge,
          trackBreakdown: dollarAgeData.trackBreakdown,
          totalWeightedAge: dollarAgeData.totalWeightedAge,
          totalLTMEarnings: dollarAgeData.totalLTMEarnings,
        },
        valuations: {
          conservative: conservativeValuation,
          market: marketValuation,
          premium: premiumValuation,
        },
      };
      generateValuationPDF(reportData);
      const { error: saveError } = await supabase
        .from("user_reports")
        .insert([
          {
            user_id: user.id,
            artist_name: artistData.name,
            report_type: "spotify_valuation",
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

  // ── Shared formatter props ────────────────────────────────
  const fmt = { formatNumber, formatToMillions, formatCurrency };

  return (
  <div className="py-2">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        {/* Alert Banners */}
        {!hasValidData && (
          <AlertBanner
            icon={AlertTriangle}
            title="Insufficient Data"
            message="No lifetime stream data available. Enter valid stream counts to calculate valuation."
            accent={{
              border: "border-red-200 dark:border-red-500/40",
              bg: "bg-red-50 dark:bg-red-900/20",
              iconBg: "bg-red-100 dark:bg-red-800/40",
              icon: "text-red-600 dark:text-red-400",
              title: "text-red-800 dark:text-red-300",
              text: "text-red-700 dark:text-red-400",
            }}
          />
        )}

        {/*  i want that alert color change to */}
{!authLoading && !user && (
  <AlertBanner
    icon={LogIn}
    title="Sign in to Save Reports"
    message="You can view and save reports, but sign in to download PDFs and save reports."
    accent={{
      border: "border-green-200 dark:border-green-500/40",
      bg: "bg-green-50 dark:bg-green-900/20",
      iconBg: "bg-green-100 dark:bg-green-800/40",
      icon: "text-green-600 dark:text-green-400",
      title: "text-green-800 dark:text-green-300",
      text: "text-green-700 dark:text-green-400",
    }}
    action={
      <button
        onClick={() => navigate("/auth", { state: { from: location } })}
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-md"
      >
        <LogIn size={14} />
        Sign In Now
      </button>
      
    }
  />
)}

        {/* Artist Header — 4 metric cards */}
        <ArtistHeader
          artistName={artistData.name}
          marketValuation={marketValuation}
          monthlyStreamsEst={monthlyStreamsEst}
          ltmSpotifyRevenue={ltmSpotifyRevenue}
          effectiveSpotifyRate={effectiveSpotifyRate}
          geoMethodUsed={geoMethodUsed}
          {...fmt}
        />

        {/* 2-column: Stream Inputs + Payout Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <StreamDataInput
            lifetimeStreamsInput={lifetimeStreamsInput}
            setLifetimeStreamsInput={setLifetimeStreamsInput}
            releaseDate={releaseDate}
            setReleaseDate={setReleaseDate}
            methodUsed={methodUsed}
            methodLabel={methodLabel}
            featuredTrackCount={featuredTrackCount}
            totalTrackCount={totalTrackCount}
            formatNumber={formatNumber}
          />
          <PayoutRateCard
            effectiveSpotifyRate={effectiveSpotifyRate}
            geoMethodUsed={geoMethodUsed}
            geoRateData={geoRateData}
          />
        </div>

        {/* Revenue Calculation */}
        <RevenueCalculation
          monthlyStreamsEst={monthlyStreamsEst}
          effectiveSpotifyRate={effectiveSpotifyRate}
          geoMethodUsed={geoMethodUsed}
          monthlySpotifyRevenue={monthlySpotifyRevenue}
          ltmSpotifyRevenue={ltmSpotifyRevenue}
          methodUsed={methodUsed}
          featuredTrackCount={featuredTrackCount}
          totalTrackCount={totalTrackCount}
          {...fmt}
        />

        {/* Dollar Age */}
        <DollarAgeAnalysis
          dollarAgeData={dollarAgeData}
          formatCurrency={formatCurrency}
        />

        {/* Valuation Tiers */}
        <ValuationEstimates
          conservativeValuation={conservativeValuation}
          marketValuation={marketValuation}
          premiumValuation={premiumValuation}
          formatCurrency={formatCurrency}
        />

        {/* Methodology — collapsible */}
        <MethodologyNote />

        {/* Save */}
        <SaveButton
          hasValidData={hasValidData}
          isSaving={isSaving}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default ValuationTab;
