import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Edit3, ArrowRight, X, Info } from 'lucide-react';
import { useArtistStore } from '../store/artistStore';
import { usePageTitle } from '../hooks/usePageTitle';

export default function DataImport() {
  const location = useLocation();
  const navigate = useNavigate();
  const distributor = location.state?.distributor || 'Your Distributor';
  
  usePageTitle(`Import from ${distributor} | FluxtonX`);

  const { setImportedData, setSelectedDistributor, clearArtist, setSearchQuery } = useArtistStore();
  
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manual'
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [parsing, setParsing] = useState(false);
  
  // Manual form state
  const [manualData, setManualData] = useState({
    artistName: '',
    totalStreams: '',
    totalRevenue: '',
    totalTracks: ''
  });

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'text/csv' || droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a valid CSV file.');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const processImport = (data) => {
    clearArtist();
    setSelectedDistributor(distributor);
    setImportedData(data);
    if (data.artistName) {
      setSearchQuery(data.artistName);
    }
    navigate('/valuation');
  };

  const handleUploadSubmit = () => {
    if (!file) return;
    setParsing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // A very basic generalized heuristic parser for demonstration
          // Real-world would have specific mapping logic for TuneCore, DistroKid etc.
          let totalStreams = 0;
          let totalRevenue = 0;
          let totalTracksSet = new Set();

          results.data.forEach(row => {
            // Try to find common column names
            const streamKey = Object.keys(row).find(k => k.toLowerCase().includes('stream') || k.toLowerCase().includes('quantity') || k.toLowerCase().includes('plays'));
            const revKey = Object.keys(row).find(k => k.toLowerCase().includes('revenue') || k.toLowerCase().includes('earning') || k.toLowerCase().includes('royalty') || k.toLowerCase().includes('usd'));
            const trackKey = Object.keys(row).find(k => k.toLowerCase().includes('track') || k.toLowerCase().includes('title') || k.toLowerCase().includes('song'));

            if (streamKey) totalStreams += parseInt(row[streamKey] || 0, 10);
            if (revKey) totalRevenue += parseFloat(row[revKey] || 0);
            if (trackKey && row[trackKey]) totalTracksSet.add(row[trackKey]);
          });

          // Fallback if parsing fails to find anything meaningful due to weird headers
          if (totalStreams === 0 && totalRevenue === 0) {
             throw new Error("Could not automatically identify Streams or Revenue columns in this CSV.");
          }

          processImport({
            artistName: manualData.artistName,
            totalStreams,
            totalRevenue,
            totalTracks: totalTracksSet.size > 0 ? totalTracksSet.size : 10 // fallback 10
          });
        } catch (err) {
          setError(err.message || 'Error processing CSV file.');
        } finally {
          setParsing(false);
        }
      },
      error: () => {
        setError('Failed to parse CSV file.');
        setParsing(false);
      }
    });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    processImport({
      artistName: manualData.artistName || 'Your Catalog',
      totalStreams: parseInt(manualData.totalStreams, 10) || 0,
      totalRevenue: parseFloat(manualData.totalRevenue) || 0,
      totalTracks: parseInt(manualData.totalTracks, 10) || 1
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 pt-24">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-black/10"></div>
           <div className="relative z-10">
             <h1 className="text-3xl font-black text-white tracking-tight mb-2">Import from {distributor}</h1>
             <p className="text-white/80 font-medium">Upload your earnings report to generate a valuation.</p>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'upload' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <UploadCloud size={18} />
            CSV Upload
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'manual' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Edit3 size={18} />
            Manual Entry
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="text-indigo-600 dark:text-indigo-400" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Drag & Drop your CSV</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">Upload your lifetime or monthly earnings report downloaded from {distributor}.</p>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                  <button className="mt-6 px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-lg text-sm hover:scale-105 transition-transform">
                    Browse Files
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setFile(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Artist Name</label>
                    <input
                      type="text"
                      required
                      value={manualData.artistName}
                      onChange={e => setManualData({...manualData, artistName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. The Beatles"
                    />
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">We need this to match your private data with a public profile.</p>
                  </div>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={parsing || !manualData.artistName}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
                  >
                    {parsing ? 'Processing...' : 'Generate Valuation'}
                    {!parsing && <ArrowRight size={18} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Artist Name</label>
                <input
                  type="text"
                  required
                  value={manualData.artistName}
                  onChange={e => setManualData({...manualData, artistName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. The Beatles"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Total Lifetime Streams</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={manualData.totalStreams}
                  onChange={e => setManualData({...manualData, totalStreams: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 1500000"
                />
                <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Info size={12} className="shrink-0" />
                  Found in your {distributor} dashboard under 'Analytics' or 'Streaming Reports'.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Total Lifetime Revenue (USD)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={manualData.totalRevenue}
                  onChange={e => setManualData({...manualData, totalRevenue: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 4500.50"
                />
                <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Info size={12} className="shrink-0" />
                  Look for 'Lifetime Earnings' or 'Total Revenue' in the {distributor} bank/wallet section.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Total Tracks in Catalog</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={manualData.totalTracks}
                  onChange={e => setManualData({...manualData, totalTracks: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 15"
                />
                <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Info size={12} className="shrink-0" />
                  The total number of songs/tracks you have distributed through {distributor}.
                </p>
              </div>
              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30"
              >
                Generate Valuation
                <ArrowRight size={18} />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
