const fs = require("fs");

const fixComments = (filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");

  // Si no está todo en una línea o ya está arreglado, saltar
  if (content.split("\n").length > 5 && !content.includes("// ")) {
    return;
  }

  // Heurística para encontrar el fin de un comentario en una sola línea
  // Reemplazamos "// [texto] [siguiente instruccion]" con "/* [texto] */ \n [siguiente instruccion]"
  // Instrucciones comunes: const, let, var, doc, yPos, if, return, axios, Swal, }, useEffect, allCierres, const, <
  const regex =
    /\/\/\s*(.*?)\s+(const |let |var |if |return |doc\.|yPos|axios\.|Swal\.|}|useEffect\(|allCierres|allEncargos|ventasFiltradas|encargosFiltrados|setFacturacionData|console\.|reporte\.|const\s|let\s|var\s|<div|<header|<button|<span|<p|function )/g;

  let oldContent = "";
  while (oldContent !== content) {
    oldContent = content;
    content = content.replace(regex, (match, p1, p2) => {
      return `\n/* ${p1} */\n${p2}`;
    });
  }

  // Algunos comentarios extraños como "// YYYY-MM const"
  content = content.replace(/\/\/\s*(YYYY-MM)\s+(const )/g, "\n/* $1 */\n$2");

  // Casos especiales que no coinciden bien
  content = content.replace(
    /\/\/\s*(.*?)\s+(className=|import |export |const |let |return |if |<)/g,
    "\n/* $1 */\n$2",
  );

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Fixed ${filePath}`);
};

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
  try {
    fixComments(f);
  } catch (e) {
    console.error(e);
  }
});
