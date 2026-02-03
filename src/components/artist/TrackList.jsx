// src/components/artist/TrackList.jsx
import React, { useMemo } from "react";
import TrackItem from "./TrackItem";

const TrackList = ({ tracks, platform, extractSpotifyId }) => {
  const trackList = useMemo(() => {
    if (!tracks || tracks.length === 0) return null;

    return tracks.map((track, idx) => (
      <TrackItem
        key={`track-${track.id || idx}`}
        track={track}
        index={idx}
        platform={platform}
        extractSpotifyId={extractSpotifyId}
      />
    ));
  }, [tracks, platform, extractSpotifyId]);

  return <div className="space-y-2 sm:space-y-3">{trackList}</div>;
};

export default TrackList;