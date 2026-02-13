import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin h-12 w-12 text-emerald-500" />
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-semibold">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Render protected content
  return children;
}