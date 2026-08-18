import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, ArrowLeft, Loader2, Music, DollarSign, ListMusic, User } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function DataImport() {
  const location = useLocation();
  const navigate = useNavigate();
  const distributor = location.state?.distributor || 'Your Distributor';
  
  usePageTitle(`Data from ${distributor} | FluxtonX`);

  const [extractedData, setExtractedData] = useState(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  useEffect(() => {
    // The extension content script will add this attribute
    const checkInstallation = () => {
        if (document.body.hasAttribute('data-cc-ext-installed')) {
            setExtensionInstalled(true);
        }
    };
    
    // Check immediately and then after a small delay in case extension script loads slightly after React
    checkInstallation();
    setTimeout(checkInstallation, 500);

    // 1. ROBUST FALLBACK: Check if extension saved data to localStorage while this component was unmounted
    const storedData = window.localStorage.getItem('cc_pending_extraction');
    if (storedData) {
       try {
         const data = JSON.parse(storedData);
         setExtractedData({
           artistName: data.artistName || 'Unknown Artist',
           totalRevenue: data.totalRevenue || '0.00',
           totalStreams: data.totalStreams || '0',
           totalTracks: data.totalTracks || '0'
         });
         window.localStorage.removeItem('cc_pending_extraction');
       } catch (err) {
         console.error("Failed to parse pending extraction data:", err);
       }
    }
    
    // 2. LIVE LISTENER: Set up a listener for real-time messages from the extension's injected script
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'CATALOG_CALCULATOR_DATA') {
        const data = event.data.payload;
        setExtractedData({
           artistName: data.artistName || 'Unknown Artist',
           totalRevenue: data.totalRevenue || '0.00',
           totalStreams: data.totalStreams || '0',
           totalTracks: data.totalTracks || '0'
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // If they don't have the extension installed, remind them
    if (!extensionInstalled && !extractedData) {
        // We delay it slightly so it doesn't flash if it loads instantly
        const timer = setTimeout(() => setShowExtensionModal(true), 1500);
        return () => clearTimeout(timer);
    } else {
        setShowExtensionModal(false);
    }
  }, [extensionInstalled, extractedData]);

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
      
      {/* Extension Install Modal */}
      {showExtensionModal && !extractedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <UploadCloud className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Extension Required</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              To use automated extraction for {distributor}, you must install the <b>Catalog Calculator Extractor</b> extension.
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href="https://chromewebstore.google.com/detail/catalog-calculator-extractor/INSERT_ID_HERE" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30"
                onClick={() => setShowExtensionModal(false)}
              >
                Install Extension
              </a>
              <button 
                onClick={() => setShowExtensionModal(false)}
                className="w-full py-3.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
              >
                I already installed it
              </button>
            </div>
          </div>
        </div>
      )}

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
                <div className="w-20 h-20 relative mb-8">
                  <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Loader2 className="text-indigo-500 animate-pulse w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Awaiting Data...</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                  Please open your <b>{distributor}</b> dashboard in a new tab. Our secure extension will automatically extract your data once the page fully loads.
                </p>
                <a href="https://pubroyalty.concord.com/" target="_blank" rel="noreferrer" className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                  Open {distributor}
                </a>
             </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Extraction Successful</span>
               </div>
               
               <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8 shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
                     
                     <div className="p-6 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                          <User size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Artist Name</span>
                        </div>
                        <p className="text-xl font-black text-slate-800 dark:text-white truncate">{extractedData.artistName}</p>
                     </div>

                     <div className="p-6 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                          <DollarSign size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Lifetime Revenue</span>
                        </div>
                        <p className="text-xl font-black text-slate-800 dark:text-white text-emerald-600 dark:text-emerald-400">{formatCurrency(extractedData.totalRevenue)}</p>
                     </div>

                     <div className="p-6 flex flex-col gap-1 md:border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                          <Music size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Total Streams</span>
                        </div>
                        <p className="text-xl font-black text-slate-800 dark:text-white">{formatNumber(extractedData.totalStreams)}</p>
                     </div>

                     <div className="p-6 flex flex-col gap-1 md:border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                          <ListMusic size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">Total Tracks</span>
                        </div>
                        <p className="text-xl font-black text-slate-800 dark:text-white">{formatNumber(extractedData.totalTracks)}</p>
                     </div>

                  </div>
               </div>

               <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                 This is a one-time secure view. If you refresh the page, this data will be cleared from your screen.
               </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
