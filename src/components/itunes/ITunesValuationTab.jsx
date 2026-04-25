// // src/components/itunes/iTunesValuationTab.jsx
// import React, { useMemo, useState } from "react";
// import { useEffect } from "react";
// import {
//   DollarSign,
//   Music,
//   TrendingUp,
//   BarChart3,
//   Info,
//   Disc3,
//   Star,
//   Globe,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";
// import { generateITunesValuationPDF } from "../../utils/itunesValuationPdfGenerator";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useArtistStore } from "../../store/artistStore";
// import { supabase } from "../../utils/supabase";

// import { Download, LogIn } from "lucide-react";

// // ── Apple Music payout rate (avg $0.01/stream — ~2.5x Spotify) ───
// const APPLE_MUSIC_RATE = 0.01;

// // ── Helpers ───────────────────────────────────────────────────────
// const formatCurrency = (n) => {
//   if (!n || isNaN(n)) return "$0";
//   if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
//   if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
//   if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
//   return `$${n.toFixed(0)}`;
// };

// const formatNumber = (n) => {
//   if (!n || isNaN(n)) return "0";
//   if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
//   if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
//   if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
//   return `${Math.round(n)}`;
// };

// // Estimate monthly streams from popularity score (0-100)
// // Apple Music popularity 100 ≈ ~100M streams/month, scaled down
// const estimateMonthlyStreams = (popularityScore) => {
//   if (!popularityScore) return 0;
//   return Math.round(Math.pow(popularityScore / 100, 2.5) * 10_000_000);
// };

// // Metric card component
// const MetricCard = ({
//   icon: Icon,
//   label,
//   value,
//   sub,
//   borderColor,
//   iconBg,
//   iconColor,
//   valueColor,
// }) => (
//   <div
//     className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 ${borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
//   >
//     <div className="flex flex-col items-center gap-2 text-center">
//       <div className={`p-2.5 ${iconBg} rounded-xl`}>
//         <Icon size={18} className={`sm:w-5 sm:h-5 ${iconColor}`} />
//       </div>
//       <div>
//         <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-1">
//           {label}
//         </p>
//         <p
//           className={`text-base sm:text-xl lg:text-2xl font-black ${valueColor}`}
//         >
//           {value}
//         </p>
//         {sub && (
//           <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
//             {sub}
//           </p>
//         )}
//       </div>
//     </div>
//   </div>
// );

// // Valuation scenario card
// const ScenarioCard = ({
//   label,
//   multiple,
//   value,
//   color,
//   gradient,
//   icon: Icon,
//   isHighlighted,
// }) => (
//   <div
//     className={`relative rounded-2xl p-4 sm:p-6 border-2 text-center transition-all duration-300 ${
//       isHighlighted
//         ? `${gradient} border-transparent shadow-2xl scale-105`
//         : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-1"
//     }`}
//   >
//     {isHighlighted && (
//       <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[10px] font-black text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-700 shadow-md">
//         MARKET RATE
//       </div>
//     )}
//     <div
//       className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${
//         isHighlighted ? "bg-white/20" : `bg-gradient-to-br ${color}`
//       }`}
//     >
//       <Icon
//         size={20}
//         className={`sm:w-6 sm:h-6 ${isHighlighted ? "text-white" : "text-white"}`}
//       />
//     </div>
//     <p
//       className={`text-sm sm:text-base font-black mb-1 ${isHighlighted ? "text-white" : "text-slate-900 dark:text-white"}`}
//     >
//       {label}
//     </p>
//     <p
//       className={`text-[10px] sm:text-xs mb-3 ${isHighlighted ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
//     >
//       {multiple}x Revenue Multiple
//     </p>
//     <p
//       className={`text-xl sm:text-3xl font-black ${isHighlighted ? "text-white" : color.includes("pink") ? "text-pink-600 dark:text-pink-400" : color.includes("blue") ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400"}`}
//     >
//       {formatCurrency(value)}
//     </p>
//   </div>
// );

// const ITunesValuationTab = ({ artistData }) => {
//   const { name, image, topTracks, albums, singles, stats, popularity, genres } =
//     artistData;
//   const [showMethodology, setShowMethodology] = useState(false);

//   // ── ADD THESE ──────────────────────────────────────────
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [user, setUser] = useState(undefined);
//   const [authLoading, setAuthLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//       setAuthLoading(false);
//     });
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//       setAuthLoading(false);
//     });
//     return () => subscription.unsubscribe();
//   }, []);

//   const handleSave = async () => {
//     if (!user) {
//       navigate("/auth", { state: { from: location } });
//       return;
//     }

