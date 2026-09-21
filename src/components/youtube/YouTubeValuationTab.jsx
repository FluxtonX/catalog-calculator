import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import { generateYouTubeValuationPDF } from "../../utils/youtubeValuationPdfGenerator";
import { useLocation } from "react-router-dom";

// Logic
import {
  parseViewCount,
  calculateYouTubeMetrics,
  formatNumber,
  formatCurrency,
  CONTENT_ID_MULTIPLIER,
} from "../../core/calculations";

// Reuse valuation UI components
import AlertBanner from "../valuation/ui/AlertBanner";

// YouTube sections
import ValuationAssumptions from "./sections/ValuationAssumptions";
import AnnualRevenueCard from "./sections/AnnualRevenueCard";
import RevenueAnalysis from "./sections/RevenueAnalysis";
import RevenueStreams from "./sections/RevenueStreams";
import ValuationScenarios from "./sections/ValuationScenarios";
import YoutubeSaveButton from "./sections/YoutubeSaveButton";
import PlatformContributionBanner from "../valuation/PlatformContributionBanner";
import AverageCatalogAge from "../valuation/sections/AverageCatalogAge";
import { calculateCfaPhase1 } from "../../core/calculations";


const YouTubeValuationTab = ({ artistData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);  // ADD THIS

  // Slider state — default values unchanged from original
  const [annualViewPercentage, setAnnualViewPercentage] = useState(25);
  const [monetizationRate, setMonetizationRate] = useState(50);
  const [avgCpm, setAvgCpm] = useState(2.0);
  const [creatorCut, setCreatorCut] = useState(55);
 const [streamingRate, setStreamingRate] = useState(0.0054);

 useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const totalViews = parseViewCount(artistData.totalViews);
  const hasValidData = totalViews > 0;

  // All calculations via hook — logic unchanged
  const metrics = calculateYouTubeMetrics({
    totalViews,
    annualViewPercentage,
    monetizationRate,
    avgCpm,
    creatorCut,
    streamingRate,
  });

  // handleSave — logic unchanged
 const handleSave = async () => {
  if (!user) {
    navigate("/auth", { state: { from: location } });
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
      inputs: {
        totalViews,
        annualViewPercentage,
        monetizationRate,
        avgCpm,
        creatorCut,
        streamingRate,
        contentIdMultiplier: CONTENT_ID_MULTIPLIER,
      },
      calculations: { ...metrics },
      valuations: {
        conservative: metrics.conservativeValuation,
        market: metrics.marketValuation,
        premium: metrics.premiumValuation,
        advancePackage: metrics.totalAdvancePackage,
        caccAdjusted: metrics.caccAdjustedValuation,
      },
    };
    generateYouTubeValuationPDF(reportData);
    const { error: saveError } = await supabase
      .from("user_reports")
      .insert([{
        user_id: user.id,
        artist_name: artistData.name,
        report_type: "youtube_valuation",
        report_data: reportData,
      }])
      .select()
      .single();
    if (saveError) {
      alert("PDF downloaded, but failed to save: " + saveError.message);
      return;
    }
    if (window.confirm("Report saved!\n\nView saved reports?")) navigate("/dashboard");
  } catch {
    alert("Error generating PDF. Please try again.");
  } finally {
    setIsSaving(false);
  }
};

  const cfaResult = useMemo(
    () => calculateCfaPhase1(artistData, "youtube"),
    [artistData]
  );

  const dollarAgeData = {
    dollarAge: cfaResult.averageDollarAge,
    trackBreakdown: cfaResult.trackDetails.map(t => ({
      name: t.title,
      ageInYears: t.ageInYears,
      releaseDate: t.releaseDate || (t.releaseYear ? `${t.releaseYear}-01-01` : "")
    }))
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Alert Banners — reusing valuation/ui/AlertBanner */}
      {!hasValidData && (
        <AlertBanner
          icon={AlertTriangle}
          title="Insufficient Data"
          message="No view data available. Ensure valid YouTube data is loaded."
          accent={{
            border: "border-[#FF0000]/20 dark:border-[#FF0000]/40",
            bg: "bg-[#FF0000]/10 dark:bg-[#FF0000]/20",
            iconBg: "bg-[#FF0000]/15 dark:bg-[#FF0000]/40",
            icon: "text-[#FF0000] dark:text-[#FF0000]",
            title: "text-[#FF0000] dark:text-[#FF0000]",
            text: "text-[#FF0000] dark:text-[#FF0000]",
          }}
        />
      )}
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
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-md"
      >
        <LogIn size={14} />
        Sign In Now
      </button>
    }
  />
)}

      {/* Login to Dashboard */}
      <div className="flex justify-center my-8">
        <a
          href="https://studio.youtube.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FF0000] hover:bg-[#cc0000] text-white text-base font-bold rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
        >
          <LogIn size={20} />
          Login to your YouTube dashboard
        </a>
      </div>

      <PlatformContributionBanner platform="youtube" />

      <ValuationAssumptions
        annualViewPercentage={annualViewPercentage}
        setAnnualViewPercentage={setAnnualViewPercentage}
        monetizationRate={monetizationRate}
        setMonetizationRate={setMonetizationRate}
        avgCpm={avgCpm}
        setAvgCpm={setAvgCpm}
        creatorCut={creatorCut}
        setCreatorCut={setCreatorCut}
        streamingRate={streamingRate}
        setStreamingRate={setStreamingRate}
      />

     <AnnualRevenueCard
  totalAnnualRevenue={metrics.totalAnnualRevenue}
  annualViewPercentage={annualViewPercentage}
  streamingRate={streamingRate}
  formatCurrency={formatCurrency}
/>

      <RevenueAnalysis
        {...metrics}
        monetizationRate={monetizationRate}
        creatorCut={creatorCut}
        streamingRate={streamingRate}
        formatNumber={formatNumber}
        formatCurrency={formatCurrency}
      />

      <RevenueStreams
        adRevenue={metrics.adRevenue}
        streamingRevenue={metrics.streamingRevenue}
        totalAnnualRevenue={metrics.totalAnnualRevenue}
        formatCurrency={formatCurrency}
      />

      <AverageCatalogAge
        platform="youtube"
        dollarAgeData={dollarAgeData}
      />

      <ValuationScenarios
        {...metrics}
        totalAnnualRevenue={metrics.totalAnnualRevenue}
        formatCurrency={formatCurrency}
      />

      <YoutubeSaveButton
        hasValidData={hasValidData}
        isSaving={isSaving}
        onSave={handleSave}
      />
    </div>
  );
};

export default YouTubeValuationTab;

