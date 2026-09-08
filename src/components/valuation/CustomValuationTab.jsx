import React, { useState } from "react";
import { Download, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatCurrency, formatNumberAbbrev } from "../../core/calculations";
import { generateCustomValuationPDF } from "../../utils/customPdfGenerator";

const CustomValuationTab = ({ artistData }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = artistData.stats || {};
  const revenue = stats.totalRevenue || 0;
  const unrecouped = stats.unrecoupedBalance || 0;
  const tracks = stats.totalTracks || 0;
  const streams = stats.totalStreams || 0;
  const growth = stats.growthRate || 0;

  const conservativeValuation = revenue * 6;
  const marketValuation = revenue * 8;
  const premiumValuation = revenue * 10;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const reportData = {
        artist: artistData.name,
        distributor: artistData.importedDistributor || "Distributor",
        date: new Date().toISOString(),
        inputs: {
          revenue,
          unrecouped,
          tracks,
          streams,
          growth
        },
        valuations: {
          conservative: conservativeValuation,
          market: marketValuation,
          premium: premiumValuation,
        }
      };
      await generateCustomValuationPDF(reportData);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="text-emerald-500 mt-0.5 shrink-0" size={20} />
        <div>
          <h4 className="font-bold text-emerald-800 dark:text-emerald-400">Verified Direct Data</h4>
          <p className="text-sm text-emerald-700 dark:text-emerald-500/80 mt-1">
            This valuation is calculated using actual, verified payout data from {artistData.importedDistributor || 'your distributor'}, providing the highest level of accuracy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LTM Revenue */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">LTM Revenue</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(revenue)}</p>
          <p className="text-xs text-emerald-500 mt-2 font-medium">Ground Truth Data</p>
        </div>
        
        {/* Valuations */}
        <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl border border-emerald-400 shadow-lg text-white md:col-span-2">
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1">Estimated Market Value (8x)</p>
          <p className="text-4xl font-black">{formatCurrency(marketValuation)}</p>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
             <div>
               <p className="text-xs font-medium text-emerald-100">Conservative (6x)</p>
               <p className="text-xl font-bold">{formatCurrency(conservativeValuation)}</p>
             </div>
             <div>
               <p className="text-xs font-medium text-emerald-100">Premium (10x)</p>
               <p className="text-xl font-bold">{formatCurrency(premiumValuation)}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating || revenue === 0}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          {isGenerating ? "Generating..." : "Download Certified PDF"}
        </button>
      </div>
    </div>
  );
};

export default CustomValuationTab;
