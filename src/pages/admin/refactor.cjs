const fs = require("fs");
const path = require("path");

const applyDesignSystem = (content) => {
  let newContent = content;

  // 1. Contenedores y Fondos
  newContent = newContent.replace(
    /min-h-screen.*?bg-(?:white|black).*?text-(?:black|white)/g,
    (match) => {
      return match
        .replace(/bg-(?:white|black)/, "bg-[#F4F7FE]")
        .replace(/text-(?:black|white)/, "text-gray-900");
    },
  );

  // 2. Cards (Paneles)
  newContent = newContent.replace(
    /glass-container.*?border.*?border-black(\/\d+)?/g,
    "bg-white border border-gray-100 rounded-2xl shadow-sm",
  );
  newContent = newContent.replace(
    /glass-container/g,
    "bg-white border border-gray-100 rounded-2xl shadow-sm",
  );

  // Submodulos grises
  newContent = newContent.replace(
    /bg-neutral-50.*?border.*?border-black\/10/g,
    "bg-[#F8FAFC] border border-gray-100 rounded-2xl",
  );
  newContent = newContent.replace(/bg-black\/5/g, "bg-[#F8FAFC]");
  newContent = newContent.replace(/bg-black\/10/g, "bg-gray-100");

  // 3. Tipografía
  newContent = newContent.replace(
    /fedecell-title.*?text-black/g,
    "text-gray-900 font-bold",
  );
  newContent = newContent.replace(/fedecell-tech/g, "font-medium");
  newContent = newContent.replace(/fedecell-body/g, "font-medium");
  newContent = newContent.replace(/text-black\/60/g, "text-gray-500");
  newContent = newContent.replace(/text-black\/50/g, "text-gray-500");
  newContent = newContent.replace(/text-black\/40/g, "text-gray-400");
  newContent = newContent.replace(/text-black\/30/g, "text-gray-400");
  newContent = newContent.replace(/text-black/g, "text-gray-900");

  newContent = newContent.replace(/text-zinc-400/g, "text-gray-400");
  newContent = newContent.replace(/text-zinc-500/g, "text-gray-500");
  newContent = newContent.replace(/text-zinc-600/g, "text-gray-600");

  // 4. Inputs
  const inputRegex = /w-full.*?bg-white.*?border.*?p-3.*?outline-none/g;
  newContent = newContent.replace(inputRegex, (match) => {
    return "w-full bg-white border border-gray-200 rounded-xl p-2.5 px-4 text-gray-900 text-sm outline-none transition-all focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]";
  });

  const simpleInputRegex = /bg-white.*?border.*?p-2.*?outline-none/g;
  newContent = newContent.replace(simpleInputRegex, (match) => {
    return "bg-white border border-gray-200 rounded-xl p-2 px-3 text-gray-900 text-sm outline-none transition-all focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]";
  });

  // 5. Botones Primarios
  newContent = newContent.replace(
    /bg-black text-white hover:bg-(?:zinc|neutral)-800/g,
    "bg-[#0A58CA] text-white hover:bg-[#084298] font-medium text-sm rounded-xl shadow-sm transition-all",
  );
  newContent = newContent.replace(
    /bg-black text-white/g,
    "bg-[#0A58CA] text-white font-medium text-sm rounded-xl shadow-sm hover:bg-[#084298] transition-all",
  );

  // Botones Secundarios
  // Some buttons have border border-black/10 bg-black/5 hover:bg-black/10
  newContent = newContent.replace(
    /border border-gray-900\/10 bg-\[#F8FAFC\] hover:bg-gray-100/g,
    "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm rounded-xl transition-all",
  );

  // 6. Bordes sueltos
  newContent = newContent.replace(/border-black\/20/g, "border-gray-200");
  newContent = newContent.replace(/border-black\/10/g, "border-gray-100");
  newContent = newContent.replace(/border-black\/5/g, "border-gray-50");
  newContent = newContent.replace(/border-black/g, "border-gray-200");

  // Clean up empty classes or duplicate spaces
  newContent = newContent.replace(/\s+/g, " ");
  newContent = newContent.replace(/class="(.*?)"/g, (m, p1) => {
    return `className="${p1.trim()}"`;
  });

  // Quitar inyecciones de estilos
  newContent = newContent.replace(/<style>\{`.*?`\}<\/style>/g, "");
  newContent = newContent.replace(
    /<style dangerouslySetInnerHTML=\{.*?\}.*?\/>/g,
    "",
  );

  return newContent;
};

const processFile = (filePath) => {
  console.log(`Processing: ${filePath}`);
  const content = fs.readFileSync(filePath, "utf-8");
  const newContent = applyDesignSystem(content);
  fs.writeFileSync(filePath, newContent, "utf-8");
  console.log(`Done: ${filePath}`);
};

const filesToProcess = [
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

const basePath = path.join(
  "C:",
  "Users",
  "tomas",
  "OneDrive",
  "Desktop",
  "DEVELOP",
  "PROYECTOS REALES",
  "LU ECOMMERCE",
  "ECOMMERCE LU NUEVO",
  "FRONT",
  "src",
  "pages",
  "admin",
);

filesToProcess.forEach((file) => {
  const fullPath = path.join(basePath, file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  } else {
    console.warn(`File not found: ${fullPath}`);
  }
});
