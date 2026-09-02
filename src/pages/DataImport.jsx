import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, ArrowLeft, Loader2, Music, DollarSign, ListMusic, User, Lock } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

export default function DataImport() {
  const location = useLocation();
  const navigate = useNavigate();
  // Restore distributor from location.state or from localStorage (preserved across auth redirect)
  const distributor = location.state?.distributor 
    || window.localStorage.getItem('cc_pending_distributor') 
    || 'Your Distributor';
  
  usePageTitle(`Data from ${distributor} | FluxtonX`);

  const [extractedData, setExtractedData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [extractionStatusText, setExtractionStatusText] = useState('Extracting...');
  const [progress, setProgress] = useState(0);

  const handleExtractWithAI = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    if (isExtracting) return;
    
    setIsExtracting(true);
    setProgress(0);
    setExtractionStatusText('Connecting to Concord securely...');
    const toastId = toast.loading(`Connecting to Deck.co...`);
    
    // Start progress immediately so it doesn't hang at 0%
    const progressInterval = setInterval(() => {
      setProgress(p => {
         if (p >= 98) return 98;
         const increment = p < 50 ? 5 : (p < 80 ? 2 : 1);
         return p + increment;
      });
    }, 1500);

    const messages = [
      "Agent navigating dashboard...",
      "Extracting royalty tables...",
      "Compiling final catalog data...",
      "Almost done, wrapping up..."
    ];
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      setExtractionStatusText(messages[msgIndex]);
      msgIndex = (msgIndex + 1) % messages.length;
    }, 5000);

    const attemptExtraction = async (attempt) => {
      try {
        // Step 1: Start the extraction
        const startRes = await supabase.functions.invoke('fetch-distributor-catalog', {
          body: { action: 'start', distributor, credentials: { email, password } }
        });
        
        if (startRes.error) throw startRes.error;
        const { taskRunId } = startRes.data;

        // Step 2: Poll for completion
        const pollInterval = setInterval(async () => {
        try {
           const pollRes = await supabase.functions.invoke('fetch-distributor-catalog', {
             body: { action: 'poll', distributor, taskRunId }
           });
           
           if (pollRes.error) {
              clearInterval(pollInterval);
              clearInterval(msgInterval);
              clearInterval(progressInterval);
              setIsExtracting(false);
              throw pollRes.error;
           }

           const status = pollRes.data.status;

           if (status === 'completed') {
              clearInterval(pollInterval);
              clearInterval(msgInterval);
              clearInterval(progressInterval);
              setProgress(100);
              setIsExtracting(false);
              
              toast.success(`Successfully extracted catalog from ${distributor}!`, { id: toastId });
              if (pollRes.data.data) {
                handleDataReceived(pollRes.data.data);
              }
           } else if (status === 'queued') {
              setExtractionStatusText('Waiting in line for AI server...');
           } else if (status === 'running' || status === 'in_progress') {
              // Just let the rotating messages handle it
           } else if (status === 'failed' || status === 'canceled' || status === 'timeout') {
              clearInterval(pollInterval);
              if (attempt < 3) {
                 setExtractionStatusText(`AI hiccup, retrying safely... (Attempt ${attempt + 1} of 3)`);
                 setProgress(10);
                 attemptExtraction(attempt + 1);
              } else {
                 clearInterval(msgInterval);
                 clearInterval(progressInterval);
                 setIsExtracting(false);
                 toast.error(`Extraction ${status} after 3 attempts. Please try again.`, { id: toastId });
              }
           } else if (status === 'interaction_required') {
              clearInterval(pollInterval);
              clearInterval(msgInterval);
              clearInterval(progressInterval);
              setIsExtracting(false);
              toast.error(`Security check required. Please login manually first.`, { id: toastId });
           }
        } catch (pollErr) {
           clearInterval(pollInterval);
           if (attempt < 3) {
              setExtractionStatusText(`Network hiccup, retrying safely... (Attempt ${attempt + 1} of 3)`);
              setProgress(10);
              attemptExtraction(attempt + 1);
           } else {
              clearInterval(msgInterval);
              clearInterval(progressInterval);
              setIsExtracting(false);
              console.error(pollErr);
              toast.error(pollErr.message || "An error occurred while polling.", { id: toastId, duration: 5000 });
           }
        }
      }, 5000);

    } catch (err) {
      console.error(err);
      if (attempt < 3) {
         setExtractionStatusText(`Startup hiccup, retrying safely... (Attempt ${attempt + 1} of 3)`);
         setProgress(10);
         setTimeout(() => attemptExtraction(attempt + 1), 2000);
      } else {
         clearInterval(msgInterval);
         clearInterval(progressInterval);
         
         // Make errors user-friendly instead of technical jargon
         let friendlyError = "We couldn't extract your data right now. Please try again.";
         if (err.message?.includes('non-2xx status code') || err.message?.includes('Failed to send a request')) {
           friendlyError = "Our extraction server is currently busy or unavailable. Please try again in a moment.";
         } else if (err.message) {
           friendlyError = err.message.length < 50 ? err.message : friendlyError;
         }

         toast.error(friendlyError, { id: toastId, duration: 5000 });
         setIsExtracting(false);
      }
    } 
  };

  attemptExtraction(1);
};

  useEffect(() => {
    // Use getSession() not getUser() to avoid 401 race conditions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      // If user just logged in and we have extracted data that wasn't saved yet, save it now
      if (currentUser && extractedData && !saveSuccess && !isSaving) {
        setShowAuthModal(false);
        saveToHistory(extractedData, currentUser.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [extractedData, saveSuccess, isSaving]);

  const saveToHistory = async (dataToSave, userId) => {
    if (isSaving || saveSuccess) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('extraction_history').insert([{
         user_id: userId,
         distributor: distributor,
         artist_name: dataToSave.artistName || 'Unknown Artist',
         total_revenue: parseFloat(dataToSave.totalRevenue || 0),
         total_streams: parseInt(dataToSave.totalStreams || 0, 10),
         total_tracks: parseInt(dataToSave.totalTracks || 0, 10)
      }]);
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      setSaveSuccess(true);
      // Clean up all pending keys after successful save
      window.localStorage.removeItem('cc_pending_save');
      window.localStorage.removeItem('cc_pending_distributor');
    } catch (err) {
      console.error('Failed to save history:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataReceived = async (data) => {
      const formatted = {
         artistName: data.artistName || 'Unknown Artist',
         totalRevenue: data.totalRevenue || '0.00',
         totalStreams: data.totalStreams || '0',
         totalTracks: data.totalTracks || '0'
      };
      setExtractedData(formatted);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
         setShowAuthModal(true);
      } else {
         await saveToHistory(formatted, session.user.id);
      }
  };

  useEffect(() => {
    const storedData = window.localStorage.getItem('cc_pending_extraction');
    if (storedData) {
       try {
         const data = JSON.parse(storedData);
         handleDataReceived(data);
         window.localStorage.removeItem('cc_pending_extraction');
       } catch (err) {
         console.error("Failed to parse pending extraction data:", err);
       }
    }
  }, [distributor]);

  // Format helpers
  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "$0.00";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };
  
  const formatNumber = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 pt-24 relative">
      
      {/* Soft Save Banner - appears below data, not blocking */}

      <button onClick={() => navigate('/')} className="absolute top-28 left-6 md:left-12 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-black/10"></div>
           <div className="relative z-10">
             <h1 className="text-3xl font-black text-white tracking-tight mb-2">{distributor} Dashboard</h1>
             <p className="text-white/80 font-medium">
               {extractedData ? 'Your catalog data has been successfully imported.' : 'Waiting for real-time extraction.'}
             </p>
           </div>
        </div>

        <div className="p-8">
          
          {!extractedData ? (
             <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 relative mb-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-100 dark:border-indigo-800">
                   <Lock className="text-indigo-500 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Connect your account</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                  Enter your {distributor} credentials so our Deck.co AI can securely extract your catalog data.
                </p>
                <form onSubmit={handleExtractWithAI} className="w-full max-w-sm flex flex-col gap-4">
                  <div className="flex flex-col text-left">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="artist@example.com"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isExtracting}
                    className="w-full mt-2 relative overflow-hidden bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-90 disabled:cursor-not-allowed group h-12"
                  >
                    {/* Progress Bar Background */}
                    {isExtracting && (
                      <div 
                        className="absolute top-0 left-0 h-full bg-indigo-500/50 transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    )}
                    
                    <div className="relative z-10 flex items-center justify-center gap-2 h-full">
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{extractionStatusText} ({progress}%)</span>
                        </>
                      ) : (
                        'Extract with AI'
                      )}
                    </div>
                  </button>
                </form>
             </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Extraction Successful text has been removed as per client request */}
               
               <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden mb-8 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all hover:shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700/50">
                     
                     <div className="p-6 md:p-8 flex flex-col justify-center bg-slate-50/50 dark:bg-transparent group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors min-w-0">
                        <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 mb-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                            <User size={16} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Artist Profile</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-tight mt-1 break-words line-clamp-3" title={extractedData.artistName}>{extractedData.artistName}</p>
                     </div>

                     <div className="p-6 md:p-8 flex flex-col justify-center group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                        <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 mb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <DollarSign size={16} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Lifetime Revenue</span>
                        </div>
                        <p className="text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">{formatCurrency(extractedData.totalRevenue)}</p>
                     </div>

                     <div className="p-6 md:p-8 flex flex-col justify-center md:border-t border-slate-100 dark:border-slate-700/50 group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                        <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <Music size={16} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Streams</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight mt-1">{formatNumber(extractedData.totalStreams)}</p>
                     </div>

                     <div className="p-6 md:p-8 flex flex-col justify-center md:border-t border-slate-100 dark:border-slate-700/50 group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                        <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 mb-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                            <ListMusic size={16} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Tracks</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight mt-1">{formatNumber(extractedData.totalTracks)}</p>
                     </div>

                  </div>
               </div>

               {/* Save Banner */}
               {user && saveSuccess ? (
                  <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                     <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">✓ Saved to your account — find it anytime in the sidebar.</span>
                  </div>
               ) : user && isSaving ? (
                  <div className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                     <span className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Saving to your account...</span>
                  </div>
               ) : !user && showAuthModal ? (
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                     <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Lock className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">Log in to save this dashboard</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                           Next time you visit, your <span className="font-semibold text-indigo-600 dark:text-indigo-400">{distributor}</span> data will load instantly from your history — no extraction needed.
                        </p>
                     </div>
                     <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                           onClick={() => {
                             // Preserve both data AND distributor name across auth redirect
                             if (extractedData) {
                               window.localStorage.setItem('cc_pending_extraction', JSON.stringify(extractedData));
                               window.localStorage.setItem('cc_pending_distributor', distributor);
                             }
                             navigate('/auth');
                           }}
                           className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-indigo-500/30 whitespace-nowrap"
                        >
                           Log In / Sign Up
                        </button>
                        <button
                           onClick={() => setShowAuthModal(false)}
                           className="px-4 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-semibold text-center transition-colors"
                        >
                           Not now
                        </button>
                     </div>
                  </div>
               ) : (
                  <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                     This is a one-time secure view. Refresh the page to clear.
                  </p>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
