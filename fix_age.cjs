const fs = require('fs');
let code = fs.readFileSync('src/core/calculations/combined.js', 'utf8');
const startIdx = code.indexOf('      // --- Apple Music: compute age');
const endIdx = code.indexOf('      // --- YouTube: compute age');
const target = code.substring(startIdx, endIdx);
const replacement = "      // --- Apple Music: Fallback to Spotify's weighted age ---\n      const isAppleMusic = platformStr === 'itunes' || platformStr === 'apple';\n      if (isAppleMusic) {\n        if (anchor) {\n          cfaResult.averageDollarAge = parseFloat(((anchor.averageDollarAge || 2.5) * 1.15).toFixed(2));\n        } else {\n          cfaResult.averageDollarAge = 2.5;\n        }\n      }\n\n";
code = code.replace(target, replacement);
fs.writeFileSync('src/core/calculations/combined.js', code);
