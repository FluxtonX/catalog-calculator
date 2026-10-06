const fs = require('fs');

let landing = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');
landing = landing.replace(
  "return searchAppleMusic(searchQuery)\n              .then(d => ({ ...d, platform: 'itunes' }))\n              .catch(() => searchItunes(searchQuery).then(d => ({ ...d, platform: 'itunes' })).catch(() => null));",
  "return searchItunes(searchQuery).then(d => ({ ...d, platform: 'itunes' })).catch(() => null);"
);
fs.writeFileSync('src/pages/LandingPage.jsx', landing);

let valuation = fs.readFileSync('src/pages/ValuationTool.jsx', 'utf8');
valuation = valuation.replace(
  "const res = await searchAppleMusic(query);\n            return { ...res, platform: plt };\n          } catch {\n            const res = await searchItunes(query);\n            return { ...res, platform: plt };\n          }",
  "const res = await searchItunes(query);\n            return { ...res, platform: plt };"
);
fs.writeFileSync('src/pages/ValuationTool.jsx', valuation);
