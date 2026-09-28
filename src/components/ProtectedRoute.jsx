import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (isMounted) setSession(currentSession);

        if (currentSession && requiredRole) {
          const cacheKey = `cc_role_${currentSession.user.id}`;
          const cachedRole = sessionStorage.getItem(cacheKey);
          
          if (cachedRole) {
            if (isMounted) {
              setUserRole(cachedRole);
              setLoading(false);
            }
          } else {
            if (isMounted) setLoading(true);
            const { data, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', currentSession.user.id)
              .single();
              
            if (profileError) {
               console.error("Profile fetch error:", profileError);
            }
            
            const fetchedRole = data?.role || 'user';
            sessionStorage.setItem(cacheKey, fetchedRole);
            
            if (isMounted) {
              setUserRole(fetchedRole);
            }
          }
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifyAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUserRole(null);
      } else if (event === 'SIGNED_IN') {
        verifyAccess();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin h-12 w-12 text-emerald-500" />
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-semibold">
            Checking Permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  if (userRole === 'banned') {
    // If the user has been banned/removed by an admin, completely block them
    supabase.auth.signOut();
    return <Navigate to="/auth" replace />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
