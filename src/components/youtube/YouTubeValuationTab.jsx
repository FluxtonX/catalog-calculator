import React, { useState, useEffect } from "react";
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
} from "./hooks/useYouTubeValuationLogic";

// Reuse valuation UI components
import AlertBanner from "../valuation/ui/AlertBanner";

// YouTube sections
import ValuationAssumptions from "./sections/ValuationAssumptions";
import AnnualRevenueCard from "./sections/AnnualRevenueCard";
import RevenueAnalysis from "./sections/RevenueAnalysis";
import RevenueStreams from "./sections/RevenueStreams";
import ValuationScenarios from "./sections/ValuationScenarios";
import YoutubeSaveButton from "./sections/YoutubeSaveButton";

const YouTubeValuationTab = ({ artistData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Slider state — default values unchanged from original
  const [annualViewPercentage, setAnnualViewPercentage] = useState(25);
  const [monetizationRate, setMonetizationRate] = useState(50);
  const [avgCpm, setAvgCpm] = useState(2.0);
  const [creatorCut, setCreatorCut] = useState(55);
  const [streamingRate, setStreamingRate] = useState(0.002);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
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
    try {
     const handleSave = async () => {
  if (!user) {
    navigate("/auth", { state: { from: location } });
    return;
  }
  // Remove this block when Pro is implemented
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
        .insert([
          {
            user_id: user.id,
            artist_name: artistData.name,
            report_type: "youtube_valuation",
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

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Alert Banners — reusing valuation/ui/AlertBanner */}
      {!hasValidData && (
        <AlertBanner
          icon={AlertTriangle}
          title="Insufficient Data"
          message="No view data available. Ensure valid YouTube data is loaded."
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
      {!user && (
        <AlertBanner
          icon={LogIn}
          title="Sign in to Save Reports"
          message="You can view valuations, but sign in to download PDFs and save reports."
          accent={{
            border: "border-amber-200 dark:border-amber-500/40",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            iconBg: "bg-amber-100 dark:bg-amber-800/40",
            icon: "text-amber-600 dark:text-amber-400",
            title: "text-amber-800 dark:text-amber-300",
            text: "text-amber-700 dark:text-amber-400",
          }}
          action={
            <button
              onClick={() => navigate("/auth", { state: { from: location } })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-md"
            >
              <LogIn size={14} />
              Sign In Now
            </button>
          }
        />
      )}

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
