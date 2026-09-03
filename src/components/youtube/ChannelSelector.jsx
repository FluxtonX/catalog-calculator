// src/components/youtube/ChannelSelector.jsx
import React from "react";
import { Users, Eye, ExternalLink } from "lucide-react";
import Card from "../common/Card";
import Badge from "../common/Badge";

const ChannelSelector = ({ channels, onSelectChannel, isLoading }) => {
  if (!channels || channels.length === 0) return null;
  // ✅ ADD: Sort channels by subscribers (descending)
  const sortedChannels = [...channels].sort((a, b) => {
    const subsA = a.subscribers || 0;
    const subsB = b.subscribers || 0;
    return subsB - subsA; // Descending order (highest first)
  });

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-800 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl">
          <Users size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Official YouTube Channel Found
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Click 'Calculate Royalties' to proceed with the highest-subscribed official channel. If this is incorrect, please verify the artist's name and try again.
          </p>
        </div>
      </div>

      <div className="py-2">
        {sortedChannels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            disabled={isLoading}
            className="w-full group flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-slate-200 dark:border-slate-700 hover:border-red-500/50 dark:hover:border-red-500/50 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Channel Image */}
            <div className="relative w-full md:w-1/3 lg:w-1/4 aspect-video shrink-0 overflow-hidden rounded-xl shadow-md">
              {channel.image ? (
                <img
                  src={channel.image}
                  alt={channel.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23dc2626' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='40'%3EYT%3C/text%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                  <Users size={48} className="text-white opacity-50" />
                </div>
              )}
            </div>

            {/* Channel Info */}
            <div className="flex-1 flex flex-col justify-center w-full">
              <h3 className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mb-4 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {channel.name}
              </h3>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                {/* Subscribers */}
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <Users size={18} className="text-red-500" />
                  <span className="font-bold text-lg text-slate-900 dark:text-white">
                    {channel.subscribersFormatted ||
                      formatNumber(channel.subscribers)}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">subscribers</span>
                </div>

                {/* Total Views */}
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <Eye size={18} className="text-red-500" />
                  <span className="font-bold text-lg text-slate-900 dark:text-white">
                    {channel.totalViewsFormatted ||
                      formatNumber(channel.totalViews)}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">views</span>
                </div>
              </div>

              {/* Description */}
              {channel.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 max-w-2xl">
                  {channel.description}
                </p>
              )}
            </div>

            {/* Select Button */}
            <div className="mt-4 md:mt-0 flex items-center justify-center shrink-0 w-full md:w-auto">
               <div className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                 <ExternalLink size={18} />
                 Calculate Royalties
               </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default ChannelSelector;
