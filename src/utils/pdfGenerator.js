// src/utils/pdfGenerator.js - HYBRID VERSION (Works with or without autoTable)
import { jsPDF } from 'jspdf';

// Try to import autoTable, but don't fail if it's not available
let hasAutoTable = false;
try {
  require('jspdf-autotable');
  hasAutoTable = true;
} catch (e) {
  console.warn('jspdf-autotable not available, using fallback table drawing');
}

/**
 * Generate a professional valuation report PDF
 */
export const generateValuationPDF = (reportData) => {
  try {
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = [16, 185, 129]; // Emerald
    const secondaryColor = [59, 130, 246]; // Blue
    const textColor = [51, 65, 85]; // Slate-700
    const lightBg = [248, 250, 252]; // Slate-50
    
    let yPos = 20;
    
    // ========== HEADER ==========
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Catalog Valuation Report', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(reportData.artist, 105, 25, { align: 'center' });
    
    yPos = 45;
    
    // ========== REPORT INFO ==========
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const reportDate = new Date(reportData.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    doc.text(`Report Generated: ${reportDate}`, 15, yPos);
    yPos += 7;
    doc.text(`Calculation Method: ${getMethodLabel(reportData.calculations.methodUsed)}`, 15, yPos);
    yPos += 15;
    
    // ========== INPUT PARAMETERS ==========
    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Input Parameters', 15, yPos);
    yPos += 10;
    
    const inputData = [
      ['Lifetime Streams', formatNumber(reportData.inputs.lifetimeStreams)],
      ['Average Release Date', reportData.inputs.releaseDate],
      ['Months Live', reportData.calculations.monthsLive.toString()],
    ];
    
    // Draw table (with or without autoTable)
    if (hasAutoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [],
        body: inputData,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          textColor: textColor,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { cellWidth: 110 }
        },
        margin: { left: 15 }
      });
      yPos = doc.lastAutoTable.finalY + 15;
    } else {
      yPos = drawManualTable(doc, yPos, inputData, textColor);
      yPos += 15;
    }
    
    // ========== CALCULATION BREAKDOWN ==========
    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Revenue Calculation', 15, yPos);
    yPos += 10;
    
    const calcData = [
      ['Monthly Streams (Est.)', formatNumber(reportData.calculations.monthlyStreamsEst)],
      ['Effective Spotify Rate', `$${reportData.calculations.effectiveSpotifyRate.toFixed(4)}`],
      ['Rate Method', reportData.calculations.geoMethodUsed === 'WEIGHTED' ? 'Geo-Weighted' : 'Global Average'],
      ['Monthly Revenue', formatCurrency(reportData.calculations.monthlySpotifyRevenue)],
      ['LTM Revenue', formatCurrency(reportData.calculations.ltmSpotifyRevenue)],
    ];
    
    // Add decay factor if applicable
    if (reportData.calculations.decayFactor) {
      calcData.splice(1, 0, ['Decay Factor Applied', `${(reportData.calculations.decayFactor * 100).toFixed(0)}%`]);
    }
    
    // Add featured track info if applicable
    if (reportData.calculations.featuredTrackCount > 0) {
      calcData.push(['Featured Tracks', `${reportData.calculations.featuredTrackCount} of ${reportData.calculations.totalTrackCount} (25% revenue)`]);
    }
    
    // Draw table
    if (hasAutoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [],
        body: calcData,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          textColor: textColor,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { cellWidth: 110 }
        },
        margin: { left: 15 }
      });
      yPos = doc.lastAutoTable.finalY + 5;
    } else {
      yPos = drawManualTable(doc, yPos, calcData, textColor);
      yPos += 5;
    }
    
    // ========== GEOGRAPHIC BREAKDOWN (if available) ==========
    if (reportData.calculations.geoBreakdown && Object.keys(reportData.calculations.geoBreakdown).length > 0) {
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textColor);
      doc.text('Geographic Distribution:', 15, yPos);
      yPos += 7;
      
      const geoData = Object.entries(reportData.calculations.geoBreakdown).map(([region, share]) => [
        region,
        `${(share * 100).toFixed(1)}%`
      ]);
      
      if (hasAutoTable && typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: yPos,
          head: [],
          body: geoData,
          theme: 'plain',
          styles: {
            fontSize: 9,
            cellPadding: 2,
            textColor: textColor,
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 40 }
          },
          margin: { left: 20 }
        });
        yPos = doc.lastAutoTable.finalY + 15;
      } else {
        yPos = drawManualTable(doc, yPos, geoData, textColor, 9, 20);
        yPos += 15;
      }
    } else {
      yPos += 15;
    }
    
    // ========== VALUATION ESTIMATES ==========
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Catalog Valuation Estimates', 15, yPos);
    yPos += 12;
    
    const valuationData = [
      ['Conservative (6x Multiple)', formatCurrency(reportData.valuations.conservative)],
      ['Market (8x Multiple)', formatCurrency(reportData.valuations.market)],
      ['Premium (10x Multiple)', formatCurrency(reportData.valuations.premium)],
    ];
    
    if (hasAutoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [],
        body: valuationData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 11,
          cellPadding: 5,
          fontStyle: 'bold',
          textColor: textColor,
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 90, halign: 'right' }
        },
        margin: { left: 15 }
      });
      yPos = doc.lastAutoTable.finalY + 15;
    } else {
      // Draw with alternating background
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
    
    // ========== METHODOLOGY ==========
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
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
      'Monthly streams calculated using priority-based approach:',
      '  1. Recent 30-day data (if available)',
      '  2. Recent 28-day data normalized to 30 days',
      '  3. Top tracks with featured track revenue adjustments',
      '  4. Lifetime history with age-based decay factors',
      '',
      'Featured tracks (containing "feat." or "featuring") are calculated at 25%',
      'revenue share when the artist is not the primary artist.',
      '',
      'Geo-weighted Spotify payout rates applied based on listener geographic',
      'distribution across regions.',
      '',
      'Decay factors for lifetime method:',
      '  • 0-3 months: 100%',
      '  • 4-12 months: 85%',
      '  • 13-36 months: 65%',
      '  • 36+ months: 50%',
      '',
      'Regional payout rates:',
      '  • US/CA/UK/AU: $0.0042 per stream',
      '  • EU West: $0.0036 per stream',
      '  • LATAM: $0.0018 per stream',
      '  • Asia: $0.0022 per stream',
      '  • Rest of World: $0.0016 per stream',
      '',
      'Calculations based on top 10 tracks only (API limitation).',
    ];
    
    methodology.forEach((line) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 15, yPos);
      yPos += 5;
    });
    
    // ========== FOOTER ==========
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );
      doc.text(
        'This report is for informational purposes only and does not constitute financial advice.',
        105,
        285,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const fileName = `${reportData.artist.replace(/[^a-z0-9]/gi, '_')}_Valuation_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    console.error('Error details:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
    throw error;
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Fallback function to draw tables manually without autoTable
 */
const drawManualTable = (doc, startY, data, textColor, fontSize = 10, leftMargin = 15) => {
  let y = startY;
  doc.setFontSize(fontSize);
  doc.setTextColor(...textColor);
  
  data.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, leftMargin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value.toString(), leftMargin + 85, y);
    y += 7;
  });
  
  return y;
};

const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatCurrency = (num) => {
  if (!num || isNaN(num)) return '$0';
  if (num >= 1000000) {
    const millions = num / 1000000;
    return `$${millions.toFixed(2)}M`;
  } else if (num >= 1000) {
    const thousands = num / 1000;
    return `$${thousands.toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
};

const getMethodLabel = (method) => {
  const labels = {
    'RECENT_30D': 'Recent 30-day streams',
    'RECENT_28D_NORMALIZED': 'Recent 28-day streams (normalized)',
    'TOP_TRACKS_FEATURED_ADJ': 'Top tracks with featured adjustments',
    'LIFETIME_RUNRATE_ADJ': 'Lifetime streams with age decay',
  };
  return labels[method] || method;
};