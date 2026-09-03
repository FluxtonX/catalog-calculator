import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import { supabase } from './utils/supabase';
import { Toaster } from 'react-hot-toast';

import Auth from './pages/Auth';
import AdminPanel from './pages/AdminPanel';
import ValuationTool from './pages/ValuationTool';
import UserDashboard from './pages/UserDashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import ProPlan from './pages/ProPlan';
import LandingPage from './pages/LandingPage';
import DataImport from './pages/DataImport';

function App() {
  const [oauthError, setOauthError] = React.useState(null);

  // Global auth initialization to catch OAuth redirects
  useEffect(() => {
    console.log("🚀 App mounted: Checking Supabase session...");
    console.log("📍 Current URL Search:", window.location.search);
    console.log("📍 Current URL Hash:", window.location.hash);
    
    const hashStr = window.location.hash.substring(1);
    const params = new URLSearchParams(hashStr || window.location.search);
    
    // 1. Check for errors
    const errorDesc = params.get('error_description') || params.get('error');
    if (errorDesc) {
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setOauthError(decodeURIComponent(errorDesc).replace(/\+/g, ' '));
       window.history.replaceState(null, '', window.location.pathname);
    }

    // 2. FORCE MANUAL SESSION INJECTION (Bypasses all race conditions)
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    
    if (accessToken && refreshToken) {
      console.log("🛠️ Found tokens in URL! Forcing manual session injection...");
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
         if (error) console.error("❌ Manual injection failed:", error);
         else {
            console.log("✅ Manual injection successful!");
            window.history.replaceState(null, '', window.location.pathname);
         }
      });
    } else {
      // 3. Fallback to normal check if no tokens in URL
      supabase.auth.getSession().then(({ data: { session }, error }) => {
         if (error) {
            console.error("❌ Global Auth Session Error:", error);
         } else {
            console.log("✅ Initial getSession result:", session ? "LOGGED IN" : "NO SESSION");
         }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       console.log(`🔔 Auth Event: ${event}`, session ? "User Session Active" : "No Session");
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      {oauthError && (
         <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-500 text-white p-4 text-center font-bold shadow-lg">
            🚨 Auth Error: {oauthError}
            <br />
            <span className="text-sm font-normal">Check your Supabase Google Provider settings! (Client ID / Secret might be missing or invalid)</span>
            <button onClick={() => setOauthError(null)} className="absolute top-2 right-4 text-white text-xl">&times;</button>
         </div>
      )}
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<LandingPage />} />

          {/* Valuation is public — auth only triggered on PDF download */}
          <Route element={<MainLayout />}>
            <Route path="/valuation" element={<ValuationTool />} />
            <Route path="/pro-plan" element={<ProPlan />} />
            <Route path="/import" element={<DataImport />} />
          </Route>

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="bottom-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white', duration: 4000 }} />
    </ThemeProvider>
  );
}

export default App;