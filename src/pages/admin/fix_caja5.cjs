const fs = require('fs');

let file = fs.readFileSync('caja.jsx', 'utf-8');
file = file.replace(/\/\* Reducimos levemente el cuerpo para evitar superposiciones items\.forEach\(\(elem\) => \{ \*\//g, 
`// Reducimos levemente el cuerpo para evitar superposiciones
items.forEach((elem) => {`);

fs.writeFileSync('caja.jsx', file);
