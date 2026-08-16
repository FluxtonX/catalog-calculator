# FluxtonX Extractor - Daily Log & Project Tracker

## Project Overview
**Music Catalog & Royalty Data Extractor (Chrome Extension)**
Purpose: Export track catalog, streams, and royalty data from distribution companies (DistroKid, TuneCore, Concord, etc.) to CSV.

## Yesterday (Foundation)
- Created the extension foundation (`manifest.json` v3).
- Added `popup/popup.html` for the user interface.
- Initialized `scripts/background.js` (Service Worker) and `scripts/content.js`.
- Created `concord_dashboard.html` (likely for testing or specific dashboard structure reference).

## Today's Tasks (Next Steps)
1. **Implement Extraction Logic**: Build the scraping logic inside `scripts/content.js` to extract tables/data from target dashboards (starting with Concord or Distrokid).
2. **Wire up the Popup**: Connect the UI in `popup/popup.html` to trigger the scraping events in the active tab.
3. **CSV Export Functionality**: Ensure the extracted JSON data is formatted properly and triggers a CSV file download using the extension's `downloads` permission.
4. **Testing**: Test the extraction on `concord_dashboard.html` to ensure the DOM parsing works perfectly.

## Future / Next Day
- Refine error handling and edge cases for different dashboard layouts.
- Send the extracted data to the `catalog_calculator` app for calculation and analysis.
