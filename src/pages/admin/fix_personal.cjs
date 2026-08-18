const fs = require("fs");

let pb = fs.readFileSync("balance/personalBalance.jsx", "utf-8");
pb = pb.replace(
  /\/\* El backend usa 'producto' para la descripción\/nombre descripcion: descripcion, monto: parseFloat\(monto\), metodo_pago: medio, cuenta: medio, \n\/\* Mapeamos medio_pago a cuenta tambien para consistencia con modelo tipo, categoria: categoria \|\| 'General', userId: 1 \n\/\* Hardcoded por ahora, asumimos usuario principal o único \*\/ \*\/ \*\//g,
  `// El backend usa 'producto' para la descripción/nombre
descripcion: descripcion, monto: parseFloat(monto), metodo_pago: medio, cuenta: medio, 
// Mapeamos medio_pago a cuenta tambien para consistencia con modelo 
tipo, categoria: categoria || 'General', userId: 1 
// Hardcoded por ahora, asumimos usuario principal o único`,
);
fs.writeFileSync("balance/personalBalance.jsx", pb);
