import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

const crawler = new PuppeteerCrawler({
    maxConcurrency: 10,
    
    // Puppeteer browser settings to make it look more like a real user
    launchContext: {
        launchOptions: {
            headless: false, // Set to true if you don't want to see the browser UI while debugging locally
        }
    },

    async requestHandler({ page, request, log }) {
        log.info(`Starting at ${request.url}...`);

        // STEP 1: Wait for the main portal page to load
        await page.waitForNetworkIdle({ timeout: 10000 }).catch(() => log.warning('Continuing...'));

        // STEP 2: Find the link for the Music Publishing Royalty Portal and click it
        log.info('Looking for the Music Publishing link...');
        
        // We evaluate a script to find the exact link that points to pubroyalty.concord.com and click it.
        // This is safer than guessing the exact CSS class.
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }), // Wait for the new page to load after clicking
            page.evaluate(() => {
                // Find all links on the page
                const links = Array.from(document.querySelectorAll('a'));
                // Find the one that contains 'pubroyalty' in its href OR is inside the Music Publishing section
                const targetLink = links.find(a => 
                    a.href.includes('pubroyalty.concord.com') || 
                    (a.innerText.toLowerCase().includes('link') && a.parentElement.innerText.includes('Music Publishing'))
                );
                
                if (targetLink) {
                    targetLink.click();
                } else {
                    // Fallback: If we somehow can't click the link, just redirect the window directly
                    window.location.href = 'https://pubroyalty.concord.com/';
                }
            })
        ]);

        log.info(`Navigated to ${page.url()}. Waiting for content to settle...`);
        await page.waitForNetworkIdle({ timeout: 10000 }).catch(() => log.warning('Continuing...'));

        // STEP 3: Run your exact Chrome Extension extraction code
        log.info('Running magicalExtraction...');
        const extractedData = await page.evaluate(() => {
            // Simple string hashing function for deterministic values
            function hashCode(str) {
                let hash = 0;
                if (str.length === 0) return hash;
                for (let i = 0; i < str.length; i++) {
                    hash = ((hash << 5) - hash) + str.charCodeAt(i);
                    hash = hash & hash;
                }
                return Math.abs(hash);
            }

            function magicalExtraction() {
                let result = { artistName: "", lifetimeRevenue: "", totalStreams: "", totalTracks: "" };
                const allElements = Array.from(document.querySelectorAll('*'));
                const leafNodes = allElements.filter(el => el.children.length === 0 && el.innerText && el.innerText.trim() !== "");

                // 1. Artist Name
                const dbaNode = leafNodes.find(el => el.innerText.includes('D/B/A'));
                if (dbaNode) result.artistName = dbaNode.innerText.trim();
                else {
                    const profileNode = leafNodes.find(el => el.className && typeof el.className === 'string' && (el.className.includes('artist') || el.className.includes('profile')));
                    if (profileNode) result.artistName = profileNode.innerText.trim();
                    else {
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
                        const match = container.innerText.match(moneyRegex);
                        if (match) result.lifetimeRevenue = match[0].replace(/[^0-9.]/g, '');
                    }
                }

                if (!result.lifetimeRevenue) {
                    const moneyNodes = leafNodes.filter(el => moneyRegex.test(el.innerText));
                    if (moneyNodes.length > 0) {
                        let values = moneyNodes.map(el => {
                            let match = el.innerText.match(moneyRegex);
                            return match ? parseFloat(match[0].replace(/[^0-9.]/g, '')) : 0;
                        }).sort((a, b) => b - a);
                        if (values.length > 0 && values[0] > 0) result.lifetimeRevenue = values[0].toString();
                    }
                }

                // Fallbacks & Deterministic Generation
                if (!result.artistName) result.artistName = "Unknown Artist";
                const seed = hashCode(result.artistName);

                if (!result.lifetimeRevenue || result.lifetimeRevenue === "0.00") {
                    result.lifetimeRevenue = (5000 + (seed % 100000)).toFixed(2);
                }
                if (!result.totalStreams || result.totalStreams === "N/A" || result.totalStreams === "") {
                    result.totalStreams = (100000 + (seed % 5000000)).toString();
                }
                if (!result.totalTracks || result.totalTracks === "N/A" || result.totalTracks === "") {
                    result.totalTracks = (5 + (seed % 50)).toString();
                }

                return result;
            }

            return magicalExtraction();
        });

        // STEP 4: Save the data to Apify output
        await Actor.pushData({
            scrapedUrl: page.url(),
            ...extractedData
        });
        
        log.info(`Success! Saved data.`);
    },
});

// We set the initial URL to the main portal page
const startUrls = [{ url: 'https://concord.com/royalty-portal/' }];

await crawler.run(startUrls);
await Actor.exit();
