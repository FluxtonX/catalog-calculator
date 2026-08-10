const getSymbol = (curr) => (0).toLocaleString('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).replace(/\d/g, '').trim();
console.log('USD:', getSymbol('USD'));
console.log('GBP:', getSymbol('GBP'));
console.log('EUR:', getSymbol('EUR'));
console.log('PKR:', getSymbol('PKR'));
console.log('JPY:', getSymbol('JPY'));