//     const isProEnabled = false;
//     if (!isProEnabled) {
//       navigate("/pro-plan");
//       return;
//     }

//     try {
//       setIsSaving(true);
//       const reportData = {
//         artist: name,
//         date: new Date().toISOString(),
//         generatedBy: {
//           email: user.email,
//           provider: user.app_metadata?.provider || "unknown",
//           userId: user.id,
//         },
//         inputs: { platform: "itunes" },
//         calculations: {
//           avgPopularity: calculations.avgPopularity,
//           monthlyStreams: calculations.monthlyStreams,
//           monthlyRevenue: calculations.monthlyRevenue,
//           ltmRevenue: calculations.ltmRevenue,
//           catalogBonus: calculations.catalogBonus,
//           dealScore: calculations.dealScore,
//           totalAlbums: calculations.totalAlbums,
//           totalSingles: calculations.totalSingles,
//         },
//         valuations: {
//           conservative: calculations.conservative,
//           market: calculations.market,
//           premium: calculations.premium,
//         },
//       };
//       generateITunesValuationPDF(reportData);
//       const { error: saveError } = await supabase
//         .from("user_reports")
//         .insert([
//           {
//             user_id: user.id,
//             artist_name: name,
//             report_type: "itunes_valuation",
//             report_data: reportData,
//           },
//         ])
//         .select()
//         .single();
//       if (saveError) {
//         alert("PDF downloaded, but failed to save: " + saveError.message);
//         return;
//       }
//       if (window.confirm("Report saved!\n\nView saved reports?"))
//         navigate("/dashboard");
//     } catch {
//       alert("Error generating PDF. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };
//   // ── END ADD ─────────────────────────────────────────────

//   // ── Core calculations ──────────────────────────────────
//   const calculations = useMemo(() => {
//     // Calculate average from actual track data
//     const trackPopularities = topTracks
//       ?.map((t) => t.popularity ?? t.trackPopularity)
//       .filter((p) => typeof p === "number" && p > 0);

//  const totalAlbums = stats?.totalAlbums || albums?.length || 0;
// const totalSingles = singles?.length || 0;
// const totalTracks = stats?.totalTopTracks || topTracks?.length || 0;

// // Build a real score from actual catalog data
// const catalogScore = Math.min(
//   totalAlbums * 8 +      // each album = 8 points
//   totalSingles * 2 +     // each single = 2 points
//   totalTracks * 1,       // each track = 1 point
//   100
// );

// const avgPopularity = catalogScore > 0 ? catalogScore : 30;

//     // rest of calculations...

//     const monthlyStreams = estimateMonthlyStreams(avgPopularity);
//     const monthlyRevenue = monthlyStreams * APPLE_MUSIC_RATE;
//     const ltmRevenue = monthlyRevenue * 12;



//     // Catalog depth bonus (more releases = more passive income)
//     const catalogBonus = Math.min(
//       totalAlbums * 0.05 + totalSingles * 0.01,
//       0.5,
//     );
//     const adjustedLtm = ltmRevenue * (1 + catalogBonus);

//     const conservative = adjustedLtm * 6;
//     const market = adjustedLtm * 8;
//     const premium = adjustedLtm * 10;

//     // Deal score: 0-100 based on catalog depth + popularity
//     const dealScore = Math.round(
//       Math.min(
//         avgPopularity * 0.5 +
//           totalAlbums * 2 +
//           totalTracks * 0.5 +
//           (monthlyStreams > 10_000_000
//             ? 20
//             : monthlyStreams > 1_000_000
//               ? 10
//               : 0),
//         100,
//       ),
//     );

//     return {
//       avgPopularity,
//       monthlyStreams,
//       monthlyRevenue,
//       ltmRevenue: adjustedLtm,
//       conservative,
//       market,
//       premium,
//       dealScore,
//       totalAlbums,
//       totalSingles,
//       totalTracks,
//       catalogBonus: catalogBonus * 100,
//     };
//   }, [stats, popularity, albums, singles, topTracks]);

//   const dealScoreColor =
//     calculations.dealScore >= 70
//       ? "text-emerald-600 dark:text-emerald-400"
//       : calculations.dealScore >= 40
//         ? "text-yellow-600 dark:text-yellow-400"
//         : "text-slate-500 dark:text-slate-400";

//   const dealScoreLabel =
//     calculations.dealScore >= 70
//       ? "Strong Deal"
//       : calculations.dealScore >= 40
//         ? "Moderate Interest"
//         : "Developing Artist";

//   return (
//     <div className="space-y-5 sm:space-y-7">
//       {/* ── Header banner ────────────────────────────────── */}
//       <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 p-5 sm:p-8 shadow-2xl">
//         <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
//         <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

//         <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
//           {image && (
//             <img
//               src={image}
//               alt={name}
//               className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover shadow-xl ring-2 ring-white/30 flex-shrink-0"
//             />
//           )}
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
//                 Apple Music Valuation
//               </span>
//             </div>
//             <h2 className="text-xl sm:text-3xl font-black text-white truncate mb-2">
//               {name}
//             </h2>
//             {genres?.length > 0 && (
//               <div className="flex flex-wrap gap-1.5">
//                 {genres.slice(0, 3).map((g, i) => (
//                   <span
//                     key={i}
//                     className="px-2.5 py-0.5 bg-white/15 rounded-full text-white text-[10px] font-bold capitalize"
//                   >
//                     {g}
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>
//           {/* Deal score */}
//           <div className="flex-shrink-0 text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20">
//             <p className="text-white/70 text-[10px] font-bold uppercase tracking-wide mb-1">
//               Deal Score
//             </p>
//             <p className="text-3xl sm:text-4xl font-black text-white">
//               {calculations.dealScore}
//             </p>
//             <p className="text-white/80 text-[10px] font-bold">
//               {dealScoreLabel}
//             </p>
//           </div>
//         </div>

//         {/* Key metrics row inside banner */}
//         <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 mt-5 sm:mt-6">
//           {[
//            {
//   label: "Monthly Streams (est.)",
//   value: formatNumber(calculations.monthlyStreams),
//   note: "Estimated from popularity score of Top 10 Tracks — not real stream data",
// },
//             {
//               label: "Monthly Revenue (est.)",
//               value: formatCurrency(calculations.monthlyRevenue),
//             },
//             {
//               label: "LTM Revenue (est.)",
//               value: formatCurrency(calculations.ltmRevenue),
//             },
//           ].map(({ label, value, note }) => (
//             <div
//               key={label}
//               className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/15 text-center"
//             >
//               <p className="text-white/70 text-[9px] sm:text-xs font-bold uppercase tracking-wide mb-1">
//                 {label}
//               </p>
//               <p className="text-white font-black text-sm sm:text-xl">
//                 {value}
//               </p>
//               {note && <p className="text-white/50 text-[9px] mt-1">{note}</p>}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── Detailed metrics ─────────────────────────────── */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//         <MetricCard
//           icon={Music}
//           label="Avg Popularity"
//           value={`${Math.round(calculations.avgPopularity)}/100`}
//           sub="Apple Music score"
//           borderColor="border-pink-200 dark:border-pink-800/40"
//           iconBg="bg-pink-500/15"
//           iconColor="text-pink-600 dark:text-pink-400"
//           valueColor="text-pink-600 dark:text-pink-400"
//         />
//         <MetricCard
//           icon={Globe}
//           label="Payout Rate"
//           value="$0.0100"
//           sub="per stream"
//           borderColor="border-rose-200 dark:border-rose-800/40"
//           iconBg="bg-rose-500/15"
//           iconColor="text-rose-600 dark:text-rose-400"
//           valueColor="text-rose-600 dark:text-rose-400"
//         />
//         <MetricCard
//           icon={Disc3}
//           label="Catalog Depth"
//           value={`${calculations.totalAlbums}A / ${calculations.totalSingles}S`}
//           sub="Albums / Singles"
//           borderColor="border-red-200 dark:border-red-800/40"
//           iconBg="bg-red-500/15"
//           iconColor="text-red-600 dark:text-red-400"
//           valueColor="text-red-600 dark:text-red-400"
//         />
//         <MetricCard
//           icon={Star}
//           label="Catalog Bonus"
//           value={`+${calculations.catalogBonus.toFixed(0)}%`}
//           sub="LTM adjustment"
//           borderColor="border-purple-200 dark:border-purple-800/40"
//           iconBg="bg-purple-500/15"
//           iconColor="text-purple-600 dark:text-purple-400"
//           valueColor="text-purple-600 dark:text-purple-400"
//         />
//       </div>

//       {/* ── Valuation scenarios ───────────────────────────── */}
//       <div>
//         <div className="flex items-center gap-3 mb-4 sm:mb-5">
//           <div className="p-2.5 bg-pink-500/15 rounded-xl">
//             <BarChart3 size={20} className="text-pink-600 dark:text-pink-400" />
//           </div>
//           <div>
//             <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
//               Valuation Scenarios
//             </h3>
//             <p className="text-xs text-slate-500 dark:text-slate-400">
//               Based on Apple Music payout rates & catalog analysis
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
//           <ScenarioCard
//             label="Conservative"
//             multiple={6}
//             value={calculations.conservative}
//             color="from-blue-400 to-blue-600"
//             icon={TrendingUp}
//             isHighlighted={false}
//           />
//           <ScenarioCard
//             label="Market"
//             multiple={8}
//             value={calculations.market}
//             color="from-pink-400 to-rose-600"
//             gradient="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500"
//             icon={DollarSign}
//             isHighlighted={true}
//           />
//           <ScenarioCard
//             label="Premium"
//             multiple={10}
//             value={calculations.premium}
//             color="from-purple-400 to-purple-600"
//             icon={Star}
//             isHighlighted={false}
//           />
//         </div>
//       </div>

//       {/* ── Revenue breakdown bar ────────────────────────── */}
//       <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xl">
//         <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-4">
//           Revenue Comparison vs. Spotify
//         </h3>
//         <div className="space-y-3">
//           {[
//             {
//               label: "Apple Music (est.)",
//               rate: APPLE_MUSIC_RATE,
//               color: "bg-gradient-to-r from-pink-500 to-rose-500",
//               pct: 100,
//             },
//             {
//               label: "Spotify (avg.)",
//               rate: 0.004,
//               color: "bg-gradient-to-r from-emerald-500 to-green-500",
//               pct: 40,
//             },
//           ].map(({ label, rate, color, pct }) => (
//             <div key={label}>
//               <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
//                 <span>{label}</span>
//                 <span className="font-black text-slate-900 dark:text-white">
//                   ${rate.toFixed(4)}/stream
//                 </span>
//               </div>
//               <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full ${color} rounded-full transition-all duration-700`}
//                   style={{ width: `${pct}%` }}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//         <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-3">
//           Apple Music pays ~$0.01/stream vs Spotify's average
//           $0.003–$0.005/stream (2025 industry rates). Actual payouts vary by
//           region, subscription tier, and label agreement.
//         </p>
//       </div>

//       {/* ── Methodology toggle ───────────────────────────── */}
//       <div className="bg-gradient-to-r from-slate-50 to-pink-50/30 dark:from-slate-900 dark:to-pink-950/20 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
//         <button
//           onClick={() => setShowMethodology((v) => !v)}
//           className="w-full flex items-center justify-between gap-3 p-4 sm:p-5"
//         >
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-500/15 rounded-xl">
//               <Info size={16} className="text-blue-600 dark:text-blue-400" />
//             </div>
//             <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
//               Methodology & Notes
//             </span>
//           </div>
//           {showMethodology ? (
//             <ChevronUp size={18} className="text-slate-400" />
//           ) : (
//             <ChevronDown size={18} className="text-slate-400" />
//           )}
//         </button>

//         {showMethodology && (
//           <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5">
//             <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
//               <li>
//                 Monthly stream estimates are derived from Apple Music popularity
//                 scores (0–100) using an exponential model where 100 = ~10M
//                 streams/month, 50 = ~1.8M streams/month.
//               </li>
//               <li>
//                 Apple Music payout rate used:{" "}
//                 <strong className="text-slate-900 dark:text-white">
//                   $0.01 per stream
//                 </strong>{" "}
//                 (industry average as of 2024).
//               </li>
//               <li>
//                 LTM (Last Twelve Months) Revenue = Monthly Streams × Rate × 12,
//                 adjusted for catalog depth.
//               </li>
//               <li>
//                 Catalog bonus adds up to +50% based on number of albums and
//                 singles in the artist's discography.
//               </li>
//               <li>
//                 Valuations use revenue multiples: Conservative (6×), Market
//                 (8×), Premium (10×).
//               </li>
//               <li>
//                 Deal Score (0–100) combines popularity, catalog depth, and
//                 stream volume estimates.
//               </li>
//               <li>
//                 <strong className="text-slate-900 dark:text-white">
//                   Disclaimer:
//                 </strong>{" "}
//                 These are estimates only. Actual royalties vary by territory,
//                 subscription tier, and label agreements.
//               </li>
//             </ul>
//           </div>
//         )}
//       </div>
//       {/* ── Save / Download PDF ──────────────────────────── */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xl">
//         <div>
//           <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
//             Download Apple Music Valuation Report
//           </p>
//           <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
//             Save a PDF copy of this full analysis
//           </p>
//         </div>
//         <button
//           onClick={handleSave}
//           disabled={isSaving}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
//         >
//           {isSaving ? (
//             <>
//               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//               Generating...
//             </>
//           ) : (
//             <>
//               <Download size={16} />
//               Download PDF Report
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ITunesValuationTab;


