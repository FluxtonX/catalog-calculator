import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check, Calculator, Lock, ChevronDown, Zap, ChevronRight, CheckCircle2, ShieldCheck, Music, Hexagon, Landmark, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { searchApify, searchYouTube, searchItunes, searchAppleMusic, getYouTubeChannelDetails } from '../utils/api';
import { getCombinedValuation, formatCurrency } from '../utils/combinedValuation';
import { useArtistStore } from '../store/artistStore';

import imgTuneCore from '../assets/distribution logos/tunecore.png';
import imgDistroKid from '../assets/distribution logos/distrokid.png';
import imgCDBaby from '../assets/distribution logos/cdbaby.webp';
import imgSymphonic from '../assets/distribution logos/Symphonic_Logo.png';
import imgUnitedMasters from '../assets/distribution logos/unitedmasters.png';
import imgDittoMusic from '../assets/distribution logos/dittomusic.jpg';
import imgAWAL from '../assets/distribution logos/awal.png';
import imgStem from '../assets/distribution logos/stem-logo.png';
import imgAmuse from '../assets/distribution logos/amuse.png';
import imgRecordUnion from '../assets/distribution logos/record union.png';
import imgTooLost from '../assets/distribution logos/too_lost.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setSelectedArtists, setSearchQuery: setStoreSearchQuery, clearImportedData, setPlatforms: setStorePlatforms } = useArtistStore();
  
  // Option 1 State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [platforms, setPlatforms] = useState({
    spotify: true,
    apple: true,
    youtube: true
  });
  const [estimatedValue, setEstimatedValue] = useState(null);
  
  // Results Options State
  const [currency, setCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({ USD: 1 });
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD', 'GBP', 'EUR']);
  const [royaltyShare, setRoyaltyShare] = useState(100);
  
  // Fetch exchange rates on mount
  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setExchangeRates(data.rates);
          setAvailableCurrencies(Object.keys(data.rates));
        }
      })
      .catch(err => console.error("Failed to load exchange rates", err));
  }, []);
  
  // Auto-suggest State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Option 2 Auth State
  const [loading, setLoading] = useState({ youtube: false, spotify: false, apple: false });
  const [showDistributors, setShowDistributors] = useState(false);
  const [error, setError] = useState(null);

  const distributors = [
    { name: 'TuneCore', img: imgTuneCore },
    { name: 'DistroKid', img: imgDistroKid },
    { name: 'CD Baby', img: imgCDBaby },
    { name: 'Symphonic', img: imgSymphonic },
    { name: 'UnitedMasters', img: imgUnitedMasters },
    { name: 'Ditto Music', img: imgDittoMusic },
    { name: 'AWAL', img: imgAWAL },
    { name: 'Stem', img: imgStem },
    { name: 'Amuse', img: imgAmuse },
    { name: 'Record Union', img: imgRecordUnion },
    { name: 'Too Lost', img: imgTooLost },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/valuation', { replace: true });
      }
    });
  }, [navigate]);

  // Auto-suggest Effect
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSuggesting(true);
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=musicArtist&limit=5`);
        const data = await res.json();
        if (data.results) {
          // unique by name to avoid duplicates
          const unique = Array.from(new Set(data.results.map(a => a.artistName)))
            .map(name => data.results.find(a => a.artistName === name));
          setSuggestions(unique);
        }
      } catch (err) {
        console.error("Auto-suggest error:", err);
      } finally {
        setIsSuggesting(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleCalculate = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setEstimatedValue(null);
    setError(null);
    
    try {
      const activePlatforms = Object.entries(platforms).filter(([_, active]) => active).map(([p]) => p === 'apple' ? 'itunes' : p);
      
      const promises = activePlatforms.map(p => {
        if (p === 'spotify') return searchApify(searchQuery).then(d => ({...d, platform: 'spotify'}));
        if (p === 'youtube') return searchYouTube(searchQuery).then(async (d) => {
          if (d.type === 'channel_list' && d.channels?.length > 0) {
            const details = await getYouTubeChannelDetails(searchQuery, d.channels[0].id);
            return { ...details, platform: 'youtube' };
          }
          return { ...d, platform: 'youtube' };
        });
        if (p === 'itunes') {
          return searchAppleMusic(searchQuery)
            .then(d => ({ ...d, platform: 'itunes' }))
            .catch(() => searchItunes(searchQuery).then(d => ({ ...d, platform: 'itunes' })).catch(() => null));
        }
        return null;
      });

      const results = await Promise.allSettled(promises);
      const artistsMap = {};
      
      results.forEach(res => {
        if (res.status === 'fulfilled' && res.value && res.value.name) {
          artistsMap[res.value.platform] = res.value;
        }
      });
      
      if (Object.keys(artistsMap).length === 0) {
        throw new Error("Could not find artist data.");
      }
      
      const val = getCombinedValuation(artistsMap);
      setEstimatedValue(val);
      
      // ── KEY FIX ──────────────────────────────────────────────────────────────
      // Save EXACTLY what was fetched into the global store — artistsMap, the
      // search query, AND the active platform list. This means when the Valuation
      // Tool loads it uses the SAME data and does NOT re-trigger API calls for
      // platforms the user did not select on the Landing Page.
      clearImportedData();
      setStoreSearchQuery(searchQuery);
      setSelectedArtists(artistsMap);
      setStorePlatforms(activePlatforms); // ← sync platform selection to store
      // ─────────────────────────────────────────────────────────────────────────
      
    } catch (err) {
      console.error(err);
      setError("Failed to calculate valuation.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleYouTubeSignIn = async () => {
    try {
      setLoading(prev => ({ ...prev, youtube: true }));
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/valuation`,
          scopes: 'email profile',
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message || 'Failed to sign in with YouTube');
      setLoading(prev => ({ ...prev, youtube: false }));
    }
  };

  const handleSpotifySignIn = async () => {
    try {
      setLoading(prev => ({ ...prev, spotify: true }));
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          redirectTo: `${window.location.origin}/valuation`,
          scopes: 'user-read-email user-read-private',
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message || 'Failed to sign in with Spotify');
      setLoading(prev => ({ ...prev, spotify: false }));
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(prev => ({ ...prev, apple: true }));
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/valuation`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message || 'Failed to sign in with Apple');
      setLoading(prev => ({ ...prev, apple: false }));
    }
  };

  const formatLocalCurrency = (value) => {
    if (value === null) return "$0";
    const adjustedValue = value * (royaltyShare / 100);
    const rate = exchangeRates[currency] || 1;
    
    let symbol = '$';
    try {
      symbol = (0).toLocaleString('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).replace(/\d|\.|,/g, '').trim();
    } catch(e) {}
    
    const converted = adjustedValue * rate;
    
    if (converted >= 1_000_000_000) return `${symbol}${(converted / 1_000_000_000).toFixed(2)}B`;
    if (converted >= 1_000_000) return `${symbol}${(converted / 1_000_000).toFixed(2)}M`;
    if (converted >= 1_000) return `${symbol}${(converted / 1_000).toFixed(1)}K`;
    return `${symbol}${converted.toFixed(0)}`;
  };


  return (
    <div className="min-h-screen bg-[#030509] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* Animated Ambient Background Glows */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[65%] bg-cyan-500/15 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 pb-24">
        
        {/* Header */}
        <header className="relative py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 backdrop-blur-md shadow-lg shadow-cyan-500/10">
              <Hexagon className="absolute inset-0 w-12 h-12 text-cyan-400 opacity-80" strokeWidth={1} />
              <Calculator className="w-5 h-5 text-white relative z-10" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <h1 className="font-extrabold text-xl md:text-2xl tracking-tight text-white flex items-center gap-1.5">
                Catalog <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Calculator</span>
              </h1>
              <p className="text-[11px] text-white/50 font-semibold tracking-widest uppercase">by Creative Funding Agency</p>
            </div>
          </div>

          <div className="hidden md:block">
            <button 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 rounded-full text-[13px] font-semibold text-white transition-all shadow-lg hover:shadow-cyan-500/20"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              Connect DSPs
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="w-full flex flex-col items-center justify-center text-center mt-12 md:mt-16 mb-16 space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Industry Leading Valuation Engine
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            What's Your <br className="md:hidden" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Catalog Worth?
            </span>
          </h2>
          <p className="text-white/60 text-[15px] md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Discover the true value of your music rights. Search instantly for a quick estimate, or securely connect your platforms for an institutional-grade report.
          </p>
        </div>

        {/* Dual Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-20">
          
          {/* Card 1: Quick Search */}
          <div className="bg-[#0A101D]/80 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-[32px] p-8 lg:p-10 shadow-2xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1 text-white">Quick Estimate</h3>
                <p className="text-sm text-white/50">Search any artist for an instant public-data valuation.</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-white/30" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search artist name..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/10 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowSuggestions(false);
                    handleCalculate();
                  }
                }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                {isSuggesting ? (
                  <div className="w-4 h-4 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
                ) : null}
              </div>
              
              {/* Auto-suggest */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B101A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                  {suggestions.map((artist, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-4 py-3.5 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 text-sm text-white flex items-center gap-3"
                      onClick={() => {
                        setSearchQuery(artist.artistName);
                        setShowSuggestions(false);
                      }}
                    >
                      <Search className="w-4 h-4 text-white/40" />
                      <span className="font-medium text-white/90">{artist.artistName}</span>
                      {artist.primaryGenreName && (
                        <span className="text-[10px] text-white/40 uppercase tracking-wider ml-auto bg-white/5 px-2 py-1 rounded-full">{artist.primaryGenreName}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Platforms */}
            <div className="mb-8">
              <p className="text-[11px] text-white/40 font-bold tracking-widest uppercase mb-3">Include Data From</p>
              <div className="space-y-2.5">
                {[
                  { id: 'spotify', name: 'Spotify', icon: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z', color: 'text-[#1DB954]' },
                  { id: 'apple', name: 'Apple Music', icon: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.928 1.16-1.68 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.484-4.662 2.597-4.74-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z', color: 'text-white' },
                  { id: 'youtube', name: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', color: 'text-[#FF0000]' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlatforms(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                    className={"w-full flex items-center p-3.5 rounded-xl border transition-all duration-300 " + (platforms[p.id] ? 'bg-white/10 border-white/20 shadow-lg' : 'bg-transparent border-white/5 hover:bg-white/5')}
                  >
                    <div className={"w-5 h-5 rounded flex items-center justify-center mr-4 transition-colors " + (platforms[p.id] ? 'bg-cyan-500' : 'bg-white/10')}>
                      {platforms[p.id] && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                    </div>
                    <svg className={"w-5 h-5 mr-3 " + p.color} viewBox="0 0 24 24" fill="currentColor">
                      <path d={p.icon} />
                    </svg>
                    <span className="text-sm font-semibold text-white/90">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              disabled={isSearching || !searchQuery.trim()}
              className="w-full py-4 bg-white hover:bg-gray-100 text-black rounded-xl text-sm font-bold shadow-xl shadow-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-[2px] border-black/20 border-t-black rounded-full animate-spin" />
                  Analyzing Catalog...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Calculate Valuation
                </>
              )}
            </button>
            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

            {/* Results */}
            <div className={"transition-all duration-500 overflow-hidden " + (estimatedValue !== null ? 'max-h-[700px] opacity-100 mt-8 pt-8 border-t border-white/10' : 'max-h-0 opacity-0 m-0 p-0 border-transparent')}>
              <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase text-center mb-3">Estimated Catalog Value</p>
              <p className="text-[3rem] lg:text-[3.5rem] font-bold text-center tracking-tight mb-2 leading-none text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                {formatLocalCurrency(estimatedValue)}
              </p>
              <p className="text-xs text-white/40 text-center mb-6 max-w-sm mx-auto">
                Based on top 10 tracks public data
              </p>
              
              {/* Custom Options */}
              <div className="flex flex-col gap-3 mb-8 bg-white/5 border border-white/10 p-4 rounded-2xl shadow-inner">
                {/* Royalty Share Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70">Royalty share</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-black/20 border border-white/10 rounded-lg overflow-hidden h-8 focus-within:border-cyan-500/50 transition-colors">
                      <input 
                        type="number" 
                        value={royaltyShare}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') setRoyaltyShare('');
                          else setRoyaltyShare(Math.min(100, Math.max(0, Number(val))));
                        }}
                        className="w-12 bg-transparent text-white text-center text-sm focus:outline-none"
                      />
                      <span className="text-white/40 text-xs pr-2">%</span>
                    </div>
                    <button 
                      onClick={() => setRoyaltyShare(100)}
                      className="px-2.5 h-8 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg text-xs font-semibold transition-all"
                    >
                      Get 100%
                    </button>
                  </div>
                </div>

                {/* Currency Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70">Currency</span>
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="appearance-none bg-black/20 border border-white/10 text-white/90 text-xs font-semibold h-8 pl-3 pr-8 rounded-lg focus:outline-none focus:border-cyan-500/50 hover:border-white/20 transition-all cursor-pointer"
                    >
                      {availableCurrencies.map(curr => (
                        <option key={curr} value={curr} className="bg-[#0A101D] text-white">
                          {curr}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/50">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
              
              <a 
                href="https://www.creativefundingagency.com/application"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl text-sm font-bold text-white shadow-lg transition-all items-center justify-center gap-2"
              >
                Get a Real Offer for this Catalog
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Connect DSPs */}
          <div id="auth-section" className="bg-[#0A101D]/80 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-[32px] p-8 lg:p-10 shadow-2xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1 text-white">Detailed Report</h3>
                <p className="text-sm text-white/50">Securely connect DSPs for a private, accurate appraisal.</p>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-20 h-20 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Distributor Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowDistributors(!showDistributors)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Landmark className="w-3.5 h-3.5 text-white/70" />
                    </div>
                    <span className="text-sm font-semibold text-white/90">Sign in to Distributor</span>
                  </div>
                  <ChevronDown className={"w-4 h-4 text-white/50 transition-transform " + (showDistributors ? 'rotate-180' : '')} />
                </button>

                {showDistributors && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B101A] border border-white/10 rounded-xl overflow-hidden z-20 py-2 shadow-2xl backdrop-blur-xl max-h-[250px] overflow-y-auto">
                    {distributors.map((d, idx) => (
                      <button key={idx} onClick={() => navigate('/import', { state: { distributor: d.name } })} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
                        <div className="w-6 h-6 rounded flex-shrink-0 overflow-hidden bg-white/5">
                          <img 
                            src={d.img} 
                            alt={d.name} 
                            className={"w-full h-full object-cover " + (d.name === 'Too Lost' ? 'scale-[1.4]' : '')}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                        <span className="text-sm font-medium text-white/90">{d.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-[1px] bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">OR DIRECT DSP</span>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>

              <button
                onClick={handleSpotifySignIn}
                disabled={loading.spotify}
                className="w-full py-4 bg-[#1DB954] hover:bg-[#1ED760] rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                {loading.spotify ? 'Connecting...' : 'Connect Spotify for Artists'}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleYouTubeSignIn}
                  disabled={loading.youtube}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  {loading.youtube ? '...' : 'YouTube'}
                </button>
                
                <button
                  onClick={handleAppleSignIn}
                  disabled={loading.apple}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.928 1.16-1.68 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.484-4.662 2.597-4.74-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
                  </svg>
                  {loading.apple ? '...' : 'Apple'}
                </button>
              </div>
            </div>

            <p className="text-center text-[10px] leading-relaxed text-white/30 mt-6 px-4">
              By connecting, you agree to our <a href="#" className="underline hover:text-white/60">Terms</a>. We request read-only access.
            </p>
          </div>
          
        </div>

        {/* Trust Badges Ribbon */}
        <div className="mt-16 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white/90">Institutional Security</p>
              <p className="text-[11px] text-white/50">Your catalog data is strictly confidential.</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-white/10" />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white/90">Trusted Valuations</p>
              <p className="text-[11px] text-white/50">Backed by real transaction models.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

}

function InfoIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  );
}
