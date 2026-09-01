import React from "react";
import { Info, BarChart3, TrendingUp, Music } from "lucide-react";
import { getCombinedCfaValuations, formatCurrency } from "../../core/calculations";

const SpotifyIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const YouTubeIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const CfaMasterValuation = ({ 
  selectedArtists, 
  compact = false,
  royaltyShare = 100,
  currency = 'USD',
  exchangeRates = { USD: 1 }
}) => {
  const masterData = getCombinedCfaValuations(selectedArtists);
  
  // Only show if there is actually data
  if (!masterData || masterData.annualRevenue === 0) return null;

  const formatAdjustedCurrency = (value) => {
    if (!value || isNaN(value)) return `${currency === 'USD' ? '$' : currency + ' '}0`;
    
    // 1. Apply royalty share
    let adjustedValue = value * (royaltyShare / 100);
    
    // 2. Apply currency conversion
    const rate = exchangeRates[currency] || 1;
    adjustedValue = adjustedValue * rate;
    
    // 3. Format with M/K/B suffix
    let formattedNum = "";
    if (adjustedValue >= 1000000000) {
      formattedNum = (adjustedValue / 1000000000).toFixed(2) + "B";
    } else if (adjustedValue >= 1000000) {
      formattedNum = (adjustedValue / 1000000).toFixed(2) + "M";
    } else if (adjustedValue >= 1000) {
      formattedNum = (adjustedValue / 1000).toFixed(2) + "K";
    } else {
      formattedNum = adjustedValue.toFixed(2);
    }
    
    // 4. Attach Currency symbol/code
    const prefix = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;
    return `${prefix}${formattedNum}`;
  };

  return (
    <div className={`bg-gradient-to-br from-[#0B101A] to-[#05080F] rounded-3xl overflow-hidden shadow-2xl relative border ${compact ? "border-transparent" : "border-[#1A2333]"} mb-8 mt-4`}>
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        
        {/* Required Disclaimer */}
        <div className={`flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl backdrop-blur-md mb-8 ${compact ? "mx-auto text-left" : ""}`}>
          <Info size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-white/80 text-sm font-medium leading-relaxed">
            <strong className="font-bold text-white block mb-1">ESTIMATED CATALOG VALUATION</strong>
            An estimated catalog valuation based only on publicly available streaming data.
          </p>
        </div>

        <div className={`flex ${compact ? "flex-col" : "flex-col xl:flex-row"} gap-8 items-center`}>
          
          {/* Main Valuation */}
          <div className={`flex-1 ${compact ? "text-center w-full" : "text-center xl:text-left"}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20 mb-4 ${compact ? "mx-auto" : ""}`}>
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Combined Platforms</span>
            </div>
            
            <h2 className={`font-black text-white mb-2 tracking-tight ${compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl lg:text-6xl"}`}>
              {formatAdjustedCurrency(masterData.midEstimate)}
            </h2>
            <p className="text-white/60 font-medium text-sm sm:text-base mb-8">
              Estimated Market Value (8x)
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Conservative (6x)</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{formatAdjustedCurrency(masterData.lowEstimate)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Premium (10x)</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{formatAdjustedCurrency(masterData.highEstimate)}</p>
              </div>
            </div>
          </div>

          {/* Breakdown List */}
          <div className={`w-full ${compact ? "max-w-md mx-auto" : "xl:w-96"} flex flex-col gap-3`}>
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 pl-1 text-left">Platform Breakdown</p>
            
            {["spotify", "itunes", "youtube"].map(platform => {
              const platformData = masterData.breakdown[platform];
              if (!platformData) return null;

              const isSpotify = platform === "spotify";
              const isApple = platform === "itunes";
              
              const label = isSpotify ? "Spotify" : isApple ? "Apple Music" : "YouTube";
              const color = isSpotify ? "text-emerald-400" : isApple ? "text-white" : "text-red-400";
              const bg = isSpotify ? "bg-emerald-500/20" : isApple ? "bg-white/20" : "bg-red-500/20";
              
              return (
                <div key={platform} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${bg}`}>
                      {isSpotify ? <SpotifyIcon size={18} className={color} /> : isApple ? <Music size={18} className={color} /> : <YouTubeIcon size={18} className={color} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="text-xs text-white/60">Est. LTM: {formatAdjustedCurrency(platformData.totalAnnualRevenue)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-white">{formatAdjustedCurrency(platformData.midEstimate)}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">8x Multiple</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CfaMasterValuation;
