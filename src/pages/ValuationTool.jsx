import React, { useState } from 'react';
import { Search, Rocket, Music as MusicIcon } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ArtistCard from '../components/ui/ArtistCard';
import Badge from '../components/common/Badge';

const ValuationTool = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);

  const suggestedArtists = [
    'Taylor Swift',
    'Drake',
    'The Weeknd',
    'Bad Bunny',
    'Ariana Grande'
  ];

  const mockArtistData = {
    name: 'Taylor Swift',
    image: null,
    followers: '149.5M',
    popularity: '100/100',
    topTracks: [
      'The Fate of Ophelia',
      'Blank Space',
      'Shake It Off'
    ]
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSelectedArtist({ ...mockArtistData, name: searchQuery });
    }
  };

  const handleLaunchValuation = () => {
    console.log('Launching Spotify valuation for:', selectedArtist?.name);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="gradient-bg text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <MusicIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Search Artist</h2>
            <p className="text-gray-200 text-sm">Get real-time data from Spotify</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search any artist on Spotify..."
              className="
                w-full pl-12 pr-4 py-3
                bg-white/10 backdrop-blur-sm
                border border-white/20
                rounded-lg
                text-white placeholder-gray-300
                focus:outline-none focus:ring-2 focus:ring-white/30
                transition-all duration-200
              "
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <MusicIcon size={20} className="text-gray-300" />
            </div>
          </div>
          <Button 
            variant="primary"
            className="bg-emerald-500 hover:bg-emerald-600"
            icon={Search}
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>

        {/* Suggested Artists */}
        <div className="mt-6">
          <p className="text-sm text-gray-200 mb-3">Get real-time data. Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedArtists.map((artist) => (
              <button
                key={artist}
                onClick={() => {
                  setSearchQuery(artist);
                  setSelectedArtist({ ...mockArtistData, name: artist });
                }}
                className="
                  px-4 py-2 
                  bg-white/10 hover:bg-white/20 
                  backdrop-blur-sm 
                  border border-white/20 
                  rounded-full 
                  text-sm font-medium
                  transition-all duration-200
                "
              >
                {artist}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Artist Analysis */}
      {selectedArtist && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <MusicIcon size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Live Spotify Analysis
              </h2>
            </div>
            
            <Button 
              icon={Rocket}
              onClick={handleLaunchValuation}
            >
              Launch Spotify Valuation
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant="success" size="lg">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                10.0
              </span>
            </Badge>
          </div>

          <ArtistCard
            name={selectedArtist.name}
            image={selectedArtist.image}
            followers={selectedArtist.followers}
            popularity={selectedArtist.popularity}
            topTracks={selectedArtist.topTracks}
            onLaunchValuation={handleLaunchValuation}
          />
        </div>
      )}

      {/* Empty State */}
      {!selectedArtist && (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-full">
              <Search size={48} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Artist Selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Search for an artist above to view their analytics
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ValuationTool;