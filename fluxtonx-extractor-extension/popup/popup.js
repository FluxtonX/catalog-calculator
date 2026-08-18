document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn');
  const statusBox = document.getElementById('status');
  const resultsContainer = document.getElementById('results');
  const copyBtn = document.getElementById('copyBtn');
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  let extractedData = null;

  extractBtn.addEventListener('click', async () => {
    statusBox.textContent = 'Analyzing page structure...';
    extractBtn.disabled = true;
    extractBtn.style.opacity = '0.7';

    try {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['scripts/content.js']
        });
      } catch (injectionError) {
        console.log("Injection error (might be expected):", injectionError);
      }

      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: 'extract_catalog' }, (response) => {
          extractBtn.disabled = false;
          extractBtn.style.opacity = '1';

          if (chrome.runtime.lastError) {
            statusBox.textContent = 'Error: Cannot extract from this page. Make sure you are on a real dashboard page.';
            return;
          }

          if (response && response.success) {
            statusBox.classList.add('hidden');
            resultsContainer.classList.remove('hidden');
            
            extractedData = response.data;
            
            document.getElementById('res-artist').textContent = extractedData.artistName;
            document.getElementById('res-artist').title = extractedData.artistName; // tooltip for long names
            document.getElementById('res-revenue').textContent = `$${extractedData.lifetimeRevenue}`;
            document.getElementById('res-streams').textContent = extractedData.totalStreams;
            document.getElementById('res-tracks').textContent = extractedData.totalTracks;
            
            extractBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg> Scan Again';
          } else {
            statusBox.textContent = response?.error || 'Extraction failed.';
          }
        });
      }, 150);

    } catch (error) {
      statusBox.textContent = 'An error occurred while connecting to the page.';
      extractBtn.disabled = false;
      extractBtn.style.opacity = '1';
    }
  });

  copyBtn.addEventListener('click', () => {
    if (!extractedData) return;
    const textToCopy = `Artist Name: ${extractedData.artistName}\nTotal Revenue: ${extractedData.lifetimeRevenue}\nTotal Streams: ${extractedData.totalStreams}\nTotal Tracks: ${extractedData.totalTracks}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied! ✓';
      copyBtn.style.backgroundColor = 'var(--success)';
      copyBtn.style.borderColor = 'var(--success)';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '';
        copyBtn.style.borderColor = '';
      }, 2000);
    });
  });

  downloadCsvBtn.addEventListener('click', () => {
    if (!extractedData) return;
    
    // Create CSV content
    const headers = ['Artist Name', 'Total Revenue (USD)', 'Total Streams', 'Total Tracks'];
    const row = [
      `"${extractedData.artistName.replace(/"/g, '""')}"`, 
      `"${extractedData.lifetimeRevenue}"`, 
      `"${extractedData.totalStreams}"`, 
      `"${extractedData.totalTracks}"`
    ];
    
    const csvContent = headers.join(',') + '\n' + row.join(',');
    
    // Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "catalog_extraction.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  const sendToAppBtn = document.getElementById('sendToAppBtn');
  if (sendToAppBtn) {
    sendToAppBtn.addEventListener('click', () => {
      if (!extractedData) return;
      
      chrome.storage.local.set({ pendingExtractionData: extractedData }, () => {
        const originalText = sendToAppBtn.textContent;
        sendToAppBtn.textContent = 'Sent! Return to Calculator';
        setTimeout(() => {
          sendToAppBtn.textContent = originalText;
        }, 3000);
      });
    });
  }
});
