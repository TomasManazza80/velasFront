const fs = require('fs');

let file = fs.readFileSync('caja.jsx', 'utf-8');
file = file.replace(/\/\* Only update \*\/\r?\nif the auto-calculated breakdown is different from current to avoid infinite loops, \r?\n\/\* or \*\/\r?\nif we just want to reset it when montoRecibido changes\. \r?\n\/\* A simple JSON\.stringify comparison works well here for shallow objects\. \*\//g, 
`// Only update if the auto-calculated breakdown is different from current to avoid infinite loops,
// or if we just want to reset it when montoRecibido changes.
// A simple JSON.stringify comparison works well here for shallow objects.`);

file = file.replace(/\/\* Reset vuelto \*\/\r?\nif no change is needed /g, 
`// Reset vuelto if no change is needed
`);

file = file.replace(/\/\* Check stock only for products \*\/\r?\nif /g, 
`// Check stock only for products
if `);

fs.writeFileSync('caja.jsx', file);
