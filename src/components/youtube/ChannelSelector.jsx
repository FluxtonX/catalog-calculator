// src/components/youtube/ChannelSelector.jsx
import React from "react";
import { Users, Eye, SearchX, CheckCircle } from "lucide-react";
import Card from "../common/Card";

const ChannelSelector = ({ channels, onSelectChannel, isLoading }) => {
  if (!channels || channels.length === 0) return null;
  
  // We now expect only ONE channel to be passed here (the best automated match)
  const channel = channels[0];

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-800 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
         <Users size={120} />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg shadow-red-500/20">
          <CheckCircle size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Official Channel Found
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            We've automatically identified the official YouTube channel for this artist based on exact name match and subscriber count.
          </p>
        </div>
      </div>

      <div className="py-2 relative z-10">
        <div className="w-full flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          
          {/* Channel Image */}
          <div className="relative w-full md:w-1/3 lg:w-1/4 aspect-video shrink-0 overflow-hidden rounded-xl shadow-md border-4 border-white dark:border-slate-900">
            {channel.image ? (
              <img
                src={channel.image}
                alt={channel.name}
                className="w-full h-full object-cover"
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
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl" />
          </div>

          {/* Channel Info */}
          <div className="flex-1 flex flex-col justify-center w-full">
            <div className="flex items-center gap-2 mb-2">
               <h3 className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                 {channel.name}
               </h3>
               <CheckCircle size={20} className="text-blue-500 shrink-0" fill="currentColor" stroke="white" />
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6 mt-2">
              {/* Subscribers */}
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <Users size={18} className="text-red-500" />
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  {channel.subscribersFormatted || formatNumber(channel.subscribers)}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">subscribers</span>
              </div>

              {/* Total Views */}
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <Eye size={18} className="text-red-500" />
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  {channel.totalViewsFormatted || formatNumber(channel.totalViews)}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">views</span>
              </div>
            </div>

            {/* Action Buttons Removed */}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChannelSelector;
