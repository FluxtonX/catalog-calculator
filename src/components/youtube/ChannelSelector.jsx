// src/components/youtube/ChannelSelector.jsx
import React from "react";
import { Users, Eye, ExternalLink } from "lucide-react";
import Card from "../common/Card";
import Badge from "../common/Badge";


const ChannelSelector = ({ channels, onSelectChannel, isLoading }) => {
  if (!channels || channels.length === 0) return null;

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
            Select the Correct YouTube Channel
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose the official artist channel to view valuation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {channels.map((channel, index) => (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            disabled={isLoading}
            className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-slate-200 dark:border-slate-700 hover:border-red-500/50 dark:hover:border-red-500/50 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Channel Image */}
            <div className="relative mb-3 overflow-hidden rounded-lg">
              {channel.image ? (
                <img
                  src={channel.image}
                  alt={channel.name}
                  className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23dc2626' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='40'%3EYT%3C/text%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                  <Users size={48} className="text-white opacity-50" />
                </div>
              )}
            </div>

            {/* Channel Info */}
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {channel.name}
            </h3>

            <div className="space-y-2">
              {/* Subscribers */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <Users size={14} />
                <span className="font-semibold">
                  {channel.subscribersFormatted || formatNumber(channel.subscribers)}
                </span>
                <span className="text-xs">subscribers</span>
              </div>

              {/* Total Views */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <Eye size={14} />
                <span className="font-semibold">
                  {channel.totalViewsFormatted || formatNumber(channel.totalViews)}
                </span>
                <span className="text-xs">views</span>
              </div>

              {/* Description */}
              {channel.description && (
                <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 mt-2">
                  {channel.description}
                </p>
              )}
            </div>

            {/* Select Button */}
            <div className="mt-3 flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 transition-colors">
              <ExternalLink size={14} />
              View Valuation
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default ChannelSelector;