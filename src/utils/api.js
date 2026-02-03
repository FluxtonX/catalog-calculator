




import { supabase } from './supabase'

// Helper to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    Authorization: `Bearer ${session?.access_token || ''}`,
  }
}

// Spotify
export async function searchSpotify(query) {
  const headers = await getAuthHeaders()
  const { data, error } = await supabase.functions.invoke('spotify', {
    body: { query },
    headers,
  })
  if (error) throw error
  return data
}

// YouTube
export async function searchYouTube(query) {
  const headers = await getAuthHeaders()
  const { data, error } = await supabase.functions.invoke('youtube', {
    body: { query },
    headers,
  })
  if (error) throw error
  return data
}

// Apify
export async function searchApify(query) {
  const headers = await getAuthHeaders()
  const { data, error } = await supabase.functions.invoke('apify', {
    body: { query },
    headers,
  })
  if (error) throw error
  return data
}

// Fetch album images from Spotify by searching for albums
// Fetch album images from Spotify using album IDs
// Fetch album images from Spotify using album IDs
export async function getSpotifyAlbumImages(artistName, albums) {
  console.log('====== getSpotifyAlbumImages CALLED ======');
  console.log('Artist Name:', artistName);
  console.log('Number of albums:', albums?.length);
  console.log('Albums received:', JSON.stringify(albums, null, 2));
  
  try {
    const headers = await getAuthHeaders();
    console.log('Auth headers obtained:', headers);
    
    // Fetch images for each album using their Spotify IDs
    const albumsData = await Promise.all(
      albums.map(async (album, index) => {
        console.log(`\n--- Processing album ${index + 1}/${albums.length} ---`);
        console.log('Album object:', JSON.stringify(album, null, 2));
        console.log('Album ID:', album.id);
        console.log('Album Name:', album.name);
        
        try {
          // If we have an album ID, fetch directly from Spotify
          if (album.id) {
            console.log(`Calling spotify-album function for ID: ${album.id}`);
            
            const { data, error } = await supabase.functions.invoke('spotify-album', {
              body: { albumId: album.id },
              headers,
            });
            
            console.log('Supabase response for', album.name);
            console.log('  - Data:', JSON.stringify(data, null, 2));
            console.log('  - Error:', error);
            
            if (error) {
              console.error(`❌ Error fetching album ${album.name}:`, error);
              return { albumName: album.name, image: null };
            }
            
            // Extract image from response
            const image = data?.image || data?.images?.[0]?.url || null;
            console.log(`  - Extracted image URL:`, image);
            
            return {
              albumName: album.name,
              image,
            };
          }
          
          // Fallback: if no ID, return null
          console.warn(`⚠️ No ID for album: ${album.name}`);
          return { albumName: album.name, image: null };
        } catch (err) {
          console.error(`❌ Exception fetching album ${album.name}:`, err);
          console.error('Error details:', err.message, err.stack);
          return { albumName: album.name, image: null };
        }
      })
    );
    
    console.log('\n====== FINAL RESULTS ======');
    console.log('Albums with images:', JSON.stringify(albumsData, null, 2));
    console.log('Total albums processed:', albumsData.length);
    console.log('Albums with images:', albumsData.filter(a => a.image).length);
    console.log('Albums without images:', albumsData.filter(a => !a.image).length);
    
    return albumsData;
  } catch (err) {
    console.error('❌ Fatal error in getSpotifyAlbumImages:', err);
    console.error('Error details:', err.message, err.stack);
    return [];
  }
}

// Add this new function to api.js
export async function getArtistSuggestions(query, platform = 'spotify') {
  try {
    if (!query.trim()) return []
    
    const headers = await getAuthHeaders()
    
    if (platform === 'spotify') {
      // Call Apify to get artist suggestions
      const { data, error } = await supabase.functions.invoke('apify', {
        body: { query },
        headers,
      })
      
      if (error) throw error
      
      // Return a simple object with the found artist
      // You can also return multiple matches if the API supports it
      if (data?.name) {
        return [{
          name: data.name,
          image: data.image,
          followers: data.followers
        }]
      }
      return []
    } else if (platform === 'youtube') {
      // Call YouTube to get channel suggestions
      const { data, error } = await supabase.functions.invoke('youtube', {
        body: { query },
        headers,
      })
      
      if (error) throw error
      
      if (data?.name) {
        return [{
          name: data.name,
          image: data.image,
          subscribers: data.subscribers
        }]
      }
      return []
    }
  } catch (err) {
    console.warn(`Failed to fetch suggestions for query: ${query}`, err)
    return []
  }
}



// Add this to api.js

// Cache for trending artists to avoid repeated API calls
let trendingArtistsCache = {
  spotify: [],
  youtube: [],
  lastFetch: {}
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get trending/popular artists for suggestions
export async function getTrendingArtists(platform = 'spotify') {
  try {
    const now = Date.now();
    
    // Return cached results if still fresh
    if (
      trendingArtistsCache[platform].length > 0 &&
      trendingArtistsCache.lastFetch[platform] &&
      now - trendingArtistsCache.lastFetch[platform] < CACHE_DURATION
    ) {
      return trendingArtistsCache[platform];
    }

    const headers = await getAuthHeaders();

    if (platform === 'spotify') {
      // Call your backend to get trending artists
      const { data, error } = await supabase.functions.invoke('apify-trending', {
        body: { limit: 100 }, // Get top 100 artists
        headers,
      });

      if (error) throw error;

      // Extract artist names from response
      const artists = (data?.artists || []).map(artist => ({
        name: artist.name,
        image: artist.image,
        followers: artist.followers
      }));

      trendingArtistsCache.spotify = artists;
      trendingArtistsCache.lastFetch.spotify = now;
      return artists;
    } else if (platform === 'youtube') {
      const { data, error } = await supabase.functions.invoke('youtube-trending', {
        body: { limit: 100 },
        headers,
      });

      if (error) throw error;

      const channels = (data?.channels || []).map(channel => ({
        name: channel.name,
        image: channel.image,
        subscribers: channel.subscribers
      }));

      trendingArtistsCache.youtube = channels;
      trendingArtistsCache.lastFetch.youtube = now;
      return channels;
    }
  } catch (err) {
    console.warn(`Failed to fetch trending ${platform} artists:`, err);
    return [];
  }
}

// Filter artists based on search query
export function filterArtistSuggestions(artists, query) {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();

  // Filter artists that start with the query
  const startsWith = artists.filter(artist =>
    artist.name.toLowerCase().startsWith(searchTerm)
  );

  // If we have results starting with query, return them sorted
  if (startsWith.length > 0) {
    return startsWith
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 10); // Limit to 10 results
  }

  // Otherwise, filter artists that contain the query
  const contains = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm)
  );

  return contains
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 10);
}