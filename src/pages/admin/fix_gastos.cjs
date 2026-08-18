const fs = require("fs");

let g = fs.readFileSync("gastos.jsx", "utf-8");
g = g.replace(
  /\/\* --- HANDLERS ---\s*\/\* Shipping \*\/ \*\//g,
  "// --- HANDLERS ---\n// Shipping\n",
);
fs.writeFileSync("gastos.jsx", g);
