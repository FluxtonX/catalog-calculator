import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Separator from "@radix-ui/react-separator";
import {
  Music,
  Users,
  TrendingUp,
  Disc3,
  Youtube,
  ExternalLink,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Headphones,
  BarChart3,
} from "lucide-react";
import AnimatedBackground from "../common/AnimatedBackground";

const SocialLink = ({ href, label, Icon }) => (
  <Tooltip.Provider delayDuration={150}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5
            bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40
            rounded-xl text-xs sm:text-sm font-semibold text-white/90 hover:text-white
            transition-all duration-200 hover:scale-105 hover:shadow-lg group"
        >
          <Icon
            size={14}
            className="sm:w-4 sm:h-4 group-hover:scale-110 transition-transform"
          />
          <span className="capitalize">{label}</span>
          <ExternalLink
            size={10}
            className="opacity-50 group-hover:opacity-100 transition-opacity"
          />
        </a>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
        className="px-2.5 py-1.5 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl z-50"
          sideOffset={6}
        >
          Open {label}
       <Tooltip.Arrow className="fill-white" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

const StatPill = ({ icon: Icon, value, label, gradient, title }) => (
  <Tooltip.Provider delayDuration={150}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className="group flex items-center gap-2 sm:gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm px-3 py-2 sm:px-5 sm:py-3 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 cursor-default">
          <div
            className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient} shadow-md flex-shrink-0`}
          >
            <Icon size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
          </div>
          <div className="flex items-baseline gap-1 sm:gap-2 min-w-0">
            <span className="font-black text-sm sm:text-xl text-white truncate">
              {value}
            </span>
            <span className="text-white/60 text-[10px] sm:text-sm font-medium whitespace-nowrap hidden xs:inline">
              {label}
            </span>
          </div>
        </div>
      </Tooltip.Trigger>
      {title && (
        <Tooltip.Portal>
          <Tooltip.Content
           className="px-3 py-2 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl z-50 max-w-[200px] text-center leading-relaxed"
            sideOffset={6}
          >
            {title}
           <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      )}
    </Tooltip.Root>
  </Tooltip.Provider>
);

const ArtistHeader = ({
  name, image, followers, monthlyListeners, popularity, genres,
  platform, spotifyUrl, youtubeUrl, appleUrl, externalLinks,
  onLaunchValuation, getSocialIcon, onCalculateRoyalties,
}) => {
  const isApify = platform === "apify";
  const isYoutube = platform === "youtube";
  const isItunes = platform === "itunes";

  // Apple-black gradient for iTunes
  const headerGradient = isItunes
    ? "from-slate-950 via-zinc-900 to-slate-950"
    : "from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950";

  // Top accent: white/silver for iTunes (like Apple's aesthetic)
  const accentLine = isItunes
    ? "from-white/40 via-white/70 to-white/40"
    : isYoutube
      ? "from-red-500 via-rose-400 to-pink-500"
      : "from-emerald-500 via-green-400 to-teal-500";

  // Image glow: white/silver for iTunes
  const imageGlow = isItunes
    ? "from-white/30 to-zinc-300/20"
    : isYoutube
      ? "from-red-500 to-pink-600"
      : "from-emerald-500 to-blue-600";

  // Platform badge: black for iTunes
  const platformBadgeBg = isItunes
    ? "bg-zinc-900 border border-white/20"
    : isYoutube
      ? "bg-red-500"
      : "bg-emerald-500";

  // Live badge: white for iTunes (on dark bg)
  const liveRingColor = isItunes
    ? "bg-white/10 border-white/25"
    : "bg-emerald-500/20 border-emerald-500/30";

  const liveDotColor = isItunes ? "bg-white" : "bg-emerald-400";

  const liveTextColor = isItunes ? "text-white/80" : "text-emerald-300";

  const platformLabel = isItunes
    ? "Apple Music"
    : isYoutube
      ? "YouTube"
      : "Spotify";

  const getSocialIconComponent = (label) => {
    const map = {
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      x: Twitter,
    };
    return map[label?.toLowerCase()] || Globe;
  };

  return (
    <div
      className={`bg-gradient-to-br ${headerGradient} text-white overflow-hidden relative rounded-2xl sm:rounded-3xl shadow-2xl`}
    >
      <AnimatedBackground />

      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accentLine}`}
      />

      {/* iTunes: subtle noise/grain overlay for Apple feel */}
      {isItunes && (
        <>
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/5 to-transparent rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/3 to-transparent rounded-full pointer-events-none" />
        </>
      )}

      <div className="relative z-10 p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5 sm:gap-7 lg:gap-10">
          {/* Artist Image */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            {image ? (
              <div className="relative group">
                <div
                  className={`absolute -inset-1 bg-gradient-to-br ${imageGlow} rounded-2xl sm:rounded-3xl blur-lg opacity-40 group-hover:opacity-70 transition-all duration-500`}
                />
                <img
                  src={image}
                  alt={name}
                  className="relative w-28 h-28 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-2xl sm:rounded-3xl object-cover shadow-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300 group-hover:scale-[1.02]"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/256?text=No+Image";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                    <Music size={14} />
                    <span>{platformLabel}</span>
                  </div>
                </div>
                {isYoutube && (
                  <div
                    className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg ${platformBadgeBg}`}
                  >
                    <Youtube size={14} className="text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center ring-2 ring-white/10">
                <Music size={40} className="text-white/30" />
              </div>
            )}
          </div>

          {/* Artist Details */}
          <div className="flex-1 w-full min-w-0">
            {/* Live badge row */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full ${liveRingColor}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${liveDotColor}`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${liveTextColor}`}
                >
                  Live Data
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <Disc3
                  size={12}
                  className="animate-spin"
                  style={{ animationDuration: "4s" }}
                />
                <span>Real-time {platformLabel} Stats</span>
              </div>
              {isItunes && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/15 rounded-full">
                  <span className="text-white/70 text-[10px] font-bold uppercase tracking-wide">
                    Apple Music
                  </span>
                </div>
              )}
            </div>

            {/* Artist name */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-5 leading-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent tracking-tight truncate">
              {name}
            </h2>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              {followers && (
                <StatPill
                  icon={Users}
                  value={followers}
                  label={isItunes ? "Listeners" : "Followers"}
                  gradient={
                    isItunes
                      ? "from-slate-600 to-zinc-700"
                      : "from-blue-500 to-blue-700"
                  }
                  title={
                    isItunes
                      ? "Total listeners who have this artist saved in their Apple Music library"
                      : isYoutube
                        ? "Total subscribers following this YouTube channel"
                        : "Total Spotify users who follow this artist's profile"
                  }
                />
              )}
              {monthlyListeners && isApify && (
                <StatPill
                  icon={Headphones}
                  value={monthlyListeners}
                  label="Monthly Listeners"
                  gradient="from-emerald-500 to-emerald-700"
                  title="Unique Spotify users who streamed this artist at least once in the last 28 days"
                />
              )}
             {popularity !== undefined && popularity !== null && !isApify && (
                <StatPill
                  icon={TrendingUp}
                  value={popularity}
                  label="Popularity"
                  gradient={
                    isItunes
                      ? "from-zinc-600 to-slate-700"
                      : "from-purple-500 to-purple-700"
                  }
                  title={
                    isYoutube
                      ? "Engagement score based on views, likes, and watch time relative to similar channels"
                      : "Apple Music score (0–100) based on recent stream counts and saves across all markets"
                  }
                />
              )}
            </div>

            {/* Genres */}
            {genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                {genres.slice(0, 6).map((genre, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm border rounded-full text-[10px] sm:text-xs font-semibold text-white/85 hover:text-white transition-all duration-200 cursor-default capitalize ${
                      isItunes
                        ? "border-white/15 hover:border-white/30"
                        : "border-white/15 hover:border-white/25"
                    }`}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <Separator.Root
              className="bg-white/10 h-px mb-4 sm:mb-5"
              decorative
            />

       {/* Action buttons */}
<div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
  <button
    onClick={onCalculateRoyalties}
    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg ${
      isItunes
        ? "bg-white/20 hover:bg-white/30 border border-white/30"
        : isYoutube
        ? "bg-red-500/80 hover:bg-red-500 border border-red-400/50"
        : "bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-400/50"
    }`}
  >
    <BarChart3 size={15} />
    Calculate Royalties
  </button>
  {isYoutube && youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Youtube size={15} />
                  <span className="hidden xs:inline">Open in YouTube</span>
                  <span className="xs:hidden">YouTube</span>
                </a>
              )}
              {isApify && spotifyUrl && (
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 hover:border-emerald-400/50 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Music size={15} />
                  <span className="hidden xs:inline">Open in Spotify</span>
                  <span className="xs:hidden">Spotify</span>
                </a>
              )}
              {/* Apple Music button — white/glass style matching Apple's design language */}
              {isItunes && appleUrl && (
                <a
                  href={appleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/25 hover:border-white/50 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg backdrop-blur-sm"
                >
                  <Music size={15} />
                  <span className="hidden xs:inline">Open in Apple Music</span>
                  <span className="xs:hidden">Apple Music</span>
                </a>
              )}
            </div>

            {/* Social links (Spotify only) */}
            {isApify && externalLinks?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {externalLinks.map((link, i) => {
                  const Icon = getSocialIconComponent(link.label);
                  return (
                    <SocialLink
                      key={i}
                      href={link.url}
                      label={link.label}
                      Icon={Icon}
                    />
                  );
                })}
              </div>
            )}

            {/* iTunes external links */}
            {isItunes && externalLinks?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {externalLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl text-xs font-semibold text-white/90 hover:text-white transition-all duration-200 hover:scale-105"
                  >
                    <ExternalLink size={12} />
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;
