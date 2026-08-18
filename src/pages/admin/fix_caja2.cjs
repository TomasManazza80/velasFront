const fs = require('fs');

let file = fs.readFileSync('caja.jsx', 'utf-8');
file = file.replace(/\/\*([^\n]*?)\n\/\*([^\n]*?)\n\/\*([^\n]*?)\*\/\s*\*\/\s*\*\//g, '//$1\n//$2\n//$3');
fs.writeFileSync('caja.jsx', file);
