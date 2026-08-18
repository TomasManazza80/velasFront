const fs = require("fs");
let g = fs.readFileSync("gastos.jsx", "utf-8");
g = g.replace(
  /\/\* Actualizar estado local setAllProducts\(prev => prev\.map\(p => p\.id === productId \? \{ \.\.\.p, tasaEcommerce: feeValue \*\/\n\} : p \)\);/g,
  "// Actualizar estado local\nsetAllProducts(prev => prev.map(p => p.id === productId ? { ...p, tasaEcommerce: feeValue } : p ));",
);
g = g.replace(
  /\/\* FEDECELL_ADMIN<\/p> <\/div> <\/header> \{\/\* TABS \*\/\} \*\//g,
  "// FEDECELL_ADMIN</p> </div> </header> {/* TABS */}",
);
fs.writeFileSync("gastos.jsx", g);
