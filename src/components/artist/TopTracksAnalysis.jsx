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
            displayItems = data.topTracks.slice(0, 10);
          } else if (data?.videos?.length > 0) {
            displayItems = data.videos.slice(0, 10);
          } else if (data?.popularReleases?.length > 0) {
            displayItems = data.popularReleases.slice(0, 10);
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
                        {(item.streamCountFormatted || item.viewCountFormatted) && (
                          <span className={`text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap min-w-[50px] text-center ${forceLightMode ? 'bg-blue-50 text-blue-600' : 'text-[#00E5FF] bg-[#00E5FF]/10'}`}>
                            {item.streamCountFormatted || item.viewCountFormatted}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`flex items-center justify-center h-full text-xs text-center p-4 border border-dashed rounded-xl ${forceLightMode ? 'text-slate-400 border-slate-200' : 'text-white/40 border-white/10'}`}>
                    Detailed data is not available for this platform.
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
