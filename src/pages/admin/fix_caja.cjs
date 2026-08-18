const fs = require('fs');

let file = fs.readFileSync('caja.jsx', 'utf-8');
file = file.replace(/\/\* ================================================================= \n\/\* CONFIGURACIÓN ESTILOS lu \(PREMIUM DARK TECH\) \n\/\* ================================================================= \*\/ \*\/ \*\//g, 
`// ================================================================= 
// CONFIGURACIÓN ESTILOS lu (PREMIUM DARK TECH) 
// =================================================================`);
fs.writeFileSync('caja.jsx', file);
