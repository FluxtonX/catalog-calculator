// src/utils/youtubeValuationPdfGenerator.js
import { jsPDF } from 'jspdf';

// Try to import autoTable
let hasAutoTable = false;
try {
  // eslint-disable-next-line no-undef
  require('jspdf-autotable');
  hasAutoTable = true;
} catch {
  console.warn('jspdf-autotable not available, using fallback table drawing');
}

/**
 * Generate a professional YouTube valuation report PDF
 */
export const generateYouTubeValuationPDF = (reportData) => {
  try {
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = [239, 68, 68]; // Red-500
    const secondaryColor = [168, 85, 247]; // Purple-500
    const textColor = [51, 65, 85]; // Slate-700
    const lightBg = [248, 250, 252]; // Slate-50
    
    let yPos = 20;
    
    // ========== HEADER ==========
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('YouTube Valuation Report', 105, 15, { align: 'center' });
    
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
    doc.text(`Total Views: ${formatNumber(reportData.inputs.totalViews)}`, 15, yPos);
    yPos += 15;
    
    // ========== INPUT PARAMETERS ==========
    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Valuation Assumptions', 15, yPos);
    yPos += 10;
    
    const inputData = [
      ['Annual Views %', `${reportData.inputs.annualViewPercentage}%`],
      ['Monetization Rate', `${reportData.inputs.monetizationRate}%`],
      ['Average CPM', `$${reportData.inputs.avgCpm.toFixed(2)}`],
      ['Creator Cut', `${reportData.inputs.creatorCut}%`],
      ['Streaming Rate/Play', `$${reportData.inputs.streamingRate.toFixed(4)}`],
      ['Content ID Multiplier', `${reportData.inputs.contentIdMultiplier}x`],
    ];
    
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
    
    // ========== REVENUE BREAKDOWN ==========
    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Revenue Calculation', 15, yPos);
    yPos += 10;
    
    // Channel Ad Revenue Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('1. Channel Ad Revenue (YPP)', 15, yPos);
    yPos += 7;
    
    const adRevenueData = [
      ['Est. Annual Views', formatNumber(reportData.calculations.estimatedAnnualViews)],
      ['Monetized Views', formatNumber(reportData.calculations.monetizedViews)],
      ['Gross Ad Revenue', formatCurrency(reportData.calculations.grossAdRevenue)],
      ['Net Ad Revenue', formatCurrency(reportData.calculations.adRevenue)],
    ];
    
    if (hasAutoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [],
        body: adRevenueData,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 2,
          textColor: textColor,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { cellWidth: 110 }
        },
        margin: { left: 20 }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    } else {
      yPos = drawManualTable(doc, yPos, adRevenueData, textColor, 9, 20);
      yPos += 10;
    }
    
    // Content ID & Streaming Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('2. Content ID & Streaming', 15, yPos);
    yPos += 7;
    
    const streamingData = [
      ['Est. Total Platform Plays', formatNumber(reportData.calculations.estimatedTotalPlays)],
      ['Streaming Rate', `$${reportData.inputs.streamingRate.toFixed(4)}/play`],
      ['Streaming Revenue', formatCurrency(reportData.calculations.streamingRevenue)],
    ];
    
    if (hasAutoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [],
        body: streamingData,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 2,
          textColor: textColor,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { cellWidth: 110 }
        },
        margin: { left: 20 }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    } else {
      yPos = drawManualTable(doc, yPos, streamingData, textColor, 9, 20);
      yPos += 10;
    }
    
    // Total Annual Revenue
    doc.setFillColor(34, 197, 94, 0.1);
    doc.rect(10, yPos - 3, 190, 12, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('Total Annual Revenue:', 15, yPos);
    doc.text(formatCurrency(reportData.calculations.totalAnnualRevenue), 190, yPos, { align: 'right' });
    yPos += 15;
    
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
    doc.text('Professional Valuation Scenarios', 15, yPos);
    yPos += 12;
    
    const valuationData = [
      ['Conservative (6x Multiple)', formatCurrency(reportData.valuations.conservative)],
      ['Market Standard (8x Multiple)', formatCurrency(reportData.valuations.market)],
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
    
    // ========== ADVANCE & GROWTH ADJUSTMENTS ==========
    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Additional Valuation Insights', 15, yPos);
    yPos += 10;
    
    const advanceData = [
      ['Advance Potential (Total Package)', formatCurrency(reportData.valuations.advancePackage)],
      ['CACC Growth-Adjusted Valuation', formatCurrency(reportData.valuations.caccAdjusted)],
    ];
    
    if (hasAutoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [],
        body: advanceData,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          textColor: textColor,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { cellWidth: 90, halign: 'right' }
        },
        margin: { left: 15 }
      });
      yPos = doc.lastAutoTable.finalY + 15;
    } else {
      yPos = drawManualTable(doc, yPos, advanceData, textColor);
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
      'YouTube Revenue Calculation:',
      '',
      '1. Channel Ad Revenue (YPP):',
      '   • Estimated annual views based on percentage of total lifetime views',
      '   • Monetization rate applied to determine monetized views',
      '   • CPM (Cost Per Mille) multiplied by monetized views/1000',
      '   • Creator cut percentage applied to gross ad revenue',
      '',
      '2. Content ID & Streaming Revenue:',
      '   • Total platform plays estimated at 3x annual views (industry standard)',
      '   • Streaming rate per play applied to total plays',
      '   • Represents revenue from music used across YouTube platform',
      '',
      '3. Total Annual Revenue:',
      '   • Sum of channel ad revenue and streaming revenue',
      '   • Forms basis for all valuation multiples',
      '',
      'Valuation Multiples:',
      '   • Conservative: 6x annual revenue (traditional standard)',
      '   • Market Standard: 8x annual revenue (current market average)',
      '   • Premium: 10x annual revenue (high-growth potential)',
      '',
      'Additional Calculations:',
      '   • Advance Potential: 15% of annual revenue + tour/marketing support',
      '   • CACC Adjusted: 8x base valuation + 30% growth adjustment',
      '',
      'Note: All calculations are estimates based on industry standards and',
      'provided assumptions. Actual results may vary.',
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
    const fileName = `${reportData.artist.replace(/[^a-z0-9]/gi, '_')}_YouTube_Valuation_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('YouTube PDF Generation Error:', error);
    console.error('Error details:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
    throw error;
  }
};

// ========== HELPER FUNCTIONS ==========
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