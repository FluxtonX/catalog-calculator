const RevenueStreams = ({ adRevenue, streamingRevenue, totalAnnualRevenue, formatCurrency }) => {
  const streams = [
    { title: "Channel Ad Revenue", desc: "Direct monetization from owned channel videos", value: adRevenue, color: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-500/30", text: "text-red-600 dark:text-red-400" } },
    { title: "Content ID & Streaming", desc: "Revenue from music used across YouTube", value: streamingRevenue, color: { bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-500/30", text: "text-purple-600 dark:text-purple-400" } },
    { title: "Total Potential", desc: "Combined annual revenue estimate", value: totalAnnualRevenue, color: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400" } },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-7">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4 sm:mb-5">
        YouTube Revenue Streams
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {streams.map((s) => (
          <div key={s.title} className={`text-center p-4 sm:p-5 ${s.color.bg} rounded-2xl border ${s.color.border}`}>
            <h4 className={`font-bold ${s.color.text} mb-2 text-xs sm:text-sm`}>{s.title}</h4>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-3">{s.desc}</p>
            <p className={`text-lg sm:text-xl font-black ${s.color.text}`}>{formatCurrency(s.value)}/year</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueStreams;