const fs = require('fs');

let file = fs.readFileSync('caja.jsx', 'utf-8');

// Fix line 89
file = file.replace(/\/\* CAMPOS PARA DESCUENTO DE STOCK color: variant \? variant\.color : null, almacenamiento: variant \? variant\.almacenamiento : null \*\//g, 
`// CAMPOS PARA DESCUENTO DE STOCK
color: variant ? variant.color : null,
almacenamiento: variant ? variant.almacenamiento : null`);

// Fix line 93
file = file.replace(/\/\* Detalles para el balance banco: mixtoCreditoInfo\.banco, cuotas: mixtoCreditoInfo\.cuotas \*\//g, 
`// Detalles para el balance
banco: mixtoCreditoInfo.banco,
cuotas: mixtoCreditoInfo.cuotas`);

fs.writeFileSync('caja.jsx', file);
