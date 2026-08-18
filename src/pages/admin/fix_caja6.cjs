const fs = require('fs');

let file = fs.readFileSync('caja.jsx', 'utf-8');
file = file.replace(/\/\* Lógica original para pagos no mixtos itemsCarrito\.forEach\(\(\{ item, cantidad, tipo, variant \*\//g, 
`// Lógica original para pagos no mixtos
itemsCarrito.forEach(({ item, cantidad, tipo, variant`);

file = file.replace(/\/\* ------------------------------------------------ setEstadoTransaccion\('success'\); /g,
`// ------------------------------------------------
setEstadoTransaccion('success');`);

fs.writeFileSync('caja.jsx', file);
