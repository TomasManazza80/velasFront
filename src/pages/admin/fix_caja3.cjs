const fs = require('fs');

let file = fs.readFileSync('caja.jsx', 'utf-8');
file = file.replace(/\/\* Only update \*\/\nif the auto-calculated breakdown is different from current to avoid infinite loops, \n\/\* or \*\/\nif we just want to reset it when montoRecibido changes\. \n\/\* A simple JSON\.stringify comparison works well here for shallow objects\. \*\//g, 
`// Only update if the auto-calculated breakdown is different from current to avoid infinite loops,
// or if we just want to reset it when montoRecibido changes.
// A simple JSON.stringify comparison works well here for shallow objects.`);
fs.writeFileSync('caja.jsx', file);
