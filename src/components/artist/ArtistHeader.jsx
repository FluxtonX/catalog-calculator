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

// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
const StatPill = ({ icon: Icon, value, label, gradient, title }) => (
  <Tooltip.Provider delayDuration={150}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className="group flex items-center gap-2 sm:gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm px-3 py-2 sm:px-5 sm:py-3 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 cursor-default">
          <div
            className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient} shadow-md flex-shrink-0 flex items-center justify-center`}
          >
            <Icon size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-black text-sm sm:text-xl text-white truncate leading-none">
              {typeof value === 'number' ? value.toLocaleString() : (!isNaN(Number(value)) ? Number(value).toLocaleString() : value)}
            </span>
            <span className="text-white/60 text-[10px] sm:text-sm font-medium whitespace-nowrap leading-none">
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
  // eslint-disable-next-line no-unused-vars
  name, image, followers, monthlyListeners, popularity, genres,
  platform, spotifyUrl, youtubeUrl, appleUrl, externalLinks,
  // eslint-disable-next-line no-unused-vars
  onLaunchValuation, getSocialIcon, onCalculateRoyalties,
}) => {
  const isApify = platform === "apify" || platform === "spotify";
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

      <div className="relative z-10 p-4 sm:p-6 lg:p-10 flex flex-col items-center text-center justify-center min-h-[300px]">
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Artist Details */}
          <div className="w-full flex flex-col items-center">
            {/* Live badge row */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
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
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 leading-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent tracking-tight truncate max-w-full px-4">
              {name}
            </h2>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
              {followers && (
                <StatPill
                  icon={Users}
                  value={followers}
                  label={isItunes ? "Listeners" : isYoutube ? "Subscribers" : "Followers"}
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
          
            </div>

            {/* Genres */}
            {genres?.length > 0 && !isYoutube && (
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-5 sm:mb-6">
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
              className="bg-white/10 h-px w-3/4 max-w-md mx-auto mb-5 sm:mb-6"
              decorative
            />

       {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-5">
  {isYoutube && youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg"
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
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 hover:border-emerald-400/50 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Music size={15} />
                  <span className="hidden xs:inline">Open in Spotify</span>
                  <span className="xs:hidden">Spotify</span>
                </a>
              )}
              {isItunes && appleUrl && (
                <a
                  href={appleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-700/50 hover:bg-zinc-600/60 border border-zinc-500/30 hover:border-zinc-400/50 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <svg viewBox="0 0 384 512" className="w-3.5 h-3.5 fill-current">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  <span className="hidden xs:inline">Open in Apple Music</span>
                  <span className="xs:hidden">Apple Music</span>
                </a>
              )}
            </div>

            {/* Social links (Spotify only) */}
            {isApify && externalLinks?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
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
