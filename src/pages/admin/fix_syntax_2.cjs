const fs = require("fs");

let c = fs.readFileSync("clientes/clientes.jsx", "utf-8");
c = c.replace(
  /\/\* NO HAY DATOS REGISTRADOS/g,
  "{/* NO HAY DATOS REGISTRADOS */}",
);
c = c.replace(
  /\{\/\* NO HAY DATOS REGISTRADOS \*\/\} (.*?) \*\//g,
  "{/* NO HAY DATOS REGISTRADOS */} $1",
);
// Actually, let's just do an exact string replace since we saw the exact output.
c = c.replace(
  /\/\* NO HAY DATOS REGISTRADOS <\/td> <\/tr> \)} <\/tbody> <\/table> <\/div> <\/div> \); \*\//g,
  "NO HAY DATOS REGISTRADOS </td> </tr> )} </tbody> </table> </div> </div> );",
);
fs.writeFileSync("clientes/clientes.jsx", c);

let p = fs.readFileSync("proveedores/proveedores.jsx", "utf-8");
p = p.replace(
  /\/\* NO HAY DATOS REGISTRADOS <\/div> \)} <\/div> <\/div> \); \*\//g,
  "NO HAY DATOS REGISTRADOS </div> )} </div> </div> );",
);
fs.writeFileSync("proveedores/proveedores.jsx", p);

let cp = fs.readFileSync("productos/cargaDeProductos.jsx", "utf-8");
cp = cp.replace(/\/\* Iconos /g, "");
cp = cp.replace(/FiChevronDown \*\//g, "FiChevronDown");
cp = cp.replace(
  /\/\* Importación de módulos externos \(Lógica intacta\) /g,
  "",
);
cp = cp.replace(/IKUpload \*\//g, "IKUpload");
fs.writeFileSync("productos/cargaDeProductos.jsx", cp);

let g = fs.readFileSync("gastos.jsx", "utf-8");
g = g.replace(
  /\/\* 'all', 'nombre', 'categoria' searchQuery: '', targetPrice: 'public', /g,
  " // 'all', 'nombre', 'categoria' \n searchQuery: '', targetPrice: 'public', ",
);
g = g.replace(
  /\/\* 'public', 'reseller', 'wholesale' increaseType: 'percentage', /g,
  " // 'public', 'reseller', 'wholesale' \n increaseType: 'percentage', ",
);
g = g.replace(
  /\/\* 'percentage' or 'fixed' value: 0 \*\/ \*\/ \*\//g,
  " // 'percentage' or 'fixed' \n value: 0 ",
);
fs.writeFileSync("gastos.jsx", g);
