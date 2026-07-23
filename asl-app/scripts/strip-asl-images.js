const fs = require('fs');
const file = 'constants/aslLetters.ts';
let src = fs.readFileSync(file, 'utf8');
src = src.replace(/\n\s*image: require\([^)]+\),/g, '');
fs.writeFileSync(file, src);
console.log('stripped image requires from aslLetters.ts');
