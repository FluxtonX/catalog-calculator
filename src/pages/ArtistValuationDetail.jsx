import React, { useState, useEffect } from "react";
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
import { useArtistStore } from "../store/artistStore";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ArtistValuationDetail = () => {
  const navigate = useNavigate();
  const { selectedArtist: artistData } = useArtistStore();

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

  // Calculate monthly streams estimate with priority logic
  let monthlyStreamsEst = 0;
  let methodUsed = "";

  // Priority 1: Recent 30 days
  if (artistData.streams_last_30_days) {
    monthlyStreamsEst = artistData.streams_last_30_days;
    methodUsed = "RECENT_30D";
  }
  // Priority 2: Recent 28 days (normalized to 30)
  else if (artistData.streams_last_28_days) {
    monthlyStreamsEst = Math.round(artistData.streams_last_28_days * (30 / 28));
    methodUsed = "RECENT_28D_NORMALIZED";
  }
  // Priority 3: Lifetime with decay
  else {
    const avgMonthly = monthsLive > 0 ? lifetimeStreams / monthsLive : 0;
    const decayFactor = getDecayFactor(monthsLive);
    monthlyStreamsEst = Math.round(avgMonthly * decayFactor);
    methodUsed = "LIFETIME_RUNRATE_ADJ";
  }

  // Calculate geo-weighted effective rate
  const geoRateData = calculateGeoWeightedRate(artistData.topCities);
  const effectiveSpotifyRate = geoRateData.rate;
  const geoMethodUsed = geoRateData.method;

  const variance = 0.15;
  const minMonthlyStreams = Math.round(monthlyStreamsEst * (1 - variance));
  const maxMonthlyStreams = Math.round(monthlyStreamsEst * (1 + variance));

  const monthlySpotifyRevenue = monthlyStreamsEst * effectiveSpotifyRate;
  const minMonthlyRevenue = monthlySpotifyRevenue * (1 - variance);
  const maxMonthlyRevenue = monthlySpotifyRevenue * (1 + variance);

  const ltmSpotifyRevenue = monthlySpotifyRevenue * 12;
  const minLtmRevenue = minMonthlyRevenue * 12;
  const maxLtmRevenue = maxMonthlyRevenue * 12;

  const conservativeValuation = ltmSpotifyRevenue * 6;
  const minConservativeValuation = minLtmRevenue * 6;
  const maxConservativeValuation = maxLtmRevenue * 6;

  const marketValuation = ltmSpotifyRevenue * 8;
  const minMarketValuation = minLtmRevenue * 8;
  const maxMarketValuation = maxLtmRevenue * 8;

  const premiumValuation = ltmSpotifyRevenue * 10;
  const minPremiumValuation = minLtmRevenue * 10;
  const maxPremiumValuation = maxLtmRevenue * 10;

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    return Math.round(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
      return "$" + thousands.toFixed(1) + "K"; // Reduced precision for cleaner range display
    }
    return "$" + Math.round(num);
  };

  const formatRange = (min, max, formatter) => {
    return `${formatter(min)} - ${formatter(max)}`;
  };

  const handleSave = () => {
    const reportData = {
      artist: artistData.name,
      date: new Date().toISOString(),
      inputs: {
        lifetimeStreams: lifetimeStreams,
        releaseDate: releaseDate,
      },
      calculations: {
        monthsLive: monthsLive,
        monthlyStreamsEst: monthlyStreamsEst,
        minMonthlyStreams,
        maxMonthlyStreams,
        methodUsed: methodUsed,
        decayFactor:
          methodUsed === "LIFETIME_RUNRATE_ADJ"
            ? getDecayFactor(monthsLive)
            : null,
        effectiveSpotifyRate: effectiveSpotifyRate,
        geoMethodUsed: geoMethodUsed,
        geoBreakdown: geoRateData.breakdown,
        monthlySpotifyRevenue: monthlySpotifyRevenue,
        minMonthlyRevenue,
        maxMonthlyRevenue,
        ltmSpotifyRevenue: ltmSpotifyRevenue,
        minLtmRevenue,
        maxLtmRevenue,
      },
      valuations: {
        conservative: conservativeValuation,
        minConservativeValuation,
        maxConservativeValuation,
        market: marketValuation,
        minMarketValuation,
        maxMarketValuation,
        premium: premiumValuation,
        minPremiumValuation,
        maxPremiumValuation,
      },
    };
    console.log("Saving report:", reportData);
    alert("Valuation report saved successfully!");
  };

  const hasValidData = lifetimeStreams > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate("/valuation")}
            className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
          >
            Back to Search
          </Button>

          <div className="flex items-center gap-3">
            <Badge
              variant="success"
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/50"></span>
                LTM Valuation
              </span>
            </Badge>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 rounded-full border border-purple-500/20">
              <Sparkles
                size={16}
                className="text-purple-600 dark:text-purple-400"
              />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Premium Feature
              </span>
            </div>
          </div>
        </div>

        {/* Warning banner if no valid data */}
        {!hasValidData && (
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-300 dark:border-red-500/50 shadow-xl">
            <div className="flex items-start gap-4 p-5">
              <div className="p-3 bg-red-500/20 rounded-xl flex-shrink-0">
                <Info size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
                  Insufficient Data
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  No lifetime stream data available. Please enter valid stream
                  counts to calculate valuation.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Artist Header Card */}
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white overflow-hidden relative shadow-2xl border-0">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/30 to-transparent rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/30 to-transparent rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="relative z-10 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full blur-2xl opacity-50" />
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 p-1 shadow-2xl ring-4 ring-white/30">
                  {artistData.image ? (
                    <img
                      src={artistData.image}
                      alt={artistData.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                      <Music size={48} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full p-3 shadow-xl ring-4 ring-slate-900">
                  <Music size={20} className="text-white" />
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left w-full">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                  <Music size={24} className="text-emerald-400" />
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                    {artistData.name}
                  </h1>
                </div>
                <p className="text-white/80 text-base mb-6">
                  Catalog Valuation Analysis
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/30 hover:bg-white/15 transition-all">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 bg-emerald-500/20 rounded-xl">
                        <DollarSign size={20} className="text-emerald-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">
                          Market Value
                        </p>
                        <h3 className="text-xl font-bold text-emerald-400">
                          {formatRange(minMarketValuation, maxMarketValuation, formatCurrency)}
                        </h3>
                        <p className="text-xs text-white/50 font-mono mt-1">
                          Market Est. Range
                        </p>
                        <p className="text-xs text-emerald-400">8x Multiple</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30 hover:bg-white/15 transition-all">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 bg-purple-500/20 rounded-xl">
                        <Music size={20} className="text-purple-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">
                          Monthly
                        </p>
                        <h3 className="text-xl font-bold text-white">
                          {formatRange(minMonthlyStreams, maxMonthlyStreams, formatToMillions)}
                        </h3>
                        <p className="text-xs text-white/50 font-mono mt-1">
                          Est. Monthly Range
                        </p>
                        <p className="text-xs text-white/70">Streams</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/30 hover:bg-white/15 transition-all">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <TrendingUp size={20} className="text-blue-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">
                          LTM Revenue
                        </p>
                        <h3 className="text-xl font-bold text-white">
                          {formatRange(minLtmRevenue, maxLtmRevenue, formatCurrency)}
                        </h3>
                        <p className="text-xs text-white/50 font-mono mt-1">
                          Annual Est. Range
                        </p>
                        <p className="text-xs text-blue-400">12 Months</p>
                      </div>
                    </div>
                  </div>

                 <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-orange-500/30 hover:bg-white/15 transition-all">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 bg-orange-500/20 rounded-xl">
                        <Globe size={20} className="text-orange-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">
                          Rate
                        </p>
                        <h3 className="text-xl font-bold text-white">
                          ${(effectiveSpotifyRate * 1000).toFixed(2)}
                        </h3>
                        <p className="text-xs text-white/70">per 1K</p>
                        <p className="text-xs text-orange-400 mt-1">Top 10 Tracks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stream Data Inputs */}
        <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-xl">
                <Music size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Stream Data
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enter lifetime streaming data
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <TrendingUp size={18} />
                  Lifetime Streams
                </label>
                <div className="relative w-full">
                  {/* TrendingUp icon on the left */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                    <TrendingUp size={20} />
                  </div>

                  <input
                    type="text"
                    value={formatNumber(
                      parseFloat(lifetimeStreamsInput.replace(/,/g, "")),
                    )}
                    onChange={(e) =>
                      setLifetimeStreamsInput(
                        e.target.value.replace(/[^0-9]/g, ""),
                      )
                    }
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Calendar size={18} />
                  Average Release Date
                </label>
                <div className="relative w-full">
                  {/* Calendar icon on the left */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                    <Calendar size={20} />
                  </div>

                  {/* DatePicker Input - wrapped in a full-width container */}
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
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                      calendarClassName="date-picker-calendar-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Info
                  size={20}
                  className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                />
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  <strong className="font-bold">Calculation Method:</strong>{" "}
{methodUsed === "RECENT_30D" && "Recent 30-day streams"}
                  {methodUsed === "RECENT_28D_NORMALIZED" &&
                    "Recent 28-day streams (normalized to 30 days)"}
                  {methodUsed === "LIFETIME_RUNRATE_ADJ" &&
                    `Lifetime Streams with Age Decay (${(getDecayFactor(monthsLive) * 100).toFixed(0)}% decay factor applied, ${monthsLive} months old)`}
                  {methodUsed === "TOP_TRACKS_FEATURED_ADJ" &&
                    "Based on Top 10 Tracks with Featured Adjustment"}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Payout Rate Card with Geo-Weighting */}
        <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
                <Globe
                  size={24}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Payout Rate
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {geoMethodUsed === "WEIGHTED"
                    ? "Geo-weighted Spotify payout rate"
                    : "Global average Spotify payout rate"}
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                  Effective Spotify Payout Rate:
                </span>
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${effectiveSpotifyRate.toFixed(4)}
                </span>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {geoMethodUsed === "WEIGHTED"
                  ? "Rate calculated based on geographic distribution of listeners"
                  : "Global average rate applied to all calculations"}
              </p>

              {geoMethodUsed === "WEIGHTED" && geoRateData.breakdown && (
                <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-500/30">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-3">
                    Geographic Breakdown (by listener count):
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(geoRateData.breakdown).map(
                      ([region, share]) => (
                        <div
                          key={region}
                          className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-emerald-200 dark:border-emerald-500/20"
                        >
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
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Calculation Breakdown */}
        <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
                <Calculator
                  size={24}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Revenue Calculation
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border-2 border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Monthly Streams (Est. Range)
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatRange(minMonthlyStreams, maxMonthlyStreams, formatNumber)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {methodUsed === "RECENT_30D" &&
                    "Based on recent 30-day streams"}
                  {methodUsed === "RECENT_28D_NORMALIZED" &&
                    "Based on recent 28-day streams"}
                  {methodUsed === "LIFETIME_RUNRATE_ADJ" &&
                    "Lifetime Streams with Age Decay"}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border-2 border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Spotify Payout Rate
                  </span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${effectiveSpotifyRate.toFixed(4)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {geoMethodUsed === "WEIGHTED"
                    ? "Geo-weighted"
                    : "Global average"}{" "}
                  Spotify payout rate
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border-2 border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Monthly Revenue (Est. Range)
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatRange(minMonthlyRevenue, maxMonthlyRevenue, formatCurrency)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Calculated based on {variance * 100}% variance for better accuracy
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-2 border-emerald-300 dark:border-emerald-500/30 rounded-xl p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                    Annual (LTM) Revenue Range
                  </span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRange(minLtmRevenue, maxLtmRevenue, formatCurrency)}
                  </span>
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Estimated annual earnings based on monthly run-rate range
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Valuation Ranges */}
        <Card className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
                <DollarSign
                  size={24}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Catalog Valuation Estimates
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calculator size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  Conservative
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  6x Revenue Multiple
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {formatRange(minConservativeValuation, maxConservativeValuation, formatCurrency)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border-2 border-emerald-400 dark:border-emerald-500/50 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <TrendingUp size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  Market
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  8x Revenue Multiple
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  {formatRange(minMarketValuation, maxMarketValuation, formatCurrency)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border-2 border-purple-300 dark:border-purple-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300 shadow-xl hover:shadow-2xl sm:col-span-2 lg:col-span-1">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <TrendingUp size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  Premium
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  10x Revenue Multiple
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {formatRange(minPremiumValuation, maxPremiumValuation, formatCurrency)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Methodology Notice */}
        <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border-2 border-blue-200 dark:border-blue-500/30 shadow-xl">
          <div className="flex items-start gap-4 p-6 sm:p-8">
            <div className="p-3 bg-blue-500/20 rounded-xl flex-shrink-0">
              <Info size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-4">
                Valuation Methodology
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 list-disc list-inside">
                <li>
                  Monthly streams calculated using priority: (1) Recent 30-day
                  data, (2) Recent 28-day data normalized, (3) Lifetime history
                  with age-based decay factors
                </li>
                <li>
                  Geo-weighted Spotify payout rates applied based on listener
                  geographic distribution
                </li>
                <li>
                  LTM (Last Twelve Months) revenue = monthly streams ×
                  geo-weighted payout rate × 12
                </li>
                <li>
                  Valuations calculated using revenue multiples (6x, 8x, 10x)
                </li>
                <li>
                  Decay factors applied when using lifetime method: 0-3mo
                  (100%), 4-12mo (85%), 13-36mo (65%), 36+mo (50%)
                </li>
                <li>
                  Regional rates: US/CA/UK/AU ($0.0042), EU West ($0.0036),
                  LATAM ($0.0018), Asia ($0.0022), Rest of World ($0.0016)
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center pt-4 pb-6">
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            size="lg"
            disabled={!hasValidData}
            className={`${hasValidData ? "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600" : "bg-slate-400 cursor-not-allowed"} text-white shadow-xl px-8 py-4 text-lg font-bold w-full sm:w-auto`}
          >
            Save Valuation Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArtistValuationDetail;
