import React, { useState, useEffect, useMemo } from "react";
import { calculateMonthlyStreamsAndRevenue } from "../../utils/calculations";
import { generateValuationPDF } from "../../utils/pdfGenerator";
import {
  ArrowLeft,
  Save,
  Calculator,
  TrendingUp,
  Music,
  DollarSign,
  Calendar,
  Globe,
  Info,
  Sparkles,
} from "lucide-react";
import { useArtistStore } from "../../store/artistStore";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import Badge from "../common/Badge";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { calculateDollarAge } from "../../utils/calculations";
import { supabase } from "../../utils/supabase";

const ValuationTab = () => {
  const navigate = useNavigate();
  const { selectedArtist: artistData } = useArtistStore();

  // ====================================
  // 🆕 NEW: Add state for user and saving
  // ====================================
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Region payout rate table (as per client spec document)
  const RATE_BY_REGION = {
    US_CA_UK_AU: 0.0042,
    EU_WEST: 0.0036,
    LATAM: 0.0018,
    ASIA: 0.0022,
    ROW: 0.0016,
  };

  const DEFAULT_SPOTIFY_RATE = 0.0035;

  const getDecayFactor = (monthsLive) => {
    if (monthsLive <= 3) return 1.0;
    if (monthsLive <= 12) return 0.85;
    if (monthsLive <= 36) return 0.65;
    return 0.5;
  };

  const getMonthsBetween = (releaseDate, currentDate) => {
    const release = new Date(releaseDate);
    const current = new Date(currentDate);
    const months =
      (current.getFullYear() - release.getFullYear()) * 12 +
      (current.getMonth() - release.getMonth());
    return Math.max(1, months);
  };

  // Map cities to regions for geo-weighting
  const getCityRegion = (cityObj) => {
    if (!cityObj) return "ROW";

    // Handle both string and object formats
    const cityStr = typeof cityObj === "string" ? cityObj : cityObj.city;
    const countryCode = typeof cityObj === "object" ? cityObj.country : null;

    if (!cityStr) return "ROW";

    const cityLower = cityStr.toLowerCase();

    // Use country code first if available (more reliable)
    if (countryCode) {
      const code = countryCode.toUpperCase();

      // US_CA_UK_AU
      if (["US", "CA", "GB", "UK", "AU"].includes(code)) {
        return "US_CA_UK_AU";
      }

      // EU_WEST
      if (
        [
          "DE",
          "FR",
          "ES",
          "IT",
          "NL",
          "BE",
          "AT",
          "PT",
          "IE",
          "SE",
          "DK",
          "FI",
          "NO",
          "CH",
        ].includes(code)
      ) {
        return "EU_WEST";
      }

      // LATAM
      if (
        [
          "MX",
          "BR",
          "AR",
          "CO",
          "CL",
          "PE",
          "VE",
          "EC",
          "GT",
          "CU",
          "BO",
          "DO",
          "HN",
          "PY",
          "NI",
          "SV",
          "CR",
          "PA",
          "UY",
          "NG",
          "ZA",
        ].includes(code)
      ) {
        return "LATAM";
      }

      // ASIA
      if (
        [
          "IN",
          "CN",
          "JP",
          "KR",
          "TH",
          "VN",
          "PH",
          "ID",
          "MY",
          "SG",
          "TW",
          "HK",
          "PK",
          "BD",
        ].includes(code)
      ) {
        return "ASIA";
      }
    }

    // Fallback to city name matching
    if (
      cityLower.includes("london") ||
      cityLower.includes("new york") ||
      cityLower.includes("los angeles") ||
      cityLower.includes("toronto") ||
      cityLower.includes("sydney") ||
      cityLower.includes("melbourne") ||
      cityLower.includes("chicago") ||
      cityLower.includes("miami")
    ) {
      return "US_CA_UK_AU";
    }

    if (
      cityLower.includes("amsterdam") ||
      cityLower.includes("berlin") ||
      cityLower.includes("paris") ||
      cityLower.includes("madrid") ||
      cityLower.includes("barcelona") ||
      cityLower.includes("oslo") ||
      cityLower.includes("stockholm")
    ) {
      return "EU_WEST";
    }

    if (
      cityLower.includes("são paulo") ||
      cityLower.includes("sao paulo") ||
      cityLower.includes("mexico city") ||
      cityLower.includes("buenos aires") ||
      cityLower.includes("santiago") ||
      cityLower.includes("lima") ||
      cityLower.includes("bogota") ||
      cityLower.includes("curitiba") ||
      cityLower.includes("lagos")
    ) {
      return "LATAM";
    }

    if (
      cityLower.includes("mumbai") ||
      cityLower.includes("delhi") ||
      cityLower.includes("tokyo") ||
      cityLower.includes("seoul") ||
      cityLower.includes("bangkok") ||
      cityLower.includes("manila") ||
      cityLower.includes("jakarta")
    ) {
      return "ASIA";
    }

    return "ROW";
  };

  // Calculate geo-weighted effective Spotify rate
  const calculateGeoWeightedRate = (topCities) => {
    if (!topCities || topCities.length === 0) {
      return {
        rate: DEFAULT_SPOTIFY_RATE,
        method: "DEFAULT",
      };
    }

    // Calculate total listeners across all cities
    const totalListeners = topCities.reduce((sum, city) => {
      return sum + (city.numberOfListeners || 0);
    }, 0);

    if (totalListeners === 0) {
      return {
        rate: DEFAULT_SPOTIFY_RATE,
        method: "DEFAULT",
      };
    }

    // Count weighted occurrences by listener count
    const regionWeights = {};
    topCities.forEach((city) => {
      const region = getCityRegion(city);
      const listeners = city.numberOfListeners || 0;
      regionWeights[region] = (regionWeights[region] || 0) + listeners;
    });

    // Calculate shares (normalize to sum to 1.0)
    const regionShares = {};
    Object.keys(regionWeights).forEach((region) => {
      regionShares[region] = regionWeights[region] / totalListeners;
    });

    // Calculate weighted rate
    let effectiveRate = 0;
    Object.keys(regionShares).forEach((region) => {
      effectiveRate +=
        regionShares[region] * (RATE_BY_REGION[region] || DEFAULT_SPOTIFY_RATE);
    });

    return {
      rate: effectiveRate,
      method: "WEIGHTED",
      breakdown: regionShares,
    };
  };

  const getLifetimeStreams = () => {
    if (!artistData) return 0;

    if (artistData.platform === "apify" && artistData.stats?.totalStreams) {
      const streamsStr = artistData.stats.totalStreams;
      let streams = 0;
      if (streamsStr.includes("B")) {
        streams = parseFloat(streamsStr.replace("B", "")) * 1000000000;
      } else if (streamsStr.includes("M")) {
        streams = parseFloat(streamsStr.replace("M", "")) * 1000000;
      } else if (streamsStr.includes("K")) {
        streams = parseFloat(streamsStr.replace("K", "")) * 1000;
      } else {
        streams = parseFloat(streamsStr.replace(/,/g, ""));
      }
      return streams;
    }

    if (artistData.topTracks && artistData.topTracks.length > 0) {
      let totalFromTracks = 0;
      artistData.topTracks.forEach((track) => {
        if (track.streamCount) {
          totalFromTracks += parseInt(track.streamCount);
        } else if (track.streamCountFormatted) {
          const countStr = track.streamCountFormatted;
          if (countStr.includes("B")) {
            totalFromTracks +=
              parseFloat(countStr.replace("B", "")) * 1000000000;
          } else if (countStr.includes("M")) {
            totalFromTracks += parseFloat(countStr.replace("M", "")) * 1000000;
          } else if (countStr.includes("K")) {
            totalFromTracks += parseFloat(countStr.replace("K", "")) * 1000;
          }
        }
      });
      if (totalFromTracks > 0) return totalFromTracks;
    }

    if (artistData.monthlyListeners) {
      const listenersNum = parseFloat(
        String(artistData.monthlyListeners).replace(/[^0-9.]/g, ""),
      );
      return listenersNum * 15 * 12;
    }

    return 0;
  };

  const getAverageReleaseDate = () => {
    const dates = [];

    // Albums
    artistData?.albums?.forEach((album) => {
      if (album.releaseDate) {
        const t = new Date(album.releaseDate).getTime();
        if (!isNaN(t)) dates.push(t);
      }
    });

    // Singles / Top Tracks
    artistData?.topTracks?.forEach((track) => {
      let dateStr = track.releaseDate;

      // If releaseDate is missing, fallback to releaseYear
      if (!dateStr && track.releaseYear) {
        dateStr = `${track.releaseYear}-01-01`;
      }

      if (dateStr) {
        const t = new Date(dateStr).getTime();
        if (!isNaN(t)) dates.push(t);
      }
    });

    // If no valid dates, fallback
    if (dates.length === 0) {
      return "2022-01-01";
    }

    // Calculate average timestamp
    const avgTimestamp = dates.reduce((sum, t) => sum + t, 0) / dates.length;

    // Convert back to YYYY-MM-DD
    return new Date(avgTimestamp).toISOString().split("T")[0];
  };

  const initialLifetimeStreams = getLifetimeStreams();
  const [lifetimeStreamsInput, setLifetimeStreamsInput] = useState(
    initialLifetimeStreams.toString(),
  );
  const [releaseDate, setReleaseDate] = useState(getAverageReleaseDate());

  // ====================================
  // 🆕 NEW: Get current user on mount
  // ====================================
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!artistData) {
      navigate("/valuation");
    }
  }, [artistData, navigate]);

  if (!artistData) return null;

  const lifetimeStreams =
    parseFloat(lifetimeStreamsInput.replace(/,/g, "")) || 0;
  const currentDate = new Date();
  const monthsLive = getMonthsBetween(releaseDate, currentDate);

  const geoRateData = calculateGeoWeightedRate(artistData.topCities);
  const effectiveSpotifyRate = geoRateData.rate;
  const geoMethodUsed = geoRateData.method;

  const dollarAgeData = useMemo(() => {
    return calculateDollarAge(artistData, effectiveSpotifyRate, currentDate);
  }, [artistData, effectiveSpotifyRate, currentDate]);

  // Use new calculation function with featured track logic
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

  const conservativeValuation = ltmSpotifyRevenue * 6;
  const marketValuation = ltmSpotifyRevenue * 8;
  const premiumValuation = ltmSpotifyRevenue * 10;

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    return Math.round(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatToBillions = (num) => {
    if (!num || isNaN(num)) return "0.00B";
    const billions = num / 1000000000;
    return billions.toFixed(2) + "B";
  };

  const formatToMillions = (num) => {
    if (!num || isNaN(num)) return "0.00M";
    const millions = num / 1000000;
    return millions.toFixed(2) + "M";
  };

  const formatCurrency = (num) => {
    if (!num || isNaN(num)) return "$0";
    if (num >= 1000000) {
      return "$" + formatToMillions(num);
    } else if (num >= 1000) {
      const thousands = num / 1000;
      return "$" + thousands.toFixed(2) + "K";
    }
    return "$" + num.toFixed(2);
  };

  // ====================================
  // 🆕 UPDATED: handleSave function with Supabase integration
  // ====================================
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
        lifetimeStreams: lifetimeStreams,
        releaseDate: releaseDate,
      },
      calculations: {
        monthsLive: monthsLive,
        monthlyStreamsEst: monthlyStreamsEst,
        methodUsed: methodUsed,
        decayFactor:
          methodUsed === "LIFETIME_RUNRATE_ADJ"
            ? getDecayFactor(monthsLive)
            : null,
        effectiveSpotifyRate: effectiveSpotifyRate,
        geoMethodUsed: geoMethodUsed,
        geoBreakdown: geoRateData.breakdown,
        monthlySpotifyRevenue: monthlySpotifyRevenue,
        ltmSpotifyRevenue: ltmSpotifyRevenue,
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

    console.log("Generating PDF report:", reportData);

    // Generate and download PDF
    generateValuationPDF(reportData);

    // Save report to database with report_type
    const { data: savedReport, error: saveError } = await supabase
      .from("user_reports")
      .insert([
        {
          user_id: user.id,
          artist_name: artistData.name,
          report_type: 'spotify_valuation', // ✅ ADD THIS
          report_data: reportData,
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error("Error saving report to database:", saveError);
      alert(
        "PDF downloaded successfully, but failed to save to your account: " +
          saveError.message,
      );
      setIsSaving(false);
      return;
    }

    console.log("Report saved to database:", savedReport);

    const viewDashboard = window.confirm(
      "Valuation report downloaded and saved to your account!\n\nWould you like to view your saved reports?"
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

  const hasValidData = lifetimeStreams > 0;

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
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
                No lifetime stream data available. Please enter valid stream counts to calculate valuation.
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

      {/* Artist Header Card */}
      <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Heading with Icon */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl">
              <DollarSign size={20} className="sm:w-6 sm:h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                Catalog Valuation Analysis
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Enter artist catalog data for valuation
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {/* Market Value */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-500/30 hover:bg-white/15 transition-all dark:bg-white/10 dark:border-emerald-500/30">
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg sm:rounded-xl">
                  <DollarSign size={16} className="sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-white/70 font-semibold uppercase tracking-wide">
                    Market Value
                  </p>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(marketValuation)}
                  </h3>
                  <p className="text-[9px] sm:text-xs text-gray-500 dark:text-white/50 font-mono mt-0.5 sm:mt-1 hidden sm:block">
                    ${formatNumber(marketValuation)}
                  </p>
                  <p className="text-[9px] sm:text-xs text-emerald-600 dark:text-emerald-400">
                    8x Multiple
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Streams */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-500/30 hover:bg-white/15 transition-all dark:bg-white/10 dark:border-purple-500/30">
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg sm:rounded-xl">
                  <Music size={16} className="sm:w-5 sm:h-5 text-purple-400" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-white/70 font-semibold uppercase tracking-wide">
                    Monthly
                  </p>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    {formatToMillions(monthlyStreamsEst)}
                  </h3>
                  <p className="text-[9px] sm:text-xs text-gray-500 dark:text-white/50 font-mono mt-0.5 sm:mt-1 hidden sm:block">
                    {formatNumber(monthlyStreamsEst)}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-600 dark:text-white/70">
                    Streams
                  </p>
                </div>
              </div>
            </div>

            {/* LTM Revenue */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-500/30 hover:bg-white/15 transition-all dark:bg-white/10 dark:border-blue-500/30">
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg sm:rounded-xl">
                  <TrendingUp size={16} className="sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-white/70 font-semibold uppercase tracking-wide">
                    LTM Revenue
                  </p>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(ltmSpotifyRevenue)}
                  </h3>
                  <p className="text-[9px] sm:text-xs text-gray-500 dark:text-white/50 font-mono mt-0.5 sm:mt-1 hidden sm:block">
                    ${formatNumber(ltmSpotifyRevenue)}
                  </p>
                  <p className="text-[9px] sm:text-xs text-blue-600 dark:text-blue-400">
                    12 Months
                  </p>
                </div>
              </div>
            </div>

            {/* Rate */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-orange-500/30 hover:bg-white/15 transition-all dark:bg-white/10 dark:border-orange-500/30">
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg sm:rounded-xl">
                  <Globe size={16} className="sm:w-5 sm:h-5 text-orange-400" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-white/70 font-semibold uppercase tracking-wide">
                    Rate
                  </p>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    ${(effectiveSpotifyRate * 1000).toFixed(2)}
                  </h3>
                  <p className="text-[9px] sm:text-xs text-gray-600 dark:text-white/70">
                    per 1K
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stream Data Inputs */}
      <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-xl">
              <Music size={20} className="sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                Stream Data
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Enter lifetime streaming data
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px]" />
                Lifetime Streams
              </label>
              <div className="relative w-full">
                <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                  <TrendingUp size={18} className="sm:w-5 sm:h-5" />
                </div>
                <input
                  type="text"
                  value={formatNumber(parseFloat(lifetimeStreamsInput.replace(/,/g, "")))}
                  onChange={(e) => setLifetimeStreamsInput(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-5 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-base sm:text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center gap-2">
                <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                Average Release Date
              </label>
              <div className="relative w-full">
                <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                  <Calendar size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="w-full">
                  <DatePicker
                    placeholderText="YYYY-MM-DD"
                    selected={releaseDate ? new Date(releaseDate) : null}
                    onChange={(date) => {
                      if (date) {
                        setReleaseDate(date.toISOString().split("T")[0]);
                      }
                    }}
                    withPortal
                    withFullScreenPortal
                    portalContainer={document.body}
                    portalId="date-picker-portal"
                    dateFormat="yyyy-MM-dd"
                    maxDate={new Date()}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    wrapperClassName="w-full block"
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-5 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-base sm:text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                    calendarClassName="date-picker-calendar-center"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-2 sm:gap-3">
              <Info size={18} className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                <strong className="font-bold">Calculation Method:</strong>{" "}
                {methodUsed === "RECENT_30D" && "Recent 30-day streams"}
                {methodUsed === "RECENT_28D_NORMALIZED" && "Recent 28-day streams (normalized to 30 days)"}
                {methodUsed === "TOP_TRACKS_FEATURED_ADJ" && `Top Tracks with Featured Track Adjustments (${totalTrackCount} tracks analyzed)`}
                {methodUsed === "LIFETIME_RUNRATE_ADJ" && `Lifetime Streams with Age Decay (${(getDecayFactor(monthsLive) * 100).toFixed(0)}% decay factor applied, ${monthsLive} months old)`}
              </div>
            </div>
            {/* Featured Track Disclaimer */}
            {methodUsed === "TOP_TRACKS_FEATURED_ADJ" && featuredTrackCount > 0 && (
              <div className="mt-3 sm:mt-4 p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-500/30 rounded-xl">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Info size={18} className="sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                    <strong className="font-bold">Featured Track Adjustment:</strong> {featuredTrackCount} of {totalTrackCount} top tracks identified as featured collaborations. Featured tracks are calculated at 25% of streaming revenue, as artists typically receive a smaller share on collaborations where they are not the primary artist.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Payout Rate Card */}
      <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
              <Globe size={20} className="sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                Payout Rate
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {geoMethodUsed === "WEIGHTED" ? "Geo-weighted Spotify payout rate" : "Global average Spotify payout rate"}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
              <span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                Effective Spotify Payout Rate:
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ${effectiveSpotifyRate.toFixed(4)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
              {geoMethodUsed === "WEIGHTED" ? "Rate calculated based on geographic distribution of listeners" : "Global average rate applied to all calculations"}
            </p>

            {geoMethodUsed === "WEIGHTED" && geoRateData.breakdown && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-emerald-200 dark:border-emerald-500/30">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 sm:mb-3">
                  Geographic Breakdown (by listener count):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(geoRateData.breakdown).map(([region, share]) => (
                    <div key={region} className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 sm:p-3 border border-emerald-200 dark:border-emerald-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {region}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {(share * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-500">
                        Rate: ${RATE_BY_REGION[region]?.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Calculation Breakdown */}
      <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
              <Calculator size={20} className="sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
              Revenue Calculation
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  Monthly Streams (Estimated)
                </span>
                <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(monthlyStreamsEst)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {methodUsed === "RECENT_30D" && "Based on recent 30-day streams"}
                {methodUsed === "RECENT_28D_NORMALIZED" && "Based on recent 28-day streams"}
                {methodUsed === "LIFETIME_RUNRATE_ADJ" && "Lifetime Streams with Age Decay"}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  Spotify Payout Rate
                </span>
                <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${effectiveSpotifyRate.toFixed(4)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {geoMethodUsed === "WEIGHTED" ? "Geo-weighted" : "Global average"} Spotify payout rate
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 sm:p-5 border-2 border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  Monthly Revenue
                </span>
                <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(monthlySpotifyRevenue)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {formatNumber(monthlyStreamsEst)} streams × ${effectiveSpotifyRate.toFixed(4)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-2 border-emerald-300 dark:border-emerald-500/30 rounded-xl p-4 sm:p-6">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300">
                  Last Twelve Months (LTM) Revenue
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(ltmSpotifyRevenue)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
                {formatCurrency(monthlySpotifyRevenue)} × 12 months
                {methodUsed === "TOP_TRACKS_FEATURED_ADJ" && featuredTrackCount > 0 && (
                  <span className="block mt-1 sm:mt-2 text-xs">
                    (Includes featured track revenue adjustment: {featuredTrackCount}/{totalTrackCount} tracks at 25%)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Dollar Age Card */}
      <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
              <Calendar size={20} className="sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                Dollar Age Analysis
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Weighted average age of catalog earnings
              </p>
            </div>
          </div>

          {/* Dollar Age Display */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-500/30 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Catalog Dollar Age
                </span>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  Weighted by LTM earnings
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400">
                  {dollarAgeData.dollarAge.toFixed(1)}
                </div>
                <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-500">
                  years
                </span>
              </div>
            </div>

            {/* Quality Indicator */}
            <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-amber-200 dark:border-amber-500/30">
              {dollarAgeData.dollarAge >= 5 ? (
                <>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">
                    Mature Catalog - High Stability
                  </span>
                </>
              ) : dollarAgeData.dollarAge >= 3 ? (
                <>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    Established Catalog - Moderate Stability
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-semibold text-orange-700 dark:text-orange-400">
                    Young Catalog - Growth Phase
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 mb-4 sm:mb-6">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Info size={16} className="sm:w-[18px] sm:h-[18px] text-blue-500" />
              What is Dollar Age?
            </h4>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <p>
                <strong className="text-slate-900 dark:text-white">Dollar Age</strong> is a weighted average that measures how long your catalog's earnings have been generating income.
              </p>
              <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 ml-1 sm:ml-2">
                <li><strong>Higher Dollar Age:</strong> Earnings from older, proven tracks → More stable income</li>
                <li><strong>Lower Dollar Age:</strong> Earnings from newer tracks → Growth potential but less proven</li>
              </ul>
              <p className="pt-1 sm:pt-2 text-[10px] sm:text-xs">
                Formula: Σ(Track Age × Track LTM Earnings) / Total LTM Earnings
              </p>
            </div>
          </div>

          {/* Track Breakdown */}
          {dollarAgeData.trackBreakdown.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                Top Tracks Contribution
              </h4>
              <div className="space-y-2">
                {dollarAgeData.trackBreakdown.map((track, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {track.name}
                        </h5>
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500">
                          Released: {new Date(track.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">
                          {track.ageInYears.toFixed(1)}y
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">LTM Earnings:</span>
                        <span className="ml-1 font-semibold text-slate-900 dark:text-white">{formatCurrency(track.ltmEarnings)}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Weighted Age:</span>
                        <span className="ml-1 font-semibold text-slate-900 dark:text-white">{(track.weightedAge / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">
                Total Weighted Age
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {(dollarAgeData.totalWeightedAge / 1000).toFixed(1)}K
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1">
                Total LTM Earnings
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(dollarAgeData.totalLTMEarnings)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Valuation Ranges */}
      <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
              <DollarSign size={20} className="sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
              Catalog Valuation Estimates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Calculator size={24} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-slate-900 dark:text-white">
                Conservative
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">
                6x Revenue Multiple
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
                {formatCurrency(conservativeValuation)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border-2 border-emerald-400 dark:border-emerald-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <TrendingUp size={24} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-slate-900 dark:text-white">
                Market
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">
                8x Revenue Multiple
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1 sm:mb-2">
                {formatCurrency(marketValuation)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border-2 border-purple-300 dark:border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <TrendingUp size={24} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-slate-900 dark:text-white">
                Premium
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">
                10x Revenue Multiple
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1 sm:mb-2">
                {formatCurrency(premiumValuation)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Methodology Notice */}
      <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-2 border-blue-200 dark:border-blue-500/30 shadow-xl">
        <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 lg:p-8">
          <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl flex-shrink-0">
            <Info size={20} className="sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-blue-800 dark:text-blue-300 mb-3 sm:mb-4">
              Valuation Methodology
            </h3>
            <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 space-y-1.5 sm:space-y-2 list-disc list-inside">
              <li>Monthly streams calculated using priority: (1) Recent 30-day data, (2) Recent 28-day data normalized, (3) Top tracks with featured track revenue adjustments, (4) Lifetime history with age-based decay factors</li>
              <li><strong>Featured tracks (containing "feat." or "featuring")</strong> are calculated at 25% revenue share when the artist is not the primary artist</li>
              <li>Geo-weighted Spotify payout rates applied based on listener geographic distribution</li>
              <li>LTM (Last Twelve Months) revenue = monthly streams × geo-weighted payout rate × 12</li>
              <li>Valuations calculated using revenue multiples (6x, 8x, 10x)</li>
              <li>Decay factors applied when using lifetime method: 0-3mo (100%), 4-12mo (85%), 13-36mo (65%), 36+mo (50%)</li>
              <li>Regional rates: US/CA/UK/AU ($0.0042), EU West ($0.0036), LATAM ($0.0018), Asia ($0.0022), Rest of World ($0.0016)</li>
              <li><strong>API Limitation:</strong> Calculations based on top 10 tracks only</li>
            </ul>
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
              ? "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
              : "bg-slate-400 cursor-not-allowed"
          } text-white shadow-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold w-full sm:w-auto`}
        >
          {isSaving ? "Saving..." : "Download & Save PDF Report"}
        </Button>
      </div>
    </div>
  </div>
);
};

export default ValuationTab;
