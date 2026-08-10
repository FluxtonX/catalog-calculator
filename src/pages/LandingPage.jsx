import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check, Calculator, Lock, ChevronDown, Zap, ChevronRight, CheckCircle2, ShieldCheck, Music, Hexagon, Landmark } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { searchApify, searchYouTube, searchItunes, searchAppleMusic, getYouTubeChannelDetails } from '../utils/api';
import { getCombinedValuation, formatCurrency } from '../utils/combinedValuation';

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
  const [royaltyShare, setRoyaltyShare] = useState(100);
  
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
    let rate = 1;
    let symbol = '$';
    if (currency === 'GBP') { rate = 0.79; symbol = '£'; }
    if (currency === 'EUR') { rate = 0.92; symbol = '€'; }
    
    const converted = adjustedValue * rate;
    
    if (converted >= 1_000_000_000) return `${symbol}${(converted / 1_000_000_000).toFixed(2)}B`;
    if (converted >= 1_000_000) return `${symbol}${(converted / 1_000_000).toFixed(2)}M`;
    if (converted >= 1_000) return `${symbol}${(converted / 1_000).toFixed(1)}K`;
    return `${symbol}${converted.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-[#05080F] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-[10%] w-[40%] h-[50%] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/4 -right-[10%] w-[40%] h-[50%] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-[960px] mx-auto px-4 md:px-6 pb-24">
        
        {/* Header */}
        <header className="relative py-8 flex items-center justify-center">
          
          {/* Centered Logo */}
          <div className="flex items-center gap-3 transform translate-x-[18px]">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Hexagon className="absolute inset-0 w-10 h-10 text-cyan-400" strokeWidth={1.5} />
              <Calculator className="w-4 h-4 text-white relative z-10" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                Catalog <span className="text-[#00E5FF] font-medium">Calculator</span>
              </h1>
              <p className="text-[11px] text-white/60 font-medium tracking-wide">by CFA</p>
            </div>
          </div>

          {/* Right Button */}
          <div className="absolute right-0">
            <button 
              onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-purple-500/30 hover:bg-white/5 rounded-xl text-[13px] font-medium text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              <Lock className="w-3.5 h-3.5 opacity-80" />
              Connect Your DSPs
              <ChevronRight className="w-3.5 h-3.5 opacity-50 ml-1" />
            </button>
          </div>
        </header>

        {/* Hero */}
        <div className="text-center mt-10 md:mt-12 mb-12 md:mb-16 space-y-4 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-white tracking-tight">
            What's Your Catalog Worth?
          </h2>
          <p className="text-white/60 text-sm md:text-[15px] max-w-2xl mx-auto">
            Search for an artist and get an estimated catalog valuation based on Spotify, Apple Music, and YouTube.
          </p>
        </div>

        {/* Option 1 Row */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start mb-12">
          
          {/* Left Sidebar Option 1 */}
          <div className="w-full lg:w-[220px] flex-shrink-0 pt-2 lg:pt-4">
            <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase rounded border border-blue-500/20 mb-6">
              OPTION 1
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-3 leading-tight">Get a quick<br/>estimate</h3>
                <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">
                  Select one or multiple platforms to generate an overall estimated value.
                </p>
              </div>
            </div>

            {/* Added Login Section */}
            <div className="mt-12 bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
              <p className="text-xs text-white/80 font-medium mb-3 leading-relaxed relative z-10">
                Login for a detailed valuation report
              </p>
              <button 
                onClick={() => navigate('/auth')}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[13px] font-semibold text-white transition-all shadow-lg shadow-blue-500/20 relative z-10"
              >
                <Lock className="w-3.5 h-3.5" />
                Login
              </button>
            </div>
          </div>

          {/* Right Main Box Option 1 */}
          <div className="flex-1 w-full">
            <div className="bg-[#0B101A] border border-[#1A2333] rounded-[24px] p-6 lg:p-8 shadow-2xl relative">
              
              {/* Search */}
              <div className="relative mb-8 z-50">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search artist name..."
                  className="w-full bg-[#05080F] border border-[#1A2333] rounded-xl py-4 pl-12 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setShowSuggestions(false);
                      handleCalculate();
                    }
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                  {isSuggesting ? (
                    <div className="w-4 h-4 border-2 border-cyan-500/50 border-t-cyan-500 rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-white/30" />
                  )}
                </div>
                
                {/* Auto-suggest Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#05080F] border border-[#1A2333] rounded-xl shadow-2xl overflow-hidden z-50">
                    {suggestions.map((artist, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-[#1A2333] last:border-0 text-sm text-white flex items-center gap-3"
                        onClick={() => {
                          setSearchQuery(artist.artistName);
                          setShowSuggestions(false);
                        }}
                      >
                        <Search className="w-4 h-4 text-white/30" />
                        <span className="font-medium">{artist.artistName}</span>
                        {artist.primaryGenreName && (
                          <span className="text-[10px] text-white/40 uppercase tracking-wider ml-auto">{artist.primaryGenreName}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Sources */}
              <div className="mb-8">
                <p className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase text-center mb-4">Select Data Sources</p>
                <div className="space-y-2">
                  {[
                    { id: 'spotify', name: 'Spotify', icon: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z', color: 'text-[#1DB954]' },
                    { id: 'apple', name: 'Apple Music', icon: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.928 1.16-1.68 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.484-4.662 2.597-4.74-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z', color: 'text-white' },
                    { id: 'youtube', name: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', color: 'text-[#FF0000]' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlatforms(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                      className="w-full flex items-center justify-between p-4 bg-[#05080F] border border-[#1A2333] hover:border-white/10 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors ${platforms[p.id] ? 'bg-[#1DB954]' : 'bg-[#1A2333]'}`}>
                          {platforms[p.id] && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                        <svg className={`w-[18px] h-[18px] ${p.color}`} viewBox="0 0 24 24" fill="currentColor">
                          <path d={p.icon} />
                        </svg>
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 text-white/40">
                <InfoIcon className="w-[14px] h-[14px] flex-shrink-0" />
                <p className="text-[11px]">Combine Spotify, Apple Music, and YouTube for one overall estimated value.</p>
              </div>

              <button 
                onClick={handleCalculate}
                disabled={isSearching || !searchQuery.trim()}
                className="w-full py-3.5 bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-[#334155] hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-white shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-[1.5px] border-white/30 border-t-[#00FF66] rounded-full animate-spin" />
                    <span className="animate-pulse">Calculating...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 opacity-70" />
                    Calculate Catalog Value
                  </>
                )}
              </button>

              {error && (
                <p className="text-red-400 text-sm text-center mt-4">{error}</p>
              )}

              {/* Results */}
              <div className={`transition-all duration-500 overflow-hidden ${estimatedValue !== null ? 'max-h-[500px] opacity-100 mt-10 pt-8 border-t border-[#1A2333]' : 'max-h-0 opacity-0 m-0 p-0 border-transparent'}`}>
                <p className="text-[10px] text-[#00E5FF] font-bold tracking-widest uppercase text-center mb-2">ESTIMATED CATALOG VALUE</p>
                <p className="text-[3.5rem] font-bold text-center tracking-tight mb-2 leading-none text-white">
                  {formatLocalCurrency(estimatedValue)}
                </p>
                <p className="text-[11px] text-white/40 text-center mb-6 max-w-sm mx-auto">
                  This estimate is based on their top 10 songs only
                </p>
                
                {/* Custom Inputs */}
                <div className="flex flex-col gap-4 max-w-[320px] mx-auto mb-8 bg-[#0B101A] border border-[#1A2333] p-4 rounded-xl shadow-lg">
                  {/* Royalty Share Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white/70">Royalty share</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-[#05080F] border border-[#1A2333] rounded-lg overflow-hidden h-8 focus-within:border-cyan-500/50 transition-colors">
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
                    <span className="text-[13px] font-medium text-white/70">Currency</span>
                    <div className="flex items-center gap-1.5">
                      {['USD', 'GBP', 'EUR'].map(curr => (
                        <button
                          key={curr}
                          onClick={() => setCurrency(curr)}
                          className={`px-3 h-8 rounded-lg text-xs font-semibold transition-all ${
                            currency === curr 
                              ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                              : 'bg-[#05080F] border border-[#1A2333] text-white/50 hover:text-white/90 hover:border-white/20'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <a 
                  href="https://www.creativefundingagency.com/application"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-auto flex w-full max-w-[380px] py-3.5 bg-gradient-to-r from-[#C29C5B] to-[#A27A3F] hover:brightness-110 rounded-xl text-[15px] font-medium text-white shadow-xl transition-all items-center justify-center gap-3"
                >
                  Sell Your Catalog Now
                  <span className="text-lg font-light leading-none mb-[2px]">&rarr;</span>
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* Divider / Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 py-12 border-y border-[#1A2333] mb-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/80">Private & Confidential</p>
              <p className="text-[10px] text-white/40">Your data is secure and never shared.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] text-white/40 font-medium">Powered by</p>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight">CFA</span>
              <span className="text-[8px] text-white/60 font-medium leading-[10px] uppercase">CREATIVE FUNDING<br/>AGENCY</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-white/60" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/80">Trusted by Artists & Rights Holders</p>
              <p className="text-[10px] text-white/40">Accurate valuations. Real offers.</p>
            </div>
          </div>
        </div>

        {/* Option 2 Row */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start" id="auth-section">
          
          {/* Left Sidebar Option 2 */}
          <div className="w-full lg:w-[220px] flex-shrink-0 pt-2 lg:pt-4">
            <div className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold tracking-widest uppercase rounded border border-purple-500/20 mb-6">
              OPTION 2
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-3 leading-tight">Connect for<br/>actual valuation</h3>
                <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">
                  Login via your preferred DSP to pull actual read-only account data for a more accurate valuation.
                </p>
              </div>
            </div>
          </div>

          {/* Right Main Box Option 2 */}
          <div className="flex-1 w-full relative">
            {/* Outer Box for Option 2 exactly like design */}
            <div className="absolute -inset-8 border border-[#1A2333] rounded-[32px] pointer-events-none hidden lg:block" />
            
            <div className="bg-[#0B101A] border border-[#1A2333] rounded-[24px] p-6 lg:p-10 shadow-2xl relative max-w-[440px] mx-auto">
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center mb-4">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-16 h-16 object-contain"
                    style={{ filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.4))' }}
                  />
                </div>
                <h4 className="text-[22px] font-bold mb-1 tracking-tight text-white">Welcome Back</h4>
                <p className="text-[13px] text-white/50">Sign in to access actual valuation data</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 text-center flex items-center justify-center gap-2">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}

              <div className="space-y-3">
                {/* Distributor Dropdown */}
                <div className="relative mb-6">
                  <button 
                    onClick={() => setShowDistributors(!showDistributors)}
                    className="w-full flex items-center justify-between p-3.5 bg-[#05080F] border border-[#1A2333] rounded-xl hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center text-white/50">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-white/80">Sign in to Distribution Company</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showDistributors ? 'rotate-180' : ''}`} />
                  </button>

                  {showDistributors && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#0B101A] border border-[#1A2333] rounded-xl overflow-hidden z-20 py-2 shadow-2xl">
                      {distributors.map((d, idx) => (
                        <button key={idx} onClick={() => navigate('/import', { state: { distributor: d.name } })} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left">
                          <div className="w-[18px] h-[18px] rounded-[4px] overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img 
                              src={d.img} 
                              alt={d.name} 
                              className={`w-full h-full object-cover ${d.name === 'Too Lost' ? 'scale-[1.4]' : ''}`}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.parentElement.nextSibling) e.target.parentElement.nextSibling.style.display = 'flex';
                              }}
                            />
                          </div>
                          <div className="hidden w-[18px] h-[18px] rounded-[4px] items-center justify-center bg-gray-800 text-[10px] font-bold text-white uppercase">
                            {d.name[0]}
                          </div>
                          <span className="text-[13px] text-white/90">{d.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* DSP Logins */}
                <button
                  onClick={handleYouTubeSignIn}
                  disabled={loading.youtube}
                  className="w-full py-3.5 bg-[#FF0000] hover:bg-[#CC0000] rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  {loading.youtube ? 'Connecting...' : 'Continue with YouTube'}
                </button>

                <button
                  onClick={handleSpotifySignIn}
                  disabled={loading.spotify}
                  className="w-full py-3.5 bg-[#1DB954] hover:bg-[#1ED760] rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  {loading.spotify ? 'Connecting...' : 'Continue with Spotify'}
                </button>
                
                <button
                  onClick={handleAppleSignIn}
                  disabled={loading.apple}
                  className="w-full py-3.5 bg-black hover:bg-[#111] rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.928 1.16-1.68 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.484-4.662 2.597-4.74-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
                  </svg>
                  {loading.apple ? 'Connecting...' : 'Continue with Apple'}
                </button>
              </div>

              <p className="text-center text-[9px] leading-relaxed text-white/30 mt-6 px-4">
                By signing in, you agree to our Terms of Service and Privacy Policy.<br/>YouTube sign-in also requests read-only access to your channel.
              </p>
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
