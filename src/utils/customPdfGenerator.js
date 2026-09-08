import { jsPDF } from 'jspdf';
import { formatCurrency } from '../core/calculations';

export const generateCustomValuationPDF = async (reportData) => {
  try {
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = [16, 185, 129]; // Emerald
    const textColor = [51, 65, 85]; // Slate-700
    const lightBg = [248, 250, 252]; // Slate-50
    
    let yPos = 20;
    
    // ========== HEADER ==========
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Certified Catalog Valuation Report', 105, 15, { align: 'center' });
    
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
    doc.text(`Data Source: ${reportData.distributor} (Verified Integration)`, 15, yPos);
    yPos += 7;
    
    yPos += 8;
    
    // ========== INPUT PARAMETERS ==========
    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Verified Input Data', 15, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Last 12 Months Revenue:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(reportData.inputs.revenue), 100, yPos);
    yPos += 7;
    
    if (reportData.inputs.unrecouped) {
      doc.setFont('helvetica', 'bold');
      doc.text('Unrecouped Balance:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(reportData.inputs.unrecouped), 100, yPos);
      yPos += 7;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total Tracks:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(reportData.inputs.tracks.toString(), 100, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total Lifetime Streams:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(reportData.inputs.streams.toString(), 100, yPos);
    yPos += 15;
    
    // ========== VALUATION ==========
    doc.setFillColor(...lightBg);
    doc.rect(10, yPos - 5, 190, 8, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Catalog Valuation', 15, yPos);
    yPos += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    
    // Main Valuation
    doc.setFont('helvetica', 'bold');
    doc.text('Estimated Market Value (8x Multiple):', 15, yPos);
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text(formatCurrency(reportData.valuations.market), 100, yPos);
    yPos += 12;
    
    // Other Multiples
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Conservative Value (6x Multiple):', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(reportData.valuations.conservative), 100, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Premium Value (10x Multiple):', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(reportData.valuations.premium), 100, yPos);
    yPos += 20;
    
    // ========== FOOTER ==========
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'This report is based on actual payout data provided by the distributor.',
      105,
      285,
      { align: 'center' }
    );
    
    // Save the PDF
    const fileName = `${reportData.artist.replace(/[^a-z0-9]/gi, '_')}_Certified_Valuation_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};
