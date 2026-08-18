const fs = require("fs");

let g = fs.readFileSync("gastos.jsx", "utf-8");
g = g.replace(
  /\/\* Ensure we have the 4 zones even \*\/\nif empty /g,
  "// Ensure we have the 4 zones even if empty\n",
);
g = g.replace(
  /\/\* --- HANDLERS ---\n\/\* Shipping \*\/ \*\//g,
  "// --- HANDLERS ---\n// Shipping\n",
);
fs.writeFileSync("gastos.jsx", g);

let cp = fs.readFileSync("productos/cargaDeProductos.jsx", "utf-8");
cp = cp.replace(
  /\/\* Re-sincroniza la lista completa setNuevoProducto\(prev => \(\{\ \.\.\.prev, categoria: response\.data\.categoryName \*\/\n\}\)\);/g,
  "// Re-sincroniza la lista completa\nsetNuevoProducto(prev => ({ ...prev, categoria: response.data.categoryName }));",
);
cp = cp.replace(
  /\/\* Activamos animación de éxito setDeleteSuccess\(true\); setNuevoProducto\(prev => \(\{\ \.\.\.prev, categoria: '' \*\/\n\}\)\);/g,
  "// Activamos animación de éxito\nsetDeleteSuccess(true);\nsetNuevoProducto(prev => ({ ...prev, categoria: '' }));",
);
cp = cp.replace(
  /\/\* Reseteamos el estado después de 2 segundos setTimeout\(\(\) => setDeleteSuccess\(false\), 2000\); \*\//g,
  "// Reseteamos el estado después de 2 segundos\nsetTimeout(() => setDeleteSuccess(false), 2000);",
);
fs.writeFileSync("productos/cargaDeProductos.jsx", cp);
