import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ListMusic, Disc3, Disc, Star, Heart, Map } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const buildArtistTabs = ({
  platform,
  hasRelated,
  hasCities,
  hasPopularReleases,
  hasSingles,
}) => {
  const tabs = [
    { id: "tracks", label: "Tracks", icon: ListMusic, always: true },
    {
      id: "albums",
      label: "Albums",
      icon: Disc3,
      always: platform !== "youtube",
    },
    { id: "singles", label: "Singles", icon: Disc, show: hasSingles },
    { id: "popular", label: "Popular", icon: Star, show: hasPopularReleases },
    { id: "related", label: "Related", icon: Heart, show: hasRelated },
    {
      id: "cities",
      label: "Cities",
      icon: Map,
      show: hasCities && platform === "apify",
    },
  ];
  return tabs.filter((t) => t.always || t.show);
};

// eslint-disable-next-line no-unused-vars
export const ArtistTabTrigger = ({ id, label, Icon, platform }) => {
  const isItunes = platform === "itunes";
  return (
    <Tabs.Trigger
      value={id}
      className={`
        group relative flex items-center gap-1.5 sm:gap-2
        px-3 sm:px-4 py-2.5 sm:py-3
        text-[11px] sm:text-sm font-semibold rounded-t-xl
        whitespace-nowrap outline-none select-none
        transition-all duration-200
        data-[state=inactive]:text-slate-500 dark:data-[state=inactive]:text-slate-400
        data-[state=inactive]:hover:text-slate-700 dark:data-[state=inactive]:hover:text-slate-200
        data-[state=inactive]:hover:bg-slate-200/60 dark:data-[state=inactive]:hover:bg-slate-700/50
        ${
          isItunes
            ? "data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
            : "data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
        }
      `}
    >
      <Icon
        size={13}
        className="sm:w-4 sm:h-4 flex-shrink-0 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110"
      />
      <span>{label}</span>
      <span
        className={`
          absolute bottom-0 left-0 right-0 h-0.5 rounded-full
          ${isItunes ? "bg-slate-900 dark:bg-white" : "bg-emerald-500"}
          scale-x-0 data-[state=active]:scale-x-100
          transition-transform duration-200
        `}
      />
    </Tabs.Trigger>
  );
};

export const MediaGrid = ({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
    {children}
  </div>
);
