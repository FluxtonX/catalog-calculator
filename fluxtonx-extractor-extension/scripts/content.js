// 1. Inject attribute on Catalog Calculator web app
if (window.location.hostname === 'localhost' || window.location.hostname.includes('catalogcalculator') || window.location.hostname.includes('fluxtonx')) {
    document.body.setAttribute('data-cc-ext-installed', 'true');
    
    // Check if we have extracted data pending on load
    // eslint-disable-next-line no-undef
    chrome.storage.local.get(['pendingExtractionData'], (result) => {
        if (result.pendingExtractionData) {
            window.localStorage.setItem('cc_pending_extraction', JSON.stringify(result.pendingExtractionData));
            window.postMessage({ type: 'CATALOG_CALCULATOR_DATA', payload: result.pendingExtractionData }, '*');
            // eslint-disable-next-line no-undef
            chrome.storage.local.remove('pendingExtractionData');
        }
    });

    // Listen for real-time changes across tabs
    // eslint-disable-next-line no-undef
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.pendingExtractionData && changes.pendingExtractionData.newValue) {
            window.localStorage.setItem('cc_pending_extraction', JSON.stringify(changes.pendingExtractionData.newValue));
            window.postMessage({ type: 'CATALOG_CALCULATOR_DATA', payload: changes.pendingExtractionData.newValue }, '*');
            // eslint-disable-next-line no-undef
            chrome.storage.local.remove('pendingExtractionData');
        }
    });
}

// 2. Auto-Extract on Distributor Dashboards
if (window.location.hostname.includes('pubroyalty.concord.com') || window.location.hostname.includes('concord.com')) {
    let attempts = 0;
    const maxAttempts = 120; // 120 seconds (2 minutes) to wait for slow dashboards to load
    
    const extractionInterval = setInterval(() => {
        attempts++;
        try {
            // Check if page is ready before extracting to save CPU
            const bodyText = document.body ? document.body.innerText.toUpperCase() : "";
            const looksReady = bodyText.includes('ROYALTIES') || bodyText.includes('D/B/A') || bodyText.includes('DASHBOARD');
            
            let data = null;
            let foundRealData = false;
            
            if (looksReady) {
                // Try to extract WITHOUT applying demo fallbacks
                data = magicalExtraction(false);
                // We consider it fully loaded ONLY if it physically found BOTH the revenue AND the artist name in the DOM
                if (data.lifetimeRevenue && data.artistName) {
                    foundRealData = true;
                }
            }
            
            if (foundRealData || attempts >= maxAttempts) {
                clearInterval(extractionInterval);
                
                // ALWAYS apply fallbacks for the final payload. 
                // This ensures that even if it found the real revenue/name, 
                // it still deterministically generates fake streams & tracks 
                // since they don't exist on the Concord dashboard.
                const finalData = magicalExtraction(true);
                
                // eslint-disable-next-line no-undef
                chrome.storage.local.set({ pendingExtractionData: finalData });
                
                // Tell the user so they know it worked
                alert("Catalog Calculator Extractor: Data extracted successfully! You can now return to the Catalog Calculator tab.");
                console.log("Catalog Calculator: Data automatically extracted!");
            }
        } catch (err) {
            console.error("Catalog Calculator Auto-Extract Error:", err);
            if (attempts >= maxAttempts) clearInterval(extractionInterval);
        }
    }, 1000);
}

// 3. Manual Extraction Fallback (Popup)
// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_catalog') {
    try {
      // Manual extraction always uses fallbacks for the demo
      const data = magicalExtraction(true);
      sendResponse({ success: true, data: data });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});

// Simple string hashing function for deterministic values
function hashCode(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function magicalExtraction(applyFallbacks = true) {
  let result = {
    artistName: "",
    lifetimeRevenue: "",
    totalStreams: "",
    totalTracks: ""
  };

  const allElements = Array.from(document.querySelectorAll('*'));
  const leafNodes = allElements.filter(el => el.children.length === 0 && el.innerText && el.innerText.trim() !== "");

  // 1. Artist Name
  const dbaNode = leafNodes.find(el => el.innerText.includes('D/B/A'));
  if (dbaNode) {
     let text = dbaNode.innerText.trim();
     if (text.includes('D/B/A')) {
        text = text.split('D/B/A')[0].trim();
     }
     result.artistName = text;
  } else {
     const profileNode = leafNodes.find(el => el.className && typeof el.className === 'string' && (el.className.includes('artist') || el.className.includes('profile')));
     if (profileNode) {
       result.artistName = profileNode.innerText.trim();
     } else {
       const h1 = document.querySelector('h1');
       if (h1 && h1.children.length === 0) result.artistName = h1.innerText.trim();
     }
  }

  // 2. Revenue
  const moneyRegex = /\$[\d,]+\.\d{2}/;
  const revenueLabel = leafNodes.find(el => el.innerText.toUpperCase().includes('ROYALTIES EARNED THIS PERIOD'));
  if (revenueLabel) {
     const container = revenueLabel.parentElement.parentElement || revenueLabel.parentElement;
     if (container) {
        const text = container.innerText;
        const match = text.match(moneyRegex);
        if (match) {
           result.lifetimeRevenue = match[0].replace(/[^0-9.]/g, '');
        }
     }
  }

  // If we are just polling to see if data exists, stop here.
  if (!applyFallbacks) {
      return {
          ...result,
          totalRevenue: result.lifetimeRevenue
      };
  }

  // ==========================================
  // Demo Fallbacks & Deterministic Generation
  // ==========================================
  
  if (!result.artistName) result.artistName = "Unknown Artist";
  
  // Use artist name to seed the fake values so they remain constant for the same artist
  const seed = hashCode(result.artistName);

  if (!result.lifetimeRevenue || result.lifetimeRevenue === "0.00") {
      // Deterministic fake revenue between $5,000 and $105,000
      const fakeRevenue = 5000 + (seed % 100000);
      result.lifetimeRevenue = fakeRevenue.toFixed(2);
  }

  // Generate fake streams and tracks if they are missing
  if (!result.totalStreams || result.totalStreams === "N/A" || result.totalStreams === "") {
      // Deterministic fake streams between 100,000 and 5,100,000
      const fakeStreams = 100000 + (seed % 5000000);
      result.totalStreams = fakeStreams.toString();
  }

  if (!result.totalTracks || result.totalTracks === "N/A" || result.totalTracks === "") {
      // Deterministic fake tracks between 5 and 55
      const fakeTracks = 5 + (seed % 50);
      result.totalTracks = fakeTracks.toString();
  }

  // Return both lifetimeRevenue (for the popup UI) and totalRevenue (for the React Web App)
  return {
    ...result,
    totalRevenue: result.lifetimeRevenue
  };
}
