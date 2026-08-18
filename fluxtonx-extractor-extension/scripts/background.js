// Background service worker

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download_csv') {
    handleCsvDownload(request.data, request.platform);
  }
});

function handleCsvDownload(data, platform) {
  if (!data || data.length === 0) return;

  // 1. Convert JSON to CSV string
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Escape commas and quotes for CSV
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  
  // 2. Create a data URI
  // In Manifest V3 service workers, we can't use URL.createObjectURL on Blob easily for downloads
  // We'll use a data URI
  const base64Content = btoa(unescape(encodeURIComponent(csvString)));
  const dataUri = `data:text/csv;base64,${base64Content}`;
  
  // 3. Trigger download
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `fluxtonx_catalog_${platform.toLowerCase()}_${dateStr}.csv`;
  
  chrome.downloads.download({
    url: dataUri,
    filename: filename,
    saveAs: true // Prompts the user where to save
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error('Download failed:', chrome.runtime.lastError);
    } else {
      console.log('Download started with ID:', downloadId);
    }
  });
}
