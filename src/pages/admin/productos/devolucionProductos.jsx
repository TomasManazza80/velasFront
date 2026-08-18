import React, { useState, useEffect } from "react";
import {
  PlusCircleIcon,
  ArchiveBoxIcon,
  TrashIcon,
  XCircleIcon,
  CheckIcon,
  UserIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon, // Nuevo icono para el buscador
} from "@heroicons/react/24/solid";

// --- CONFIGURACIÓN DE ESTILOS FEDECELL ---
const styles = {
  container: "bg-[#FAFAFA] min-h-screen text-gray-900 p-6 md:p-12 font-sans selection:bg-blue-600 selection:text-gray-900",
  glassCard: "bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8",
  title: "text-2xl font-bold text-gray-900 mb-8",
  sectionTitle: "text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2",
  label: "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2",
  input: "w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-gray-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-gray-400",
  btnPrimary: "bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full px-6 py-2.5 transition-all flex items-center justify-center gap-2 shadow-sm",
  btnSecondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-full px-4 py-2 transition-all flex items-center gap-2",
  techText: "text-xs font-semibold text-gray-500",
  tabActive: "bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2",
  tabInactive: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all",
};

const BASE_URL = `${import.meta.env.VITE_API_URL}/devolucionProductos`;

const ProductReturnTracker = () => {
  const [view, setView] = useState("NUEVA OPERACIÓN");
  const [clientName, setClientName] = useState("");
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [generalReason, setGeneralReason] = useState("");
  const initialProduct = {
    name: "",
    quantity: 1,
    reason: "",
    productId: null,
    remitoItemId: null,
    color: "",
    storage: "",
  };
  const [returnPackages, setReturnPackages] = useState([
    {
      id: Date.now(),
      packageName: "LOTE 1",
      products: [{ ...initialProduct, id: Date.now() + 1 }],
    },
  ]);
  const [currentPackageId, setCurrentPackageId] = useState(
    returnPackages[0].id,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ESTADOS DEL HISTORIAL
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Para el buscador del historial
  const [expandedRow, setExpandedRow] = useState(null);

  // ESTADOS PARA BÚSQUEDA DUAL (NUEVA DEVOLUCIÓN)
  const [allProducts, setAllProducts] = useState([]);
  const [allRemitos, setAllRemitos] = useState([]);
  const [searchActiveFor, setSearchActiveFor] = useState(null); // { pkgIndex, prodIndex }
  const [searchResults, setSearchResults] = useState([]);

  const fetchHistory = async () => {
    try {
      const [historyRes, productsRes, remitosRes] = await Promise.all([
        fetch(`${BASE_URL}/historialDevoluciones`),
        fetch(`${import.meta.env.VITE_API_URL}/products`),
        fetch(`${import.meta.env.VITE_API_URL}/remito/historialRemitos`),
      ]);

      const historyData = await historyRes.json();
      const productsData = await productsRes.json();
      const remitosData = await remitosRes.json();

      setHistory(Array.isArray(historyData) ? historyData : []);
      setAllProducts(productsData || []);
      setAllRemitos(remitosData || []);
    } catch (error) {
      console.error("ERROR_FETCH_DATA", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [view]);

  // --- LÓGICA DE BÚSQUEDA DUAL ---
  const handleProductSearch = (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    const q = query.toLowerCase();
    const results = [];

    // 1. Buscar en Stock (Productos actuales)
    allProducts.forEach((p) => {
      const variantes = Array.isArray(p.variantes) ? p.variantes : [];
      variantes.forEach((v) => {
        const fullName =
          `${p.nombre} ${v.color || ""} ${v.almacenamiento || ""}`.toLowerCase();
        if (fullName.includes(q)) {
          results.push({
            type: "STOCK",
            name: p.nombre,
            color: v.color,
            storage: v.almacenamiento,
            productId: p.id,
            stock: v.stock,
            display: `${p.nombre} [EXISTENTE] - ${v.color}/${v.almacenamiento} - STOCK: ${v.stock}`,
          });
        }
      });
    });

    // 2. Buscar en Remitos (Ingresos de mercadería)
    allRemitos.forEach((r) => {
      const productos = Array.isArray(r.productos) ? r.productos : [];
      productos.forEach((p) => {
        const fullName = `${p.nombre} (${r.proveedor})`.toLowerCase();
        if (fullName.includes(q)) {
          results.push({
            type: "REMITO",
            name: p.nombre,
            remitoId: r.RemitoId,
            remitoItemId: p.ItemId,
            proveedor: r.proveedor,
            estado: r.estado,
            display: `${p.nombre} [REMITO: ${r.RemitoId}] - ${r.proveedor} (${r.estado})`,
          });
        }
      });
    });

    setSearchResults(results.slice(0, 10));
  };

  // --- FILTRADO DE HISTORIAL (CLIENTE O PRODUCTO) ---
  const filteredHistory = history.filter((op) => {
    const query = searchTerm.toLowerCase();
    // Buscar por cliente
    const matchClient = op.clientName.toLowerCase().includes(query);
    // Buscar si algún producto en algún lote coincide
    const matchProduct = op.returnPackages?.some((pkg) =>
      pkg.products?.some((prod) => prod.name.toLowerCase().includes(query)),
    );
    return matchClient || matchProduct;
  });

  const handleSubmitReturn = async () => {
    if (!clientName || !generalReason)
      return alert("SISTEMA: Datos incompletos.");
    setIsSubmitting(true);
    const payload = {
      clientName: clientName.toUpperCase(),
      returnDate,
      generalReason,
      returnPackages: returnPackages.map((pkg) => ({
        packageName: pkg.packageName.toUpperCase(),
        products: pkg.products.map((p) => ({
          name: (p.name || "").toUpperCase(),
          quantity: p.quantity,
          reason: (p.reason || "").toUpperCase(),
          productId: p.productId,
          remitoItemId: p.remitoItemId,
          color: p.color,
          storage: p.storage,
        })),
      })),
    };

    try {
      const res = await fetch(`${BASE_URL}/registrarDevolucion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("OPERACIÓN SINCRONIZADA");
        setView("HISTORIAL");
      }
    } catch (e) {
      alert("SYNC_ERROR");
    }
    setIsSubmitting(false);
  };

  const handleDeleteReturn = async (id) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar la operación de devolución ID #${id}? Esta acción es irreversible.`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setHistory((prev) => prev.filter((op) => op.DevolucionId !== id));
        alert(`OPERACIÓN SINCRONIZADA: ID #${id}`);
      } else {
        // Capturamos el mensaje real del servidor para entender por qué falla (404, 500, etc)
        const errorData = await res.json().catch(() => ({}));
        const msg =
          errorData?.message ||
          errorData?.error ||
          `Error desconocido (Status: ${res.status})`;
        alert(`ERROR_DE_SINCRONIZACIÓN: ${msg}`);
      }
    } catch (error) {
      console.error("DELETE_ERROR", error);
      alert("ERROR_DE_CONEXIÓN_AL_ELIMINAR");
    }
  };

  return (
    <div className={styles.container}>
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className={styles.title}>
            LOGÍSTICA <span className="text-blue-600">INVERSA</span>
          </h1>
          <p className={`${styles.techText} tracking-[0.5em] uppercase`}>
            Core_System // Fedecell_Labs
          </p>
        </div>

        <nav className="flex gap-8 border-b border-gray-200 w-full md:w-auto">
          <button
            onClick={() => setView("NUEVA OPERACIÓN")}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${view === "NUEVA OPERACIÓN" ? styles.tabActive : styles.tabInactive}`}
          >
            <PlusCircleIcon className="w-4 h-4 inline mr-2" /> REGISTRAR ENTRADA
          </button>
          <button
            onClick={() => setView("HISTORIAL")}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${view === "HISTORIAL" ? styles.tabActive : styles.tabInactive}`}
          >
            <ClockIcon className="w-4 h-4 inline mr-2" /> HISTORIAL MAESTRO
          </button>
        </nav>
      </header>

      {view === "NUEVA OPERACIÓN" ? (
        /* VISTA DE REGISTRO */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`${styles.glassCard} mb-8`}>
            <h2 className={styles.sectionTitle}>
              <UserIcon className="w-4 h-4" /> 01 DATOS DEL CLIENTE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className={styles.label}>Entidad Cliente</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={styles.input}
                  placeholder="NOMBRE ENTIDAD"
                />
              </div>
              <div>
                <label className={styles.label}>Fecha</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div>
                <label className={styles.label}>Motivo</label>
                <select
                  value={generalReason}
                  onChange={(e) => setGeneralReason(e.target.value)}
                  className={styles.input}
                >
                  <option value="">SELECCIONAR...</option>
                  <option value="danio">DAÑO EN TRÁNSITO</option>
                  <option value="error_envio">ERROR DE ENVÍO</option>
                  <option value="otro">OTRO (SISTEMA)</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.glassCard}>
            <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-6">
              <h2 className={styles.sectionTitle}>
                <ArchiveBoxIcon className="w-4 h-4" /> 02 CONTROL DE LOTES
              </h2>
              <button
                onClick={() =>
                  setReturnPackages([
                    ...returnPackages,
                    {
                      id: Date.now(),
                      packageName: `LOTE ${returnPackages.length + 1}`,
                      products: [{ ...initialProduct, id: Date.now() + 1 }],
                    },
                  ])
                }
                className={`${styles.btnPrimary} py-2 text-xs`}
              >
                AÑADIR LOTE
              </button>
            </div>

            {/* Renderizado de Lotes */}
            <div className="space-y-12">
              {returnPackages.map((pkg, pkgIdx) => (
                <div
                  key={pkg.id}
                  className="p-6 border border-gray-200 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-6">
                    <input
                      type="text"
                      value={pkg.packageName}
                      onChange={(e) => {
                        const newPkgs = [...returnPackages];
                        newPkgs[pkgIdx].packageName = e.target.value;
                        setReturnPackages(newPkgs);
                      }}
                      className="bg-transparent border-none text-blue-600 font-bold text-xs uppercase focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        setReturnPackages(
                          returnPackages.filter((_, i) => i !== pkgIdx),
                        )
                      }
                      className="text-red-500 hover:text-gray-900 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {pkg.products.map((prod, prodIdx) => (
                      <div
                        key={prod.id}
                        className="relative grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-white p-4 border border-gray-200"
                      >
                        <div className="md:col-span-5 relative">
                          <label className={styles.label}>
                            Producto / Referencia
                          </label>
                          <div className="relative">
                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={prod.name}
                              onChange={(e) => {
                                const newPkgs = [...returnPackages];
                                newPkgs[pkgIdx].products[prodIdx].name =
                                  e.target.value;
                                setReturnPackages(newPkgs);
                                setSearchActiveFor({ pkgIdx, prodIdx });
                                handleProductSearch(e.target.value);
                              }}
                              className={styles.input + " !pl-10"}
                              placeholder="BUSCAR EN STOCK O REMITOS..."
                            />
                          </div>

                          {/* RESULTADOS DE BÚSQUEDA */}
                          {searchActiveFor?.pkgIdx === pkgIdx &&
                            searchActiveFor?.prodIdx === prodIdx &&
                            searchResults.length > 0 && (
                              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-gray-50 border border-blue-200 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                                {searchResults.map((res, i) => (
                                  <button
                                    key={i}
                                    className="w-full text-left p-3 hover:bg-blue-600 hover:text-black transition-all border-b border-gray-200 last:border-0 group"
                                    onClick={() => {
                                      const newPkgs = [...returnPackages];
                                      const p =
                                        newPkgs[pkgIdx].products[prodIdx];
                                      const variantLabel =
                                        res.type === "STOCK"
                                          ? `${res.color || ""} ${res.storage || ""}`
                                              .replace(/Unico/gi, "")
                                              .trim()
                                          : "";
                                      p.name = variantLabel
                                        ? `${res.name} ${variantLabel}`
                                        : res.name;
                                      p.productId = res.productId || null;
                                      p.remitoItemId = res.remitoItemId || null;
                                      p.color = res.color || "";
                                      p.storage = res.storage || "";
                                      p.currentStock = res.stock;
                                      setReturnPackages(newPkgs);
                                      setSearchResults([]);
                                      setSearchActiveFor(null);
                                    }}
                                  >
                                    <p className="text-xs font-bold uppercase leading-tight">
                                      {res.display}
                                    </p>
                                    {res.type === "STOCK" ? (
                                      <span className="text-xs text-blue-600 group-hover:text-black font-bold uppercase tracking-widest mt-1 block">
                                        STOCK_RECOGNIZED
                                      </span>
                                    ) : (
                                      <span className="text-xs text-blue-500 group-hover:text-black font-bold uppercase tracking-widest mt-1 block">
                                        REMITO_LOCATED
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                          <label className={styles.label}>Cantidad</label>
                          <input
                            type="number"
                            value={prod.quantity}
                            onChange={(e) => {
                              const newPkgs = [...returnPackages];
                              newPkgs[pkgIdx].products[prodIdx].quantity =
                                Number(e.target.value);
                              setReturnPackages(newPkgs);
                            }}
                            className={styles.input}
                          />
                          {prod.currentStock !== undefined &&
                            prod.quantity > prod.currentStock && (
                              <div className="mt-2 bg-red-500/10 border border-red-500/30 p-2 flex items-center gap-2 animate-pulse">
                                <XCircleIcon className="w-3 h-3 text-red-500" />
                                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                                  STOCK INSUFICIENTE ({prod.currentStock})
                                </span>
                              </div>
                            )}
                        </div>

                        <div className="md:col-span-4">
                          <label className={styles.label}>
                            Razón Específica
                          </label>
                          <input
                            type="text"
                            value={prod.reason}
                            onChange={(e) => {
                              const newPkgs = [...returnPackages];
                              newPkgs[pkgIdx].products[prodIdx].reason =
                                e.target.value;
                              setReturnPackages(newPkgs);
                            }}
                            className={styles.input}
                            placeholder="FALLA TÉCNICA, ETC."
                          />
                        </div>

                        <div className="md:col-span-1 pt-8 flex justify-end">
                          <button
                            onClick={() => {
                              const newPkgs = [...returnPackages];
                              newPkgs[pkgIdx].products = newPkgs[
                                pkgIdx
                              ].products.filter((_, i) => i !== prodIdx);
                              if (newPkgs[pkgIdx].products.length === 0) {
                                setReturnPackages(
                                  returnPackages.filter((_, i) => i !== pkgIdx),
                                );
                              } else {
                                setReturnPackages(newPkgs);
                              }
                            }}
                            className="text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newPkgs = [...returnPackages];
                        newPkgs[pkgIdx].products.push({
                          ...initialProduct,
                          id: Date.now(),
                        });
                        setReturnPackages(newPkgs);
                      }}
                      className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-2 mt-4"
                    >
                      <PlusCircleIcon className="w-3 h-3" /> AÑADIR PRODUCTO AL
                      LOTE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitReturn}
              className={`${styles.btnPrimary} w-full mt-10`}
            >
              {isSubmitting ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                "SINCRONIZAR OPERACIÓN"
              )}
            </button>
          </div>
        </div>
      ) : (
        /* VISTA DE HISTORIAL CON BUSCADOR */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          {/* BUSCADOR MAESTRO */}
          <div className={styles.glassCard + " !p-4"}>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="BUSCAR POR PROVEEDOR O NOMBRE DE PRODUCTO..."
                className={
                  styles.input + " !pl-12 !py-4 !text-xs !tracking-[0.2em]"
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.glassCard}>
            <div className="flex justify-between items-center mb-8">
              <h2 className={styles.sectionTitle}>
                <ClipboardDocumentListIcon className="w-4 h-4" /> 03 ÍNDICE DE
                HISTORIAL
              </h2>
              <span className={styles.techText + " text-xs"}>
                {filteredHistory.length} RESULTADOS ENCONTRADOS
              </span>
            </div>

            <div className="space-y-4">
              {filteredHistory.length === 0 && (
                <div className="p-12 text-center border border-dashed border-gray-200">
                  <p className={styles.techText}>NO SE ENCONTRARON DATOS</p>
                </div>
              )}

              {filteredHistory.map((op) => (
                <div
                  key={op.DevolucionId}
                  className={`border ${expandedRow === op.DevolucionId ? "border-blue-200" : "border-gray-200"} bg-white overflow-hidden transition-all`}
                >
                  <div
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === op.DevolucionId
                          ? null
                          : op.DevolucionId,
                      )
                    }
                    className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 px-3 py-2">
                        <span className="text-xs text-gray-500 font-bold uppercase">
                          ID
                        </span>
                        <span className="text-blue-600 font-bold text-sm">
                          #{op.DevolucionId}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm uppercase tracking-tighter">
                          {op.clientName}
                        </h4>
                        <p className={styles.techText + " text-xs"}>
                          {op.returnDate} // MOTIVO: {op.generalReason}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold uppercase">
                          {op.returnPackages?.length} Lotes Registrados
                        </span>
                        <span
                          className={
                            styles.techText + " text-xs text-blue-600"
                          }
                        >
                          SISTEMA_FEDECELL_VERIFIED
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReturn(op.DevolucionId);
                        }}
                        className="p-2 text-gray-600 hover:text-red-500 transition-colors rounded-full hover:bg-red-500/10"
                        title="Eliminar Operación"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      {expandedRow === op.DevolucionId ? (
                        <ChevronUpIcon className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  </div>

                  {/* CONTENIDO DESPLEGABLE */}
                  {expandedRow === op.DevolucionId && (
                    <div className="p-6 bg-gray-50 border-t border-gray-200 animate-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {op.returnPackages?.map((pkg) => (
                          <div
                            key={pkg.LoteId}
                            className="p-4 border border-gray-200 bg-gray-50"
                          >
                            <h5 className="text-xs font-bold text-blue-600 mb-3 uppercase flex items-center gap-2 border-b border-gray-200 pb-2">
                              <ArchiveBoxIcon className="w-3 h-3" />{" "}
                              {pkg.packageName}
                            </h5>
                            <ul className="space-y-3">
                              {pkg.products?.map((prod) => (
                                <li
                                  key={prod.ProductoId}
                                  className="text-sm border-l-2 border-blue-200 pl-3"
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold text-gray-500 uppercase">
                                      {prod.name}
                                    </span>
                                    <span className="bg-blue-50 text-blue-600 text-xs px-1.5 py-0.5 font-bold">
                                      X{prod.quantity}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 italic text-xs mt-1 leading-tight">
                                    {prod.reason}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReturnTracker;
