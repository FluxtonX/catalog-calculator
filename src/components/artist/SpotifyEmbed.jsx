// src/components/artist/SpotifyEmbed.jsx
import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";

/**
 * Optimized Spotify Embed Component with lazy loading
 * @param {Object} props
 * @param {string} props.trackId - Spotify track ID
 * @param {string} props.title - Track title for accessibility
 */
const SpotifyEmbed = React.memo(({ trackId, title }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Use Intersection Observer to lazy load the embed
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
          }
        });
      },
      { rootMargin: "200px" }
    );

    const element = document.getElementById(`spotify-container-${trackId}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [trackId]);

  return (
    <div
      id={`spotify-container-${trackId}`}
      className="mt-3 w-full relative"
      style={{ minHeight: "152px" }}
    >
      {shouldLoad ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          )}
          <iframe
            key={`spotify-${trackId}`}
            src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allowtransparency="true"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className={`rounded-lg shadow-sm max-w-full transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ minWidth: "280px" }}
            title={`Spotify player for ${title}`}
            onLoad={() => setIsLoaded(true)}
          />
        </>
      ) : (
        <div className="w-full h-[152px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Play size={32} className="text-slate-400" />
        </div>
      )}
    </div>
  );
});

SpotifyEmbed.displayName = "SpotifyEmbed";

export default SpotifyEmbed;