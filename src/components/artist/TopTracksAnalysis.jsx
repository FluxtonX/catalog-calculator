import React from 'react';

const TopTracksAnalysis = ({ artistsData, forceLightMode = false }) => {
  if (!artistsData) return null;

  const activePlatforms = Object.entries(artistsData).filter(([p]) => p !== 'spotify_proxy' && p !== 'youtube_proxy');
  if (activePlatforms.length === 0) return null;

  const gridClass = activePlatforms.length === 1 
    ? 'grid-cols-1' 
    : activePlatforms.length === 2 
      ? 'grid-cols-1 md:grid-cols-2' 
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="w-full">
      <h2 className={`text-2xl font-bold mb-6 text-center ${forceLightMode ? 'text-slate-900' : 'text-white'}`}>Top Tracks Analysis</h2>
      <div className={`grid gap-6 w-full ${gridClass}`}>
        {activePlatforms.map(([platform, data]) => {
          const platformName = platform === 'spotify' ? 'Spotify' : platform === 'itunes' ? 'Apple Music' : platform === 'youtube' ? 'YouTube' : platform;
          
          let displayItems = [];
          if (data?.topTracks?.length > 0) {
            displayItems = data.topTracks.slice(0, 10).filter(t => t.title || t.name);
          } else if (data?.videos?.length > 0) {
            displayItems = data.videos.slice(0, 10).filter(t => t.title || t.name);
          } else if (data?.popularReleases?.length > 0) {
            displayItems = data.popularReleases.slice(0, 10).filter(t => t.title || t.name);
          } else if (platform === 'youtube') {
            // Fallback for YouTube to match layout consistency
            const formatCompact = (num) => {
              if (!num) return '-';
              const n = Number(num);
              return isNaN(n) ? '-' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
            };
            displayItems = [
              { title: 'Total Channel Views', streamCountFormatted: formatCompact(data.totalViews) },
              { title: 'Total Subscribers', streamCountFormatted: formatCompact(data.subscribers) },
              { title: 'Total Videos', streamCountFormatted: formatCompact(data.stats?.totalVideos) }
            ];
          }
          
          return (
            <div key={platform} className={`border p-5 rounded-2xl flex flex-col h-[350px] ${forceLightMode ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0B101A] border-[#1A2333] shadow-xl'}`}>
              <h3 className={`text-sm font-bold mb-4 tracking-wider uppercase ${forceLightMode ? 'text-slate-700' : 'text-[#00E5FF]'}`}>{platformName}</h3>
              <div className={`overflow-y-auto pr-2 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${forceLightMode ? '[&::-webkit-scrollbar-thumb]:bg-slate-200' : '[&::-webkit-scrollbar-thumb]:bg-white/10'}`}>
                {displayItems.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {displayItems.map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors border ${forceLightMode ? 'bg-white border-slate-100 hover:bg-slate-100 shadow-sm' : 'bg-white/5 hover:bg-white/10 border-white/5'}`}>
                        <span className={`font-bold w-5 text-right text-sm ${forceLightMode ? 'text-slate-400' : 'text-white/30'}`}>{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${forceLightMode ? 'text-slate-800' : 'text-white/90'}`}>{item.title || item.name || item.snippet?.title}</p>
                          {item.album && <p className={`text-[10px] truncate ${forceLightMode ? 'text-slate-500' : 'text-white/40'}`}>{item.album}</p>}
                        </div>
                        {(() => {
                          const val = item.streamCountFormatted || item.viewCountFormatted;
                          const isReal = val && val !== 'N/A' && val !== '0' && val !== 'null';
                          return isReal ? (
                            <span className={`text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap min-w-[50px] text-center ${forceLightMode ? 'bg-blue-50 text-blue-600' : 'text-[#00E5FF] bg-[#00E5FF]/10'}`}>
                              {val}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center h-full text-center p-5 border border-dashed rounded-xl gap-3 ${forceLightMode ? 'text-slate-400 border-slate-200' : 'text-white/40 border-white/10'}`}>
                    {platform === 'spotify' ? (
                      data?.error === 'premium_sync_pending' ? (
                        <>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${forceLightMode ? 'bg-amber-50' : 'bg-amber-500/10'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${forceLightMode ? 'text-amber-500' : 'text-amber-400'}`}>
                              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                          </div>
                          <p className={`text-sm font-bold ${forceLightMode ? 'text-slate-700' : 'text-white/90'}`}>
                            Spotify Premium Syncing
                          </p>
                          <p className={`text-[11px] leading-relaxed max-w-[250px] ${forceLightMode ? 'text-slate-500' : 'text-white/60'}`}>
                            Your developer account has just subscribed to Spotify Premium. <span className={`font-semibold ${forceLightMode ? 'text-amber-600' : 'text-amber-400'}`}>Spotify's API requires up to 24 hours to sync this change</span> before allowing requests. Please check back later.
                          </p>
                          <p className={`text-[10px] px-3 py-1.5 rounded-lg ${forceLightMode ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/10 text-amber-400/80 border border-amber-500/20'}`}>
                            This is a Spotify API restriction, not a developer error.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${forceLightMode ? 'bg-green-50' : 'bg-[#1DB954]/10'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${forceLightMode ? 'text-green-500' : 'text-[#1DB954]'}`}>
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          </div>
                          <p className={`text-sm font-bold ${forceLightMode ? 'text-slate-700' : 'text-white/70'}`}>
                            Spotify Track Data Restricted
                          </p>
                          <p className={`text-[11px] leading-relaxed max-w-[200px] ${forceLightMode ? 'text-slate-500' : 'text-white/40'}`}>
                            Spotify's API limits per-track stream data access. This is a <span className={`font-semibold ${forceLightMode ? 'text-green-600' : 'text-[#1DB954]'}`}>Spotify platform restriction</span>, not an error.
                          </p>
                          <p className={`text-[10px] px-3 py-1.5 rounded-lg ${forceLightMode ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-[#1DB954]/10 text-[#1DB954]/80 border border-[#1DB954]/20'}`}>
                            Track data available via Apple Music &amp; YouTube
                          </p>
                        </>
                      )
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 opacity-30 mb-1">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <p className={`text-xs ${forceLightMode ? 'text-slate-400' : 'text-white/30'}`}>No track data available for this platform.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopTracksAnalysis;
