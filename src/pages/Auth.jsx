import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { enableDistributionCompanies } from '../config/feature_flags';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState({ google: false, youtube: false, spotify: false, apple: false });
  const [error, setError] = useState(null);

  const [showDistributors, setShowDistributors] = useState(false);

  const distributors = [
    { name: 'TuneCore', icon: 'T', color: 'bg-yellow-500' },
    { name: 'DistroKid', icon: 'D', color: 'bg-blue-500' },
    { name: 'CD Baby', icon: 'C', color: 'bg-orange-500' },
    { name: 'Symphonic', icon: 'S', color: 'bg-pink-500' },
    { name: 'UnitedMasters', icon: 'III', color: 'bg-black' },
    { name: 'Ditto Music', icon: 'd', color: 'bg-gray-800' },
    { name: 'AWAL', icon: 'A', color: 'bg-black' },
    { name: 'Stem', icon: 'S', color: 'bg-purple-600' },
    { name: 'Amuse', icon: 'a', color: 'bg-yellow-400' },
    { name: 'Record Union', icon: 'ru', color: 'bg-black' },
    { name: 'Too Lost', icon: 'TL', color: 'bg-purple-500' },
  ];

  useEffect(() => {
    // Step 1: Manually extract tokens from URL hash (permanent fix for React Router race condition)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    console.log('🔍 Auth.jsx useEffect: hash=', hash ? 'EXISTS' : 'EMPTY');
    console.log('🔍 access_token found:', !!accessToken);
    console.log('🔍 refresh_token found:', !!refreshToken);

    if (accessToken && refreshToken) {
      console.log('🛠️ Calling setSession...');
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error }) => {
          console.log('setSession result - error:', error, 'session:', !!data?.session);
          if (error) {
            setError(`Auth failed: ${error.message}`);
          } else if (data?.session) {
            window.history.replaceState(null, '', window.location.pathname);
            // If there's pending extraction data, go back to /import to save it
            const hasPending = !!window.localStorage.getItem('cc_pending_extraction');
            navigate(hasPending ? '/import' : '/valuation', { replace: true });
          } else {
            setError('Session could not be established. Please try again.');
          }
        });
      return;
    }

    // Step 2: Normal auth state listener for already-logged-in users
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, !!session);
      if (session) {
        const hasPending = !!window.localStorage.getItem('cc_pending_extraction');
        navigate(hasPending ? '/import' : '/valuation', { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/valuation', { replace: true });
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(prev => ({ ...prev, google: true }));
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect back to /auth so our token-extraction code fires before navigating
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message || 'Failed to sign in with Google');
      setLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleYouTubeSignIn = async () => {
    try {
      setLoading(prev => ({ ...prev, youtube: true }));
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
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
          redirectTo: `${window.location.origin}/auth`,
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
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message || 'Failed to sign in with Apple');
      setLoading(prev => ({ ...prev, apple: false }));
    }
  };

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
        <div className="p-8">

          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-20 h-20 object-contain"
                style={{ filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.4))' }}
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Sign in to access catalog valuations
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>
            </div>
          )}

          {/* Sign In Buttons */}
          <div className="space-y-4">

            {/* Distribution Company Dropdown Mockup */}
            {enableDistributionCompanies && (
              <div className="w-full">
                <button
                  onClick={() => setShowDistributors(!showDistributors)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
                    </svg>
                    <span className="font-medium text-sm">Sign in to Distribution Company</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${showDistributors ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDistributors && (
                  <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex flex-col py-1 max-h-60 overflow-y-auto custom-scrollbar">
                      {distributors.map((dist) => (
                        <button
                          key={dist.name}
                          onClick={() => navigate('/import', { state: { distributor: dist.name } })}
                          className="flex items-center gap-4 px-4 py-2.5 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors w-full text-left"
                        >
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${dist.color}`}>
                            {dist.icon}
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{dist.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl font-semibold text-slate-900 dark:text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.google ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* YouTube */}
            <button
              onClick={handleYouTubeSignIn}
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#FF0000] hover:bg-[#e60000] border-2 border-[#FF0000] hover:border-[#e60000] rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.youtube ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              )}
              <span>Continue with YouTube</span>
            </button>

            {/* Spotify */}
            <button
              onClick={handleSpotifySignIn}
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1DB954] hover:bg-[#1ed760] border-2 border-[#1DB954] hover:border-[#1ed760] rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.spotify ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              )}
              <span>Continue with Spotify</span>
            </button>

            {/* Apple */}
            <button
              onClick={handleAppleSignIn}
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black hover:bg-slate-800 border-2 border-black hover:border-slate-700 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.apple ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              )}
              <span>Continue with Apple</span>
            </button>

          </div>

          {/* Privacy Notice */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-center text-slate-600 dark:text-slate-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              <br />
              YouTube sign-in also requests read-only access to your channel.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}