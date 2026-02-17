import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Separator from "@radix-ui/react-separator";
import {
  Music, Users, TrendingUp, Play, Disc3, Youtube,
  ExternalLink, Globe, Facebook, Instagram, Twitter,
  MapPin, Headphones,
} from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import AnimatedBackground from "../common/AnimatedBackground";

// ── Radix Tooltip for social links ──────────────────────
const SocialLink = ({ href, label, Icon }) => (
  <Tooltip.Provider delayDuration={150}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5
            bg-white/10 hover:bg-white/20
            backdrop-blur-sm border border-white/20 hover:border-white/40
            rounded-xl text-xs sm:text-sm font-semibold text-white/90 hover:text-white
            transition-all duration-200 hover:scale-105 hover:shadow-lg group"
        >
          <Icon size={14} className="sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
          <span className="capitalize">{label}</span>
          <ExternalLink size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="px-2.5 py-1.5 text-xs bg-slate-900 text-white rounded-lg shadow-xl z-50"
          sideOffset={6}
        >
          Open {label}
          <Tooltip.Arrow className="fill-slate-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

// ── Stat pill ────────────────────────────────────────────
const StatPill = ({ icon: Icon, value, label, gradient }) => (
  <div className={`group flex items-center gap-2 sm:gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm px-3 py-2 sm:px-5 sm:py-3 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 cursor-default`}>
    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient} shadow-md flex-shrink-0`}>
      <Icon size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
    </div>
    <div className="flex items-baseline gap-1 sm:gap-2 min-w-0">
      <span className="font-black text-sm sm:text-xl text-white truncate">{value}</span>
      <span className="text-white/60 text-[10px] sm:text-sm font-medium whitespace-nowrap hidden xs:inline">{label}</span>
    </div>
  </div>
);

const ArtistHeader = ({
  name, image, followers, monthlyListeners, popularity,
  genres, platform, spotifyUrl, youtubeUrl,
  externalLinks, onLaunchValuation, getSocialIcon,
}) => {
  const isApify = platform === "apify";
  const isYoutube = platform === "youtube";

  const getSocialIconComponent = (label) => {
    const map = { facebook: Facebook, instagram: Instagram, twitter: Twitter, x: Twitter };
    return map[label?.toLowerCase()] || Globe;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white overflow-hidden relative rounded-2xl sm:rounded-3xl shadow-2xl">
      <AnimatedBackground />

      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${isYoutube ? "from-red-500 via-rose-400 to-pink-500" : "from-emerald-500 via-green-400 to-teal-500"}`} />

      <div className="relative z-10 p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5 sm:gap-7 lg:gap-10">

          {/* ── Artist Image ─────────────────────────────── */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            {image ? (
              <div className="relative group">
                {/* Glow ring */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${isYoutube ? "from-red-500 to-pink-600" : "from-emerald-500 to-blue-600"} rounded-2xl sm:rounded-3xl blur-lg opacity-40 group-hover:opacity-70 transition-all duration-500`} />
                <img
                  src={image}
                  alt={name}
                  className="relative w-28 h-28 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-2xl sm:rounded-3xl object-cover shadow-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300 group-hover:scale-[1.02]"
                  loading="eager"
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/256?text=No+Image"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                    <Music size={14} />
                    <span>{isYoutube ? "YouTube" : "Spotify"}</span>
                  </div>
                </div>
                {/* Platform badge on image */}
                <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg ${isYoutube ? "bg-red-500" : "bg-emerald-500"}`}>
                  {isYoutube ? <Youtube size={14} className="text-white" /> : <Music size={14} className="text-white" />}
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center ring-2 ring-white/10">
                <Music size={40} className="text-white/30" />
              </div>
            )}
          </div>

          {/* ── Artist Details ────────────────────────────── */}
          <div className="flex-1 w-full min-w-0">

            {/* Live badge + platform */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-300 text-xs font-bold uppercase tracking-wide">Live Data</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <Disc3 size={12} className="animate-spin" style={{ animationDuration: "4s" }} />
                <span>Real-time {isApify ? "Spotify" : "YouTube"} Stats</span>
              </div>
            </div>

            {/* Artist name */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-5 leading-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent tracking-tight truncate">
              {name}
            </h2>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <StatPill icon={Users} value={followers} label="Followers" gradient="from-blue-500 to-blue-700" />
              {monthlyListeners && isApify && (
                <StatPill icon={Headphones} value={monthlyListeners} label="Monthly Listeners" gradient="from-emerald-500 to-emerald-700" />
              )}
              {popularity && !isApify && (
                <StatPill icon={TrendingUp} value={popularity} label="Popularity" gradient="from-purple-500 to-purple-700" />
              )}
            </div>

            {/* Genres */}
            {genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                {genres.slice(0, 6).map((genre, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 hover:border-white/25 rounded-full text-[10px] sm:text-xs font-semibold text-white/85 hover:text-white transition-all duration-200 cursor-default capitalize"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Separator */}
            <Separator.Root className="bg-white/10 h-px mb-4 sm:mb-5" decorative />

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
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
            </div>

            {/* Social links */}
            {isApify && externalLinks?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {externalLinks.map((link, i) => {
                  const Icon = getSocialIconComponent(link.label);
                  return <SocialLink key={i} href={link.url} label={link.label} Icon={Icon} />;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;