const fs = require('fs');

let file = fs.readFileSync('cierresDeCaja/cierreCajaDiario.jsx', 'utf-8');
file = file.replace(/\/\* \{new Date\(\)\.toLocaleDateString\('es-AR', \{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' \*\//g, 
`{new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' `);
fs.writeFileSync('cierresDeCaja/cierreCajaDiario.jsx', file);
