// src/components/artist/YouTubeValuationTab.jsx
import React, { useState, useEffect } from "react";
import {
  Save,
  Calculator,
  TrendingUp,
  DollarSign,
  Info,
  Settings,
  BarChart,
  Play,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import { supabase } from "../../utils/supabase";
import { generateYouTubeValuationPDF } from "../../utils/youtubeValuationPdfGenerator";

const InputSlider = ({ label, value, onValueChange, min, max, step, unit, format }) => {
  const displayValue = format ? format(value) : `${value}${unit}`;

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 sm:px-3 py-1 rounded-md">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
      />
    </div>
  );
};

const YouTubeValuationTab = ({ artistData }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Default values matching Base44
  const [annualViewPercentage, setAnnualViewPercentage] = useState(25);
  const [monetizationRate, setMonetizationRate] = useState(50);
  const [avgCpm, setAvgCpm] = useState(2.0);
  const [creatorCut, setCreatorCut] = useState(55);
  const [streamingRate, setStreamingRate] = useState(0.002);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const parseViewCount = (viewString) => {
    if (!viewString) return 0;
    if (typeof viewString === "number") return viewString;

    const str = String(viewString).toUpperCase();
    if (str.includes("B")) {
      return parseFloat(str.replace("B", "")) * 1000000000;
    } else if (str.includes("M")) {
      return parseFloat(str.replace("M", "")) * 1000000;
    } else if (str.includes("K")) {
      return parseFloat(str.replace("K", "")) * 1000;
    }
    return parseFloat(str.replace(/,/g, "")) || 0;
  };

  const totalViews = parseViewCount(artistData.totalViews);
  const CONTENT_ID_MULTIPLIER = 3;

  // Calculations
  const estimatedAnnualViews = totalViews * (annualViewPercentage / 100);
  const monetizedViews = estimatedAnnualViews * (monetizationRate / 100);
  const grossAdRevenue = (monetizedViews / 1000) * avgCpm;
  const adRevenue = grossAdRevenue * (creatorCut / 100);
  const estimatedTotalPlays = estimatedAnnualViews * CONTENT_ID_MULTIPLIER;
  const streamingRevenue = estimatedTotalPlays * streamingRate;
  const totalAnnualRevenue = adRevenue + streamingRevenue;

  const conservativeValuation = totalAnnualRevenue * 6;
  const marketValuation = totalAnnualRevenue * 8;
  const premiumValuation = totalAnnualRevenue * 10;

  const advanceCalculation = totalAnnualRevenue * 0.15;
  const caccAdjustedValuation = totalAnnualRevenue * 8 * 1.3;
  const totalAdvancePackage = advanceCalculation + advanceCalculation * 0.6 + advanceCalculation * 0.4;

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatCurrency = (num) => {
    if (!num || isNaN(num)) return "$0";
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const handleSave = async () => {
    try {
      if (!user) {
        alert("Please sign in to download and save reports");
        navigate("/auth");
        return;
      }

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
          totalViews: totalViews,
          annualViewPercentage: annualViewPercentage,
          monetizationRate: monetizationRate,
          avgCpm: avgCpm,
          creatorCut: creatorCut,
          streamingRate: streamingRate,
          contentIdMultiplier: CONTENT_ID_MULTIPLIER,
        },
        calculations: {
          estimatedAnnualViews: estimatedAnnualViews,
          monetizedViews: monetizedViews,
          grossAdRevenue: grossAdRevenue,
          adRevenue: adRevenue,
          estimatedTotalPlays: estimatedTotalPlays,
          streamingRevenue: streamingRevenue,
          totalAnnualRevenue: totalAnnualRevenue,
        },
        valuations: {
          conservative: conservativeValuation,
          market: marketValuation,
          premium: premiumValuation,
          advancePackage: totalAdvancePackage,
          caccAdjusted: caccAdjustedValuation,
        },
      };

      console.log("Generating YouTube PDF report:", reportData);

      // Generate and download PDF
      generateYouTubeValuationPDF(reportData);

      // Save report to database
      const { data: savedReport, error: saveError } = await supabase
        .from("user_reports")
        .insert([
          {
            user_id: user.id,
            artist_name: artistData.name,
            report_type: 'youtube_valuation',
            report_data: reportData,
          },
        ])
        .select()
        .single();

      if (saveError) {
        console.error("Error saving report to database:", saveError);
        alert("PDF downloaded successfully, but failed to save to your account: " + saveError.message);
        setIsSaving(false);
        return;
      }

      console.log("Report saved to database:", savedReport);

      const viewDashboard = window.confirm(
        "YouTube Valuation report downloaded and saved to your account!\n\nWould you like to view your saved reports?"
      );

      if (viewDashboard) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error generating/saving PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasValidData = totalViews > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Warning banner if no valid data */}
      {!hasValidData && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-500/50 shadow-xl">
          <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="p-2 sm:p-3 bg-red-500/20 rounded-xl flex-shrink-0">
              <Info size={20} className="sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-red-800 dark:text-red-300 mb-1 sm:mb-2">
                Insufficient Data
              </h3>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">
                No view data available. Please ensure valid YouTube data is loaded.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Authentication warning banner */}
      {!user && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-300 dark:border-amber-500/50 shadow-xl">
          <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="p-2 sm:p-3 bg-amber-500/20 rounded-xl flex-shrink-0">
              <Info size={20} className="sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-300 mb-1 sm:mb-2">
                Sign in to Save Reports
              </h3>
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 mb-3">
                You can view valuations, but you'll need to sign in to download PDFs and save reports to your account.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="px-3 sm:px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-xs sm:text-sm"
              >
                Sign In Now
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Valuation Assumptions */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <Settings size={20} className="sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Valuation Assumptions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Ad Revenue Inputs */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-sm sm:text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
              Ad Revenue Inputs
            </h4>
            <InputSlider
              label="Annual Views % of Total"
              value={annualViewPercentage}
              onValueChange={setAnnualViewPercentage}
              min={5}
              max={100}
              step={1}
              unit="%"
            />
            <InputSlider
              label="Monetization Rate"
              value={monetizationRate}
              onValueChange={setMonetizationRate}
              min={30}
              max={80}
              step={1}
              unit="%"
            />
          </div>

          {/* Financial Inputs */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-sm sm:text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              Financial Inputs
            </h4>
            <InputSlider
              label="Average Music CPM"
              value={avgCpm}
              onValueChange={setAvgCpm}
              min={0.5}
              max={5}
              step={0.1}
              format={(v) => `$${v.toFixed(2)}`}
            />
            <InputSlider
              label="Creator Cut"
              value={creatorCut}
              onValueChange={setCreatorCut}
              min={40}
              max={100}
              step={1}
              unit="%"
            />
          </div>

          {/* Streaming Inputs */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-sm sm:text-md font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              Streaming Inputs
            </h4>
            <InputSlider
              label="Streaming Rate / Play"
              value={streamingRate}
              onValueChange={setStreamingRate}
              min={0.001}
              max={0.003}
              step={0.0001}
              format={(v) => `$${v.toFixed(4)}`}
            />
          </div>
        </div>
      </Card>

      {/* Estimated Annual Revenue Card */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-green-500/20 rounded-xl">
              <DollarSign size={24} className="sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                Estimated Annual Revenue
              </h3>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                Total projected yearly earnings
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalAnnualRevenue)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              per year
            </p>
          </div>
        </div>
      </Card>

      {/* Comprehensive Revenue Analysis */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl">
            <DollarSign size={20} className="sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            YouTube Comprehensive Revenue Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Channel Ad Revenue */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-red-600 dark:text-red-400 text-sm sm:text-base">
              1. Channel Ad Revenue (YPP)
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Est. Annual Views</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatNumber(estimatedAnnualViews)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Monetized Views ({monetizationRate}%)</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatNumber(monetizedViews)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Gross Ad Revenue</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatCurrency(grossAdRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b-2 border-red-400/50">
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">Net Ad Revenue ({creatorCut}%)</span>
                <span className="font-bold text-red-600 dark:text-red-400 text-sm sm:text-base">{formatCurrency(adRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Content ID & Streaming */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-purple-600 dark:text-purple-400 text-sm sm:text-base">
              2. Content ID & Streaming
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Est. Total Platform Plays</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatNumber(estimatedTotalPlays)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Streaming Rate</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">${streamingRate.toFixed(4)}/play</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b-2 border-purple-400/50">
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">Streaming Revenue</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 text-sm sm:text-base">{formatCurrency(streamingRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Total Annual Revenue */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-green-600 dark:text-green-400 text-sm sm:text-base">
              3. Total Annual Revenue
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Ad Revenue</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatCurrency(adRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Streaming Revenue</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatCurrency(streamingRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b-2 border-green-400/50">
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">Total Annual Revenue</span>
                <span className="font-bold text-green-600 dark:text-green-400 text-sm sm:text-base">{formatCurrency(totalAnnualRevenue)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs sm:text-sm text-blue-700 dark:text-blue-400 flex items-start gap-2 sm:gap-3">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
          <p>
            This comprehensive valuation includes both YouTube Partner Program ad revenue and Content ID/streaming royalties. Use the sliders above to adjust key assumptions and see their impact on the final revenue.
          </p>
        </div>
      </Card>

      {/* Revenue Streams Breakdown */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
          YouTube Revenue Streams
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-500/30">
            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 text-sm sm:text-base">
              Channel Ad Revenue
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
              Direct monetization from owned channel videos
            </p>
            <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(adRevenue)}/year
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-500/30">
            <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2 text-sm sm:text-base">
              Content ID & Streaming
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
              Revenue from music used across YouTube
            </p>
            <p className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(streamingRevenue)}/year
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-500/30">
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2 text-sm sm:text-base">
              Total Potential
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
              Combined annual revenue estimate
            </p>
            <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalAnnualRevenue)}/year
            </p>
          </div>
        </div>
      </Card>

      {/* Professional Valuation Scenarios */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
            <DollarSign size={20} className="sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Professional Valuation Scenarios
          </h3>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 text-xs sm:text-sm">
          Standard industry multiples and growth adjustments applied to the estimated total annual revenue of{" "}
          <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalAnnualRevenue)}</span>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-4 text-center border border-blue-200 dark:border-blue-500/30">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/30 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">
              Conservative (6x)
            </h4>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
              {formatCurrency(conservativeValuation)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Traditional industry standard
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 sm:p-4 text-center border border-green-200 dark:border-green-500/30">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/30 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">
              Market Standard (8x)
            </h4>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mb-1 sm:mb-2">
              {formatCurrency(marketValuation)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Current market average
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 sm:p-4 text-center border border-purple-200 dark:border-purple-500/30">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/30 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">
              Premium (10x)
            </h4>
            <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1 sm:mb-2">
              {formatCurrency(premiumValuation)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              High-growth potential artists
            </p>
          </div>
        </div>

        {/* Advance Potential & Growth-Adjusted */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
              <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
              Advance Potential
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Recording Advance</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatCurrency(advanceCalculation)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Tour Support</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatCurrency(advanceCalculation * 0.6)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Marketing Budget</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatCurrency(advanceCalculation * 0.4)}</span>
              </div>
              <hr className="border-slate-300 dark:border-slate-600" />
              <div className="flex justify-between items-center font-bold">
                <span className="text-slate-900 dark:text-white text-xs sm:text-sm">Total Package</span>
                <span className="text-green-600 dark:text-green-400 text-sm sm:text-base">{formatCurrency(totalAdvancePackage)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              Growth-Adjusted Valuation
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Base 8x Valuation</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatCurrency(totalAnnualRevenue * 8)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">CACC Growth (+30%)</span>
                <span className="font-bold text-green-600 dark:text-green-400 text-sm sm:text-base">+{formatCurrency(totalAnnualRevenue * 8 * 0.3)}</span>
              </div>
              <hr className="border-slate-300 dark:border-slate-600" />
              <div className="flex justify-between items-center font-bold">
                <span className="text-slate-900 dark:text-white text-xs sm:text-sm">Adjusted Valuation</span>
                <span className="text-green-600 dark:text-green-400 text-sm sm:text-base">{formatCurrency(caccAdjustedValuation)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center pt-2 sm:pt-4 pb-4 sm:pb-6">
        <Button
          variant="primary"
          icon={Save}
          onClick={handleSave}
          size="lg"
          disabled={!hasValidData || isSaving}
          className={`${
            hasValidData && !isSaving
              ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              : "bg-slate-400 cursor-not-allowed"
          } text-white shadow-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold w-full sm:w-auto`}
        >
          {isSaving ? "Saving..." : "Download & Save YouTube PDF Report"}
        </Button>
      </div>
    </div>
  );
};

export default YouTubeValuationTab;