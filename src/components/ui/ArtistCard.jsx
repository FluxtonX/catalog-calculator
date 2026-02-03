// src/components/ui/ArtistCard.jsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Facebook, Instagram, Twitter, Globe, Users, Album, MapPin } from "lucide-react";
import { getSpotifyAlbumImages } from "../../utils/api";

// Import refactored components
import Card from "../common/Card";
import SectionHeader from "../common/SectionHeader";
import EmptyState from "../common/EmptyState";
import ArtistHeader from "../artist/ArtistHeader";
import ArtistStats from "../artist/ArtistStats";
import BioText from "../artist/BioText";
import TabNavigation from "../artist/TabNavigation";
import TrackList from "../artist/TrackList";
import RelatedArtistCard from "../artist/RelatedArtistCard";
import AlbumCard from "../artist/AlbumCard";
import TopCitiesList from "../artist/TopCitiesList";
import ValuationTab from "../artist/ValuationTab";

const ArtistCard = ({
  name,
  image,
  followers,
  popularity,
  genres,
  topTracks,
  relatedArtists,
  albums,
  singles,          // Added
  popularReleases,  // Added
  stats,
  spotifyUrl,
  youtubeUrl,
  platform,
  monthlyListeners,
  biography,
  topCities,
  externalLinks,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("valuation");
  const [enhancedAlbums, setEnhancedAlbums] = useState([]);

  // Helper function to extract Spotify track ID from URL
  const extractSpotifyId = useCallback((url) => {
    if (!url) return null;
    const match = url.match(/track[\/:]([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }, []);

  // Get social icon
  const getSocialIcon = useCallback((label) => {
    const iconMap = {
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      x: Twitter,
    };
    return iconMap[label?.toLowerCase()] || Globe;
  }, []);

  // Handle valuation launch
  const handleLaunchValuation = useCallback(() => {
    sessionStorage.setItem("artistCardScrollPos", window.scrollY.toString());
    navigate("/valuation/detail", {
      state: {
        artist: {
          name,
          image,
          followers,
          popularity,
          genres,
          topTracks,
          stats,
          monthlyListeners,
          platform,
        },
      },
    });
  }, [navigate, name, image, followers, popularity, genres, topTracks, stats, monthlyListeners, platform]);

  // Enhance albums with Spotify images - UPDATED
// Enhance albums with Spotify images - UPDATED
// Enhance albums with Spotify images - UPDATED WITH DEBUG
useEffect(() => {
  let isMounted = true;

  const enhanceAlbumsWithSpotifyImages = async () => {
    console.log('\n🎵 ====== STARTING ALBUM ENHANCEMENT ======');
    console.log('Platform:', platform);
    console.log('Artist Name:', name);
    console.log('Raw albums:', albums);
    console.log('Raw singles:', singles);
    console.log('Raw popularReleases:', popularReleases);
    
    // Merge albums, singles, and popularReleases into one array
    const allReleases = [
      ...(albums || []),
      ...(singles || []),
      ...(popularReleases || [])
    ];

    console.log('All releases merged:', allReleases.length);
    console.log('All releases data:', JSON.stringify(allReleases, null, 2));

    if (allReleases.length === 0) {
      console.warn('⚠️ No releases to process');
      setEnhancedAlbums([]);
      return;
    }

    // Remove duplicates based on ID
    const uniqueReleases = allReleases.reduce((acc, current) => {
      const exists = acc.find(item => item.id === current.id);
      if (!exists) {
        acc.push(current);
      } else {
        console.log(`Duplicate found: ${current.name} (${current.id})`);
      }
      return acc;
    }, []);

    console.log('Unique releases:', uniqueReleases.length);

    // Sort by release date (newest first)
    const sortedReleases = uniqueReleases.sort((a, b) => {
      const dateA = new Date(a.releaseDate || 0);
      const dateB = new Date(b.releaseDate || 0);
      return dateB - dateA;
    });

    console.log('Sorted releases:', sortedReleases.length);
    console.log('Sorted releases data:', JSON.stringify(sortedReleases, null, 2));

    // Set initial albums without images
    setEnhancedAlbums(sortedReleases);

    try {
      console.log('\n🔍 Fetching Spotify images...');
      // Pass the full album objects (not just names)
      const spotifyImages = await getSpotifyAlbumImages(name, sortedReleases);

      console.log('\n📸 Spotify images received:', spotifyImages);

      if (!isMounted) {
        console.warn('Component unmounted, aborting');
        return;
      }

      // Merge the fetched images with the albums
    const merged = sortedReleases.map((album) => {
  // Match using Spotify album ID
  const spotifyData = spotifyImages.find((s) => s.id === album.id);

  console.log(`Merging ${album.name}:`, {
    originalImage: album.image,
    spotifyImage: spotifyData?.image,
    finalImage: spotifyData?.image || album.image
  });

  return {
    ...album,
    image: spotifyData?.image || album.image,
  }
});


      console.log('\n✅ Final enhanced albums:', JSON.stringify(merged, null, 2));
      console.log('Albums with images:', merged.filter(a => a.image).length);
      console.log('Albums without images:', merged.filter(a => !a.image).length);
      
      setEnhancedAlbums(merged);
    } catch (err) {
      console.error('❌ Error enhancing albums:', err);
      console.error('Error details:', err.message, err.stack);
      if (isMounted) {
        setEnhancedAlbums(sortedReleases);
      }
    }
  };

  if (activeTab === "albums") {
    enhanceAlbumsWithSpotifyImages();
  } else {
    console.log('Active tab is not albums, skipping enhancement');
  }

  return () => {
    isMounted = false;
  };
}, [albums, singles, popularReleases, name, activeTab, platform]);

  // Restore scroll position
  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem("artistCardScrollPos");
    if (savedScrollPos) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedScrollPos));
        sessionStorage.removeItem("artistCardScrollPos");
      });
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Main Artist Info Card */}
      <Card className="p-0 border-0">
        <ArtistHeader
          name={name}
          image={image}
          followers={followers}
          monthlyListeners={monthlyListeners}
          popularity={popularity}
          genres={genres}
          platform={platform}
          spotifyUrl={spotifyUrl}
          youtubeUrl={youtubeUrl}
          externalLinks={externalLinks}
          onLaunchValuation={handleLaunchValuation}
          getSocialIcon={getSocialIcon}
        />
        
        {/* Stats Grid */}
        <div className="p-6 sm:p-8">
          <ArtistStats
            stats={stats}
            platform={platform}
            topTracks={topTracks}
            albums={albums}
          />
        </div>
      </Card>

      {/* Biography */}
      {platform === "apify" && biography && (
        <Card className="p-4 sm:p-6 lg:p-8">
          <SectionHeader
            icon={Music}
            title="Biography"
            iconBg="from-emerald-500/20 to-blue-500/20"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <BioText text={biography} />
        </Card>
      )}

      {/* Tabbed Content */}
     <Card className="p-4 sm:p-6 lg:p-8">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          platform={platform}
          hasRelated={relatedArtists?.length > 0}
          hasCities={topCities?.length > 0}
        />

        <div className="min-h-[300px] sm:min-h-[400px]">
          {/* ADDED: Valuation Tab */}
          {activeTab === "valuation" && (
            <ValuationTab
              artistData={{
                name,
                image,
                topTracks,
                albums,
                monthlyListeners,
                stats,
                platform,
                topCities,
              }}
            />
          )}

          {/* Top Tracks Tab */}
          {activeTab === "tracks" && (
            <>
              {topTracks?.length > 0 ? (
                <TrackList
                  tracks={topTracks}
                  platform={platform}
                  extractSpotifyId={extractSpotifyId}
                />
              ) : (
                <EmptyState icon={Music} message="No top tracks available" />
              )}
            </>
          )}

          {/* Related Artists Tab */}
          {activeTab === "related" && (
            <>
              {relatedArtists?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {relatedArtists.map((artist, i) => (
                    <RelatedArtistCard key={artist.id || i} artist={artist} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={Users} message="No related artists found" />
              )}
            </>
          )}

          {/* Albums Tab */}
          {activeTab === "albums" && (
            <>
              {enhancedAlbums?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {enhancedAlbums.map((album, i) => (
                    <AlbumCard key={album.id || i} album={album} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={Album} message="No albums available" />
              )}
            </>
          )}

          {/* Top Cities Tab */}
          {activeTab === "cities" && platform === "apify" && (
            <>
              {topCities?.length > 0 ? (
                <TopCitiesList cities={topCities} />
              ) : (
                <EmptyState icon={MapPin} message="No city data available" />
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ArtistCard;