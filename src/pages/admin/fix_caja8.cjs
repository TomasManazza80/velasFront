const fs = require('fs');

let file = fs.readFileSync('caja.jsx', 'utf-8');

// Fix line 106
file = file.replace(/\/\* --- GENERAR PDF --- generarFacturaPDF\(itemsCarrito, resumenVenta, medioPago, opcionCliente, idTransaccion, fechaHoy\); setCarrito\(\{\}\); setDesgloseBilletes\(\{ 20000: 0, 10000: 0, 5000: 0, 2000: 0, 1000: 0, 500: 0, 200: 0, 100: 0 \*\/\s*\*\//g, 
`// --- GENERAR PDF ---
generarFacturaPDF(itemsCarrito, resumenVenta, medioPago, opcionCliente, idTransaccion, fechaHoy);
setCarrito({});
setDesgloseBilletes({ 20000: 0, 10000: 0, 5000: 0, 2000: 0, 1000: 0, 500: 0, 200: 0, 100: 0`);

// Fix line 110
file = file.replace(/\/\* Prevent row click from firing setInspectedProduct\(item\); \*\//g, 
`// Prevent row click from firing
setInspectedProduct(item);`);

fs.writeFileSync('caja.jsx', file);
