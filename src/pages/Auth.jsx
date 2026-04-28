import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music, Loader2, AlertCircle } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState({ google: false, spotify: false, youtube: false, apple: false });
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/valuation';

  useEffect(() => {
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/valuation', { replace: true });
      }
    });

    // Check session on mount
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
      setLoading({ ...loading, google: true });
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/valuation` },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message || 'Failed to sign in with Google');
      setLoading({ ...loading, google: false });
    }
  };

  const handleYoutubeSignIn = async () => {
    try {
      setLoading({ ...loading, youtube: true });
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/valuation`,
          scopes: 'https://www.googleapis.com/auth/youtube.readonly'
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message || 'Failed to sign in with YouTube');
      setLoading({ ...loading, youtube: false });
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading({ ...loading, apple: true });
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: `${window.location.origin}/valuation` },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message || 'Failed to sign in with Apple');
      setLoading({ ...loading, apple: false });
    }
  };

  const handleSpotifySignIn = async () => {
    try {
      setLoading({ ...loading, spotify: true });
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
      setLoading({ ...loading, spotify: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
        <div className="p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-md opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Music size={32} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Sign in to access catalog valuations
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                {error}
              </p>
            </div>
          )}

          {/* Sign In Buttons */}
          <div className="space-y-3">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={Object.values(loading).some(Boolean)}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 rounded-xl font-bold text-slate-900 dark:text-white transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
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

            {/* Spotify Sign In */}
            <button
              onClick={handleSpotifySignIn}
              disabled={Object.values(loading).some(Boolean)}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#1DB954] hover:bg-[#1ed760] border-2 border-[#1DB954] hover:border-[#1ed760] rounded-xl font-bold text-white transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
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

            {/* YouTube Sign In */}
            <button
              onClick={handleYoutubeSignIn}
              disabled={Object.values(loading).some(Boolean)}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 rounded-xl font-bold text-slate-900 dark:text-white transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading.youtube ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              )}
              <span>Continue with YouTube</span>
            </button>

            {/* Apple Sign In */}
            <button
              onClick={handleAppleSignIn}
              disabled={Object.values(loading).some(Boolean)}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-black hover:bg-slate-900 border-2 border-black hover:border-slate-900 rounded-xl font-bold text-white transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading.apple ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.057 10.78c.045 2.152 1.877 2.865 1.905 2.877-.014.053-.298.995-1.002 1.989-.607.863-1.238 1.722-2.228 1.739-.974.017-1.288-.553-2.404-.553-1.115 0-1.464.536-2.387.57-.908.032-1.63-.918-2.241-1.782-1.252-1.766-2.203-4.991-.914-7.143.64-1.068 1.78-1.745 3.012-1.763 1.157-.017 1.83.612 2.538.612.709 0 1.547-.76 2.651-.65 1.103.11 1.933.627 2.454 1.365-2.261 1.31-1.895 4.391.617 5.739zM14.613 5.48c.602-.707 1.006-1.688.894-2.67-.872.034-1.926.561-2.551 1.268-.56.63-.948 1.625-.826 2.589.972.073 1.881-.48 2.483-1.187z"/>
                </svg>
              )}
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-center text-slate-600 dark:text-slate-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              We only access your basic profile information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}