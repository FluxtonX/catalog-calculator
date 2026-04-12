// src/utils/itunesValuationPdfGenerator.js
import { jsPDF } from 'jspdf';

let hasAutoTable = false;
try {
  require('jspdf-autotable');
  hasAutoTable = true;
} catch (e) {
  console.warn('jspdf-autotable not available, using fallback table drawing');
}

export const generateITunesValuationPDF = (reportData) => {
  try {
    const doc = new jsPDF();

    // Colors — Apple Music pink/rose theme
    const primaryColor   = [236, 72, 153];   // Pink-500
    const secondaryColor = [168, 85, 247];   // Purple-500
    const textColor      = [51, 65, 85];     // Slate-700
    const lightBg        = [248, 250, 252];  // Slate-50

    let yPos = 20;

    // ========== HEADER ==========
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Apple Music Valuation Report', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(reportData.artist, 105, 25, { align: 'center' });

    yPos = 45;

    // ========== REPORT INFO ==========
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const reportDate = new Date(reportData.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    doc.text(`Report Generated: ${reportDate}`, 15, yPos);
    yPos += 7;
    doc.text(`Platform: Apple Music`, 15, yPos);
    yPos += 15;

    // ========== ARTIST METRICS ==========
    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Artist Metrics', 15, yPos);
    yPos += 10;

    const metricsData = [
      ['Avg Popularity Score',  `${Math.round(reportData.calculations.avgPopularity)}/100`],
      ['Apple Music Payout Rate', '$0.0100 per stream'],
      ['Catalog Depth',          `${reportData.calculations.totalAlbums} Albums / ${reportData.calculations.totalSingles} Singles`],
      ['Catalog Depth Bonus',    `+${reportData.calculations.catalogBonus.toFixed(0)}% LTM adjustment`],
      ['Deal Score',             `${reportData.calculations.dealScore}/100`],
    ];

    if (hasAutoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [],
        body: metricsData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3, textColor },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 90 },
          1: { cellWidth: 100 },
        },
        margin: { left: 15 },
      });
      yPos = doc.lastAutoTable.finalY + 15;
    } else {
      yPos = drawManualTable(doc, yPos, metricsData, textColor);
      yPos += 15;
    }

    // ========== REVENUE CALCULATION ==========
    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Revenue Calculation', 15, yPos);
    yPos += 10;

    const revenueData = [
      ['Monthly Streams (Est.)',   formatNumber(reportData.calculations.monthlyStreams)],
      ['Apple Music Rate',         '$0.0100/stream'],
      ['Monthly Revenue (Est.)',   formatCurrency(reportData.calculations.monthlyRevenue)],
      ['LTM Revenue (Est.)',       formatCurrency(reportData.calculations.ltmRevenue)],
    ];

    if (hasAutoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [],
        body: revenueData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3, textColor },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 90 },
          1: { cellWidth: 100 },
        },
        margin: { left: 15 },
      });
      yPos = doc.lastAutoTable.finalY + 10;
    } else {
      yPos = drawManualTable(doc, yPos, revenueData, textColor);
      yPos += 10;
    }

    // LTM Revenue highlight box
    doc.setFillColor(236, 72, 153, 0.1);
    doc.rect(10, yPos - 3, 190, 12, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Last Twelve Months (LTM) Revenue:', 15, yPos);
    doc.text(formatCurrency(reportData.calculations.ltmRevenue), 190, yPos, { align: 'right' });
    yPos += 20;

    // ========== VALUATION SCENARIOS ==========
    if (yPos > 200) { doc.addPage(); yPos = 20; }

    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Valuation Scenarios', 15, yPos);
    yPos += 12;

    const valuationData = [
      ['Conservative (6× Multiple)', formatCurrency(reportData.valuations.conservative)],
      ['Market Standard (8× Multiple)', formatCurrency(reportData.valuations.market)],
      ['Premium (10× Multiple)',     formatCurrency(reportData.valuations.premium)],
    ];

    if (hasAutoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [],
        body: valuationData,
        theme: 'striped',
        styles: { fontSize: 11, cellPadding: 5, fontStyle: 'bold', textColor },
        columnStyles: {
          0: { cellWidth: 110 },
          1: { cellWidth: 80, halign: 'right' },
        },
        margin: { left: 15 },
      });
      yPos = doc.lastAutoTable.finalY + 15;
    } else {
      valuationData.forEach((row, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(15, yPos - 4, 180, 9, 'F');
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        doc.text(row[0], 20, yPos);
        doc.text(row[1], 190, yPos, { align: 'right' });
        yPos += 9;
      });
      yPos += 15;
    }

    // ========== RATE COMPARISON ==========
    if (yPos > 220) { doc.addPage(); yPos = 20; }

    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Platform Rate Comparison', 15, yPos);
    yPos += 10;

    const rateData = [
      ['Apple Music', '$0.0100/stream', '~2.5x higher than Spotify'],
      ['Spotify (avg.)', '$0.0040/stream', 'Industry baseline'],
    ];

    if (hasAutoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [['Platform', 'Rate', 'Note']],
        body: rateData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3, textColor },
        margin: { left: 15 },
      });
      yPos = doc.lastAutoTable.finalY + 15;
    } else {
      yPos = drawManualTable(doc, yPos, rateData.map(r => [r[0], `${r[1]} — ${r[2]}`]), textColor);
      yPos += 15;
    }

    // ========== METHODOLOGY ==========
    if (yPos > 220) { doc.addPage(); yPos = 20; }

    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Valuation Methodology', 15, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);

    const methodology = [
      'Apple Music Stream Estimation:',
      '',
      '   • Monthly streams estimated from Apple Music popularity score (0–100)',
      '   • Exponential model: score 100 = ~10M streams/month, score 50 = ~1.8M/month',
      '   • Apple Music has no free tier — all listeners are paying subscribers',
      '',
      'Revenue Calculation:',
      '   • Apple Music payout rate: $0.01 per stream (2025 industry average)',
      '   • Monthly Revenue = Monthly Streams × $0.01',
      '   • LTM Revenue = Monthly Revenue × 12 months',
      '   • Catalog bonus applied: up to +50% based on albums and singles count',
      '',
      'Valuation Multiples:',
      '   • Conservative: 6× annual LTM revenue',
      '   • Market Standard: 8× annual LTM revenue (current market average)',
      '   • Premium: 10× annual LTM revenue (high-growth potential)',
      '',
      'Deal Score (0–100):',
      '   • Combines popularity score, catalog depth, and estimated stream volume',
      '   • 70–100: Strong Deal  |  40–69: Moderate Interest  |  0–39: Developing Artist',
      '',
      'Disclaimer:',
      '   These are estimates only. Actual Apple Music royalties vary by territory,',
      '   subscription tier, label/distributor agreements, and streaming activity.',
      '   Apple Music API does not expose actual stream counts — estimates are',
      '   derived from popularity scores only.',
    ];

    methodology.forEach((line) => {
      if (yPos > 280) { doc.addPage(); yPos = 20; }
      doc.text(line, 15, yPos);
      yPos += 5;
    });

    // ========== FOOTER ==========
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text(
        'This report is for informational purposes only and does not constitute financial advice.',
        105, 285, { align: 'center' }
      );
    }

    const fileName = `${reportData.artist.replace(/[^a-z0-9]/gi, '_')}_AppleMusic_Valuation_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    return true;

  } catch (error) {
    console.error('iTunes PDF Generation Error:', error);
    throw error;
  }
};

// ========== HELPERS ==========
const drawManualTable = (doc, startY, data, textColor, fontSize = 10, leftMargin = 15) => {
  let y = startY;
  doc.setFontSize(fontSize);
  doc.setTextColor(...textColor);
  data.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, leftMargin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value.toString(), leftMargin + 95, y);
    y += 7;
  });
  return y;
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatCurrency = (num) => {
  if (!num || isNaN(num)) return '$0';
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000)     return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000)         return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
};