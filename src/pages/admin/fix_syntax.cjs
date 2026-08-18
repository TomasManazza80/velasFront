const fs = require("fs");

const files = [
  "caja.jsx",
  "cierresDeCaja/cierreCajaDiario.jsx",
  "cierresDeCaja/historialRecaudacionFinal.jsx",
  "balance/balance.jsx",
  "balance/personalBalance.jsx",
  "productos/cargaDeProductos.jsx",
  "productos/inventarioProductos.jsx",
  "proveedores/proveedores.jsx",
  "clientes/clientes.jsx",
  "empleados/moduloEmpleados.jsx",
  "encargos.jsx",
  "ventasLocalFisico.jsx",
  "ventas/ventasEcommerceOnline.jsx",
  "facturacion/facturacion.jsx",
  "envios/enviosProductos.jsx",
  "gastos.jsx",
];

files.forEach((f) => {
  let content = fs.readFileSync(f, "utf-8");

  // Fix http:/* localhost ... */
  content = content.replace(/http:\n\/\* (localhost[^\*]+) \*\//g, "http://$1");
  content = content.replace(/https:\n\/\* (.*?)\*\//g, "https://$1");

  // Fix single line files that have return ( <div ... but no matching braces?

  fs.writeFileSync(f, content, "utf-8");
});
