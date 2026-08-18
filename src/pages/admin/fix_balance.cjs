const fs = require('fs');
let b = fs.readFileSync('balance/balance.jsx', 'utf-8');
b = b.replace(/\/\* ================================================================= \n\/\* CONFIGURACIÓN ESTILOS BLANCO Y NEGRO \(INTER\) \n\/\* ================================================================= \*\/ \*\/ \*\//g, 
`// ================================================================= 
// CONFIGURACIÓN ESTILOS BLANCO Y NEGRO (INTER) 
// =================================================================`);
fs.writeFileSync('balance/balance.jsx', b);
