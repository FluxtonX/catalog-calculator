// src/pages/UserDashboard.jsx - WITH PREVIEW FEATURE
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { FileText, Download, Trash2, Calendar, Music, Loader2, AlertCircle, Search, Filter, Youtube, Eye, X, TrendingUp, DollarSign, BarChart, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [previewReport, setPreviewReport] = useState(null); // ✅ NEW: Preview state

  useEffect(() => {
    fetchUserAndReports();
  }, []);

  const fetchUserAndReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      setUser(user);

      const { data, error: reportsError } = await supabase
        .from('user_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const { error } = await supabase
        .from('user_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      setReports(reports.filter((r) => r.id !== reportId));
      setPreviewReport(null); // Close preview if open
      alert('Report deleted successfully');
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report: ' + err.message);
    }
  };

  const handleDownload = async (report) => {
    try {
      if (report.pdf_url) {
        const { data, error } = await supabase.storage
          .from('reports')
          .download(report.pdf_url);

        if (error) throw error;

        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.artist_name}-${report.report_type || 'valuation'}-${new Date(report.created_at).toLocaleDateString()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const reportType = report.report_type || 'spotify_valuation';
        
        if (reportType === 'youtube_valuation') {
          const { generateYouTubeValuationPDF } = await import('../utils/youtubeValuationPdfGenerator');
          generateYouTubeValuationPDF(report.report_data);
        } else {
          const { generateValuationPDF } = await import('../utils/pdfGenerator');
          generateValuationPDF(report.report_data);
        }
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (num) => {
    if (!num || isNaN(num)) return '$0';
    if (num >= 1000000) {
      return '$' + (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return '$' + (num / 1000).toFixed(2) + 'K';
    }
    return '$' + num.toFixed(2);
  };

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getReportTypeInfo = (reportType) => {
    const type = reportType || 'spotify_valuation';
    
    if (type === 'youtube_valuation') {
      return {
        label: 'YouTube',
        icon: Youtube,
        color: 'from-red-500/20 to-pink-500/20',
        iconColor: 'text-red-500 dark:text-red-400',
        badgeColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        gradientBg: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
        borderColor: 'border-red-300 dark:border-red-500/30'
      };
    }
    
    return {
      label: 'Spotify',
      icon: Music,
      color: 'from-emerald-500/20 to-blue-500/20',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      gradientBg: 'from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20',
      borderColor: 'border-emerald-300 dark:border-emerald-500/30'
    };
  };

  const filteredReports = reports
    .filter((report) => {
      const matchesSearch = report.artist_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = reportTypeFilter === 'all' || 
                          (report.report_type || 'spotify_valuation') === reportTypeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'artist':
          return a.artist_name.localeCompare(b.artist_name);
        default:
          return 0;
      }
    });

  const spotifyCount = reports.filter(r => !r.report_type || r.report_type === 'spotify_valuation').length;
  const youtubeCount = reports.filter(r => r.report_type === 'youtube_valuation').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin h-12 w-12 text-emerald-500" />
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-semibold">
            Loading your reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl">
              <FileText size={28} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                My Reports
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {user?.email} • {reports.length} {reports.length === 1 ? 'report' : 'reports'} 
                {reports.length > 0 && ` (${spotifyCount} Spotify, ${youtubeCount} YouTube)`}
              </p>
            </div>
          </div>

          {/* Search, Filter, and Report Type Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by artist name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
            
            <div className="relative">
              <Filter
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="spotify_valuation">Spotify Only</option>
                <option value="youtube_valuation">YouTube Only</option>
              </select>
            </div>
            
            <div className="relative">
              <Filter
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="artist">Artist Name</option>
              </select>
            </div>
          </div>
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

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <FileText size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {searchTerm || reportTypeFilter !== 'all' ? 'No reports found' : 'No reports yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm || reportTypeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first valuation report to get started'}
            </p>
            {!searchTerm && reportTypeFilter === 'all' && (
              <button
                onClick={() => navigate('/valuation')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Create Report
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const typeInfo = getReportTypeInfo(report.report_type);
              const Icon = typeInfo.icon;
              
              return (
                <div
                  key={report.id}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {/* Artist Info with Report Type Badge */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 bg-gradient-to-br ${typeInfo.color} rounded-lg`}>
                      <Icon size={24} className={typeInfo.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate flex-1">
                          {report.artist_name}
                        </h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${typeInfo.badgeColor} whitespace-nowrap`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Valuation Preview */}
                  {report.report_data?.valuations && (
                    <div className="mb-4 p-3 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                        Market Valuation
                      </p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(report.report_data.valuations.market)}
                      </p>
                    </div>
                  )}

                  {/* ✅ UPDATED: Actions with Preview Button */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewReport(report)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(report)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Download size={16} />
                      PDF
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ NEW: Preview Modal */}
      {previewReport && (
        <ReportPreviewModal
          report={previewReport}
          onClose={() => setPreviewReport(null)}
          onDownload={handleDownload}
          onDelete={handleDelete}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          formatDate={formatDate}
          getReportTypeInfo={getReportTypeInfo}
        />
      )}
    </div>
  );
}

// ✅ NEW: Report Preview Modal Component
function ReportPreviewModal({ report, onClose, onDownload, onDelete, formatCurrency, formatNumber, formatDate, getReportTypeInfo }) {
  const typeInfo = getReportTypeInfo(report.report_type);
  const Icon = typeInfo.icon;
  const isYouTube = report.report_type === 'youtube_valuation';
  const data = report.report_data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`sticky top-0 z-10 bg-gradient-to-r ${typeInfo.gradientBg} border-b-2 ${typeInfo.borderColor} p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-3 bg-gradient-to-br ${typeInfo.color} rounded-xl`}>
                <Icon size={32} className={typeInfo.iconColor} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {report.artist_name}
                  </h2>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${typeInfo.badgeColor}`}>
                    {typeInfo.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Calendar size={14} />
                  {formatDate(report.created_at)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Valuation Summary */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-500" />
              Valuation Estimates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                  Conservative (6x)
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(data.valuations.conservative)}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                  Market (8x)
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.valuations.market)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                  Premium (10x)
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(data.valuations.premium)}
                </p>
              </div>
            </div>
          </div>

          {/* Spotify-specific data */}
          {!isYouTube && data.calculations && (
            <>
              {/* Revenue Calculation */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" />
                  Revenue Calculation
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Streams</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{formatNumber(data.calculations.monthlyStreamsEst)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Spotify Rate</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${data.calculations.effectiveSpotifyRate?.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Revenue</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(data.calculations.monthlySpotifyRevenue)}</span>
                  </div>
                  <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-slate-900 dark:text-white">LTM Revenue</span>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(data.calculations.ltmSpotifyRevenue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dollar Age */}
              {data.calculations.dollarAge && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-amber-500" />
                    Dollar Age Analysis
                  </h3>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                          Catalog Dollar Age
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                          Weighted by LTM earnings
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                          {data.calculations.dollarAge.toFixed(1)}
                        </div>
                        <span className="text-sm text-amber-600 dark:text-amber-500">years</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t border-amber-200 dark:border-amber-500/30">
                      {data.calculations.dollarAge >= 5 ? (
                        <>
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                            Mature Catalog - High Stability
                          </span>
                        </>
                      ) : data.calculations.dollarAge >= 3 ? (
                        <>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                            Established Catalog - Moderate Stability
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                            Young Catalog - Growth Phase
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Geographic Distribution */}
              {data.calculations.geoBreakdown && Object.keys(data.calculations.geoBreakdown).length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-emerald-500" />
                    Geographic Distribution
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(data.calculations.geoBreakdown).map(([region, share]) => (
                      <div key={region} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            {region}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {(share * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* YouTube-specific data */}
          {isYouTube && data.calculations && (
            <>
              {/* Annual Revenue Breakdown */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart size={20} className="text-red-500" />
                  Revenue Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                      Ad Revenue
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(data.calculations.adRevenue)}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                      Streaming Revenue
                    </p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(data.calculations.streamingRevenue)}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-500/30 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                      Total Annual
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(data.calculations.totalAnnualRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" />
                  Key Metrics
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Estimated Annual Views</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{formatNumber(data.calculations.estimatedAnnualViews)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monetized Views</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{formatNumber(data.calculations.monetizedViews)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Platform Plays</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatNumber(data.calculations.estimatedTotalPlays)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Input Parameters */}
          {data.inputs && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart size={20} className="text-slate-500" />
                Input Parameters
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                {!isYouTube ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lifetime Streams</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">{formatNumber(data.inputs.lifetimeStreams)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Release Date</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">{data.inputs.releaseDate}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Views</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">{formatNumber(data.inputs.totalViews)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Annual Views %</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">{data.inputs.annualViewPercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monetization Rate</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">{data.inputs.monetizationRate}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700 p-6">
          <div className="flex gap-3">
            <button
              onClick={() => onDownload(report)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Download size={20} />
              Download PDF
            </button>
            <button
              onClick={() => {
                onDelete(report.id);
                onClose();
              }}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl font-semibold transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}