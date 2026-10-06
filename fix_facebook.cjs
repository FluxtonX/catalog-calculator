const fs = require('fs');
let code = fs.readFileSync('src/components/valuation/sections/SocialStatsSection.jsx', 'utf8');

// 1. Remove the import
code = code.replace(/,\s*Facebook\s*,/g, ',');

// 2. Remove the variable declaration
code = code.replace(/const facebookFollowers = [^;]+;\r?\n/g, '');

// 3. Remove the JSX card component
const jsxRegex = /\s*<SocialStatCard\s+icon=\{Facebook\}[^>]+>\s*<\/SocialStatCard>|\s*<SocialStatCard\s+icon=\{Facebook\}[^>]+\/>/g;
code = code.replace(jsxRegex, '');

fs.writeFileSync('src/components/valuation/sections/SocialStatsSection.jsx', code);
