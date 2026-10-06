const fs = require('fs');
let code = fs.readFileSync('src/core/calculations/cfaPhase1.js', 'utf8');

const target = 'const catalogBonus = Math.min(totalAlbums * 0.08 + totalSingles * 0.005, 0.5);';
const replacement = 'const catalogBonus = (platform === "itunes" || platform === "apple") ? 0 : Math.min(totalAlbums * 0.08 + totalSingles * 0.005, 0.5);';

code = code.replace(target, replacement);
fs.writeFileSync('src/core/calculations/cfaPhase1.js', code);