// src/components/itunes/iTunesValuationTab.jsx
//
// ⚠️  VALUATION MODEL NOTES
// ─────────────────────────────────────────────────────────────────────────────
// Apple Music API does NOT expose:
//   • Real stream counts
//   • Popularity scores (0–100 like Spotify)
//   • Play counts
//
// Apple Music Analytics API (which does have real data) is restricted to
// labels/distributors and is NOT available in public-facing apps.
//
// Therefore, ALL stream estimates in this component are catalog-based proxies,
// not real data.  Every number the user sees is clearly labelled as an estimate.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState, useEffect } from "react";
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
  Download,
  AlertTriangle,
} from "lucide-react";
import { generateITunesValuationPDF } from "../../utils/itunesValuationPdfGenerator";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabase";

// ── Apple Music average payout (USD per stream, 2024 industry average) ──────
const APPLE_MUSIC_RATE_PER_STREAM = 0.01;

// ── Revenue multiples for acquisition/licensing scenarios ───────────────────
const MULTIPLES = { conservative: 6, market: 8, premium: 10 };

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

const formatCurrency = (n) => {
  if (!n || isNaN(n)) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};

const formatNumber = (n) => {
  if (!n || isNaN(n)) return "0";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Core valuation model
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derive a 0–100 catalog score from countable API metadata.
 * Weights are intentionally conservative — albums matter most because
 * they represent the deepest passive-income catalog.
 *
 *   albums  × 5  → max ~40 pts for a 8-album catalog
 *   singles × 2  → meaningful but not inflated
 *   tracks  × 1  → volume bonus
 *
 * Clamped at 100 so the score stays meaningful.
 */
const buildCatalogScore = ({ totalAlbums, totalSingles, totalTracks }) => {
  const raw = totalAlbums * 5 + totalSingles * 2 + totalTracks * 1;
  return Math.min(raw, 100);
};

/**
 * Tier-based monthly stream range.
 *
 * Because Apple Music does not expose real stream counts, we bucket
 * artists by catalog score into three tiers and return a {low, mid, high}
 * range.  The UI shows the range, not a fake precise number.
 *
 *   Score < 30  → developing  → 100K – 1M   streams/month
 *   Score 30–70 → mid-level   → 1M   – 10M  streams/month
 *   Score > 70  → established → 10M  – 100M streams/month
 */
const estimateStreamRange = (catalogScore) => {
  if (catalogScore < 30) {
    return { low: 100_000, mid: 550_000, high: 1_000_000, tier: "Developing" };
  }
  if (catalogScore <= 70) {
    return { low: 1_000_000, mid: 5_500_000, high: 10_000_000, tier: "Mid-Level" };
  }
  return { low: 10_000_000, mid: 55_000_000, high: 100_000_000, tier: "Established" };
};

/**
 * Catalog depth bonus applied to LTM revenue.
 * More releases = more passive income potential.
 * Capped at +50% so it doesn't distort results wildly.
 */
const buildCatalogBonus = ({ totalAlbums, totalSingles }) =>
  Math.min(totalAlbums * 0.05 + totalSingles * 0.01, 0.5);

/**
 * Deal score: 0–100.
 * Uses catalog score (60%) + album depth (30%) + track volume (10%).
 */
const buildDealScore = ({ catalogScore, totalAlbums, totalTracks }) => {
  const raw =
    catalogScore * 0.6 +
    totalAlbums  * 1.5 +
    totalTracks  * 0.2;
  return Math.min(Math.round(raw), 100);
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Generic stat card */
const MetricCard = ({
  icon: Icon,
  label,
  value,
  sub,
  borderColor,
  iconBg,
  iconColor,
  valueColor,
}) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border-2 ${borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
  >
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={`p-2.5 ${iconBg} rounded-xl`}>
        <Icon size={18} className={`sm:w-5 sm:h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className={`text-base sm:text-xl lg:text-2xl font-black ${valueColor}`}>
          {value}
        </p>
        {sub && (
          <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            {sub}
          </p>
        )}
      </div>
    </div>
  </div>
);

/** Valuation scenario card (conservative / market / premium) */
const ScenarioCard = ({
  label,
  multiple,
  value,
  color,
  gradient,
  icon: Icon,
  isHighlighted,
}) => (
  <div
    className={`relative rounded-2xl p-4 sm:p-6 border-2 text-center transition-all duration-300 ${
      isHighlighted
        ? `${gradient} border-transparent shadow-2xl scale-105`
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-1"
    }`}
  >
    {isHighlighted && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[10px] font-black text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-700 shadow-md">
        MARKET RATE
      </div>
    )}
    <div
      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${
        isHighlighted ? "bg-white/20" : `bg-gradient-to-br ${color}`
      }`}
    >
      <Icon size={20} className="sm:w-6 sm:h-6 text-white" />
    </div>
    <p
      className={`text-sm sm:text-base font-black mb-1 ${
        isHighlighted ? "text-white" : "text-slate-900 dark:text-white"
      }`}
    >
      {label}
    </p>
    <p
      className={`text-[10px] sm:text-xs mb-3 ${
        isHighlighted ? "text-white/80" : "text-slate-500 dark:text-slate-400"
      }`}
    >
      {multiple}× Revenue Multiple
    </p>
    <p
      className={`text-xl sm:text-3xl font-black ${
        isHighlighted
          ? "text-white"
          : color.includes("pink")
          ? "text-pink-600 dark:text-pink-400"
          : color.includes("blue")
          ? "text-blue-600 dark:text-blue-400"
          : "text-purple-600 dark:text-purple-400"
      }`}
    >
      {formatCurrency(value)}
    </p>
  </div>
);

/** Prominent data-limitation disclaimer banner */
const DataLimitationBanner = () => (
  <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 sm:p-5">
    <div className="flex-shrink-0 mt-0.5 p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
      <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
    </div>
    <div>
      <p className="text-xs sm:text-sm font-black text-amber-800 dark:text-amber-300 mb-1">
        Apple Music does not provide public stream counts
      </p>
      <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
        All values below are estimated using{" "}
        <strong>catalog-based modeling</strong> (album count, singles, tracks).
        Real streaming data is only accessible to rights holders via Apple Music
        Analytics. These figures are for illustrative purposes only and should
        not be used as the sole basis for financial decisions.
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const ITunesValuationTab = ({ artistData }) => {
  const { name, image, topTracks, albums, singles, stats, genres } = artistData;

  const [showMethodology, setShowMethodology] = useState(false);
  const [user, setUser]                       = useState(undefined);
  const [authLoading, setAuthLoading]         = useState(true);
  const [isSaving, setIsSaving]               = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [showPayoutInfo, setShowPayoutInfo] = useState(false);

  // ── Auth state ────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Calculations (memoised) ───────────────────────────────────────────────
  const calculations = useMemo(() => {
    // ── 1. Catalog counts (sourced from real API metadata fields) ──────────
    const totalAlbums  = stats?.totalAlbums  ?? albums?.length  ?? 0;
    const totalSingles = singles?.length     ?? 0;
    const totalTracks  = stats?.totalTopTracks ?? topTracks?.length ?? 0;

    // ── 2. Catalog score: 0–100, purely from countable metadata ───────────
    const catalogScore = buildCatalogScore({ totalAlbums, totalSingles, totalTracks });

    // ── 3. Stream range: tier-based, NOT a fake precise number ─────────────
    const streamRange = estimateStreamRange(catalogScore);

    // ── 4. Revenue — use midpoint of stream range as working estimate ──────
    const estimatedMonthlyStreams  = streamRange.mid;
    const monthlyRevenue           = estimatedMonthlyStreams * APPLE_MUSIC_RATE_PER_STREAM;
    const annualRevenue            = monthlyRevenue * 12;

    // ── 5. Catalog depth bonus (+0–50% on annual revenue) ──────────────────
    const catalogBonusPct          = buildCatalogBonus({ totalAlbums, totalSingles });
    const ltmRevenue               = annualRevenue * (1 + catalogBonusPct);

    // ── 6. Valuations at 3 multiples ───────────────────────────────────────
    const conservative = ltmRevenue * MULTIPLES.conservative;
    const market       = ltmRevenue * MULTIPLES.market;
    const premium      = ltmRevenue * MULTIPLES.premium;

    // ── 7. Deal score ───────────────────────────────────────────────────────
    const dealScore = buildDealScore({ catalogScore, totalAlbums, totalTracks });

    return {
      // catalog data
      totalAlbums,
      totalSingles,
      totalTracks,
      catalogScore,
      // stream range (shown as a range in the UI, not a single number)
      streamRangeLow:   streamRange.low,
      streamRangeMid:   streamRange.mid,
      streamRangeHigh:  streamRange.high,
      streamTier:       streamRange.tier,
      // revenue
      monthlyRevenue,
      ltmRevenue,
      catalogBonusPct: catalogBonusPct * 100,
      // valuations
      conservative,
      market,
      premium,
      // deal score
      dealScore,
    };
  }, [stats, albums, singles, topTracks]);

  // ── Deal score label & colour ─────────────────────────────────────────────
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

  // ── PDF save handler ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) {
      navigate("/auth", { state: { from: location } });
      return;
    }

    // Guard: Pro plan required
    const isProEnabled = false;
    if (!isProEnabled) {
      navigate("/pro-plan");
      return;
    }

    try {
      setIsSaving(true);

      const reportData = {
        artist: name,
        date:   new Date().toISOString(),
        generatedBy: {
          email:    user.email,
          provider: user.app_metadata?.provider || "unknown",
          userId:   user.id,
        },
        inputs: { platform: "itunes" },
        calculations: {
          catalogScore:     calculations.catalogScore,
          streamTier:       calculations.streamTier,
          streamRangeLow:   calculations.streamRangeLow,
          streamRangeMid:   calculations.streamRangeMid,
          streamRangeHigh:  calculations.streamRangeHigh,
          monthlyRevenue:   calculations.monthlyRevenue,
          ltmRevenue:       calculations.ltmRevenue,
          catalogBonusPct:  calculations.catalogBonusPct,
          dealScore:        calculations.dealScore,
          totalAlbums:      calculations.totalAlbums,
          totalSingles:     calculations.totalSingles,
          totalTracks:      calculations.totalTracks,
        },
        valuations: {
          conservative: calculations.conservative,
          market:       calculations.market,
          premium:      calculations.premium,
        },
      };

      generateITunesValuationPDF(reportData);

      const { error: saveError } = await supabase
        .from("user_reports")
        .insert([
          {
            user_id:     user.id,
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

      if (window.confirm("Report saved!\n\nView saved reports?")) {
        navigate("/dashboard");
      }
    } catch {
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 sm:space-y-7">

      {/* ── Data limitation disclaimer ─────────────────────────────────── */}
      <DataLimitationBanner />

      {/* ── Header banner ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 p-5 sm:p-8 shadow-2xl">
        {/* decorative blobs */}
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
            <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
              Apple Music Catalog Valuation
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white truncate mt-1 mb-2">
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

          {/* Deal score badge */}
          <div className="flex-shrink-0 text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20">
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wide mb-1">
              Deal Score
            </p>
            <p className="text-3xl sm:text-4xl font-black text-white">
              {calculations.dealScore}
            </p>
            <p className="text-white/80 text-[10px] font-bold">{dealScoreLabel}</p>
          </div>
        </div>

        {/* Key metrics row */}
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 mt-5 sm:mt-6">

          {/* Stream range — shown as a range, never a fake precise figure */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/15 text-center">
            <p className="text-white/70 text-[9px] sm:text-xs font-bold uppercase tracking-wide mb-1">
              Est. Stream Range / mo
            </p>
            <p className="text-white font-black text-xs sm:text-base">
              {formatNumber(calculations.streamRangeLow)}
              {" – "}
              {formatNumber(calculations.streamRangeHigh)}
            </p>
            <p className="text-white/50 text-[9px] mt-1">
              {calculations.streamTier} tier · catalog model
            </p>
          </div>

          {/* Monthly revenue (midpoint) */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/15 text-center">
            <p className="text-white/70 text-[9px] sm:text-xs font-bold uppercase tracking-wide mb-1">
              Est. Monthly Revenue
            </p>
            <p className="text-white font-black text-sm sm:text-xl">
              {formatCurrency(calculations.monthlyRevenue)}
            </p>
            <p className="text-white/50 text-[9px] mt-1">midpoint estimate</p>
          </div>

          {/* LTM revenue */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/15 text-center">
            <p className="text-white/70 text-[9px] sm:text-xs font-bold uppercase tracking-wide mb-1">
              Est. LTM Revenue
            </p>
            <p className="text-white font-black text-sm sm:text-xl">
              {formatCurrency(calculations.ltmRevenue)}
            </p>
            <p className="text-white/50 text-[9px] mt-1">
              incl. +{calculations.catalogBonusPct.toFixed(0)}% catalog bonus
            </p>
          </div>

        </div>
      </div>

      {/* ── Catalog metrics ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          icon={Music}
          label="Catalog Score"
          value={`${Math.round(calculations.catalogScore)}/100`}
          sub="Albums + singles + tracks"
          borderColor="border-pink-200 dark:border-pink-800/40"
          iconBg="bg-pink-500/15"
          iconColor="text-pink-600 dark:text-pink-400"
          valueColor="text-pink-600 dark:text-pink-400"
        />
      <div className="relative">
  <MetricCard
    icon={Globe}
    label="Payout Rate"
    value="$0.0100"
    sub="per stream (avg 2024)"
    borderColor="border-rose-200 dark:border-rose-800/40"
    iconBg="bg-rose-500/15"
    iconColor="text-rose-600 dark:text-rose-400"
    valueColor="text-rose-600 dark:text-rose-400"
  />

  {/* Info button */}
  <button
    onClick={() => setShowPayoutInfo((v) => !v)}
    className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-slate-800 hover:bg-white"
  >
    <Info size={14} className="text-slate-500" />
  </button>

  {/* Tooltip */}
  {showPayoutInfo && (
    <div className="absolute z-20 top-10 right-0 w-64 p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
      <p className="font-bold mb-1">About this rate</p>
      <p className="text-slate-600 dark:text-slate-400">
        This is a blended global average (~$0.01 per stream).
        It is <strong>not geo-weighted</strong>.
        Actual payouts vary significantly by country, subscription tier,
        and label agreements.
      </p>
    </div>
  )}
</div>
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
          value={`+${calculations.catalogBonusPct.toFixed(0)}%`}
          sub="LTM adjustment"
          borderColor="border-purple-200 dark:border-purple-800/40"
          iconBg="bg-purple-500/15"
          iconColor="text-purple-600 dark:text-purple-400"
          valueColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* ── Valuation scenarios ─────────────────────────────────────────── */}
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
              Based on catalog-estimated revenue & standard M&A multiples
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <ScenarioCard
            label="Conservative"
            multiple={MULTIPLES.conservative}
            value={calculations.conservative}
            color="from-blue-400 to-blue-600"
            icon={TrendingUp}
            isHighlighted={false}
          />
          <ScenarioCard
            label="Market"
            multiple={MULTIPLES.market}
            value={calculations.market}
            color="from-pink-400 to-rose-600"
            gradient="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500"
            icon={DollarSign}
            isHighlighted={true}
          />
          <ScenarioCard
            label="Premium"
            multiple={MULTIPLES.premium}
            value={calculations.premium}
            color="from-purple-400 to-purple-600"
            icon={Star}
            isHighlighted={false}
          />
        </div>
      </div>

      {/* ── Revenue comparison bar ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xl">
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-4">
          Platform Payout Comparison
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "Apple Music (avg.)",
              rate: APPLE_MUSIC_RATE_PER_STREAM,
              color: "bg-gradient-to-r from-pink-500 to-rose-500",
              pct: 100,
            },
            {
              label: "Spotify (avg.)",
              rate: 0.004,
              color: "bg-gradient-to-r from-emerald-500 to-green-500",
              pct: 40,
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
          Apple Music pays ~$0.01/stream vs Spotify's average $0.003–$0.005/stream
          (2024 industry rates). Actual payouts vary by region, subscription tier,
          and label agreement.
        </p>
      </div>

      {/* ── Methodology ────────────────────────────────────────────────── */}
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
              Methodology & Limitations
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
                <strong className="text-slate-900 dark:text-white">
                  No real stream data:
                </strong>{" "}
                Apple Music API does not expose stream counts or popularity
                scores in public catalog endpoints. Apple Music Analytics (which
                does) is restricted to verified rights holders.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">
                  Catalog Score (0–100):
                </strong>{" "}
                Computed from countable metadata —{" "}
                <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  (albums × 5) + (singles × 2) + (tracks × 1)
                </code>
                , clamped to 100.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">
                  Stream range (tier model):
                </strong>{" "}
                Score &lt; 30 → 100K–1M/mo; 30–70 → 1M–10M/mo; &gt; 70 →
                10M–100M/mo. Revenue uses the midpoint of each range.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">
                  Payout rate:
                </strong>{" "}
                $0.01 per stream (Apple Music 2024 industry average).
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">
                  Catalog bonus:
                </strong>{" "}
                Up to +50% applied to LTM revenue based on release depth
                (albums × 5%, singles × 1%).
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">
                  Valuation multiples:
                </strong>{" "}
                Conservative 6×, Market 8×, Premium 10× of LTM revenue — 
                standard music-catalog M&A range (2023–2024).
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">
                  Deal Score:
                </strong>{" "}
                <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  (catalogScore × 0.6) + (albums × 1.5) + (tracks × 0.2)
                </code>
                , clamped to 100.
              </li>
              <li>
                <strong className="text-red-600 dark:text-red-400">
                  Disclaimer:
                </strong>{" "}
                All figures are illustrative estimates. Actual royalties vary by
                territory, subscription tier, label agreement, and time period.
                Do not use these numbers as the sole basis for financial
                decisions.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* ── Download PDF ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xl">
        <div>
          <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            Download Apple Music Valuation Report
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Save a PDF copy of this full catalog-based analysis
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