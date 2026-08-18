import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage,
  FiPlus,
  FiTrash2,
  FiFileText,
  FiCheck,
  FiImage,
  FiX,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiCreditCard,
  FiLoader,
  FiDollarSign,
  FiList,
} from "react-icons/fi";
import SearchableSelect from "../../../components/SearchableSelect";
import { IKContext, IKUpload } from "imagekitio-react";

// --- CONFIGURACIÓN DE ESTILOS FEDECELL (PREMIUM DARK TECH) ---
const STYLES = {
  title: "text-2xl md:text-3xl font-bold text-gray-900",
  sectionTitle: "text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2",
  label: "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2",
  input: "w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-gray-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-gray-400",
  btnPrimary: "bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full px-6 py-2.5 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm",
  glass: "bg-white border border-gray-200 rounded-2xl p-8 shadow-sm",
  tech: "text-sm font-medium text-gray-700",
  badge: "px-3 py-1 text-xs font-semibold rounded-full border",
};

const ORIGENES_FONDOS = [
  "EFECTIVO CAJA",
  "TRANSFERENCIA",
  "TARJETA_DEBITO",
  "TARJETA_CREDITO",
];
const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/remito`;

// --- OPCIONES DE CATEGORÍA ---
const CATEGORIAS_OPTIONS = [
  "Celulares",
  "Fundas",
  "Cargadores",
  "Adaptadores",
  "Mandos de Consolas",
  "COMBOS",
  "Auriculares",
  "Parlantes",
  "Termos",
  "juguetes",
  "Otros",
  "Promo Navidad",
  "Promo día del Padre",
  "Promo día del madre",
  "Promo día del niño",
];

const authenticator = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/imagekit`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }
    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

const PREDEFINED_COLORS = [
  { name: "Negro", code: "#1C1C1E" },
  { name: "Blanco", code: "#F5F5F7" },
  { name: "Rojo", code: "#E11C2A" },
  { name: "Azul", code: "#0071E3" },
  { name: "Verde", code: "#505652" },
  { name: "Gris", code: "#8E8E93" },
  { name: "Dorado", code: "#F9E5C9" },
  { name: "Plateado", code: "#E3E4E5" },
  { name: "Violeta", code: "#E5DDEA" },
  { name: "Grafito", code: "#424245" },
  { name: "Sierra Azul", code: "#9BB5CE" },
  { name: "Medianoche", code: "#192028" },
  { name: "Estelar", code: "#FAF7F4" },
  { name: "Titanio", code: "#BEBDB8" },
  { name: "Deep Purple", code: "#594F63" },
];

const IngresoMercaderia = () => {
  const [activeTab, setActiveTab] = useState("CARGA");
  const [isDetailedMode, setIsDetailedMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [metodoPago, setMetodoPago] = useState("");
  const [expandedRemito, setExpandedRemito] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Estados JSON Masivo
  const [jsonInput, setJsonInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [transformedData, setTransformedData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(null); // { current, total, errors }

  const [datosRemito, setDatosRemito] = useState({
    numeroRemito: "",
    proveedorGeneral: "",
    fechaRecepcion: new Date().toISOString().split("T")[0],
    total: "", // Campo para el monto total de la deuda
  });

  // Estados restaurados para la carga completa
  const [listaProductosBuffer, setListaProductosBuffer] = useState([]);
  const [productoForm, setProductoForm] = useState({
    nombre: "",
    marca: "",
    categoria: "",
    alerta: 5,
    proveedor: "",
    origenDeVenta: "admin",
    fechaActualizacion: new Date().toISOString().split("T")[0],
    fechaUltimoCargo: new Date().toISOString().split("T")[0],
    descripcion: "",
    imagenes: [],
    variantes: [],
  });
  const [variantInput, setVariantInput] = useState({
    color: "",
    almacenamiento: "",
    stock: "",
    costoDeCompra: "",
    precioAlPublico: "",
    precioMayorista: "",
    precioRevendedor: "",
  });

  const [historialRemitos, setHistorialRemitos] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    if (activeTab === "HISTORIAL") fetchHistorial();
    fetchProvidersList();
  }, [activeTab]);

  const fetchProvidersList = async () => {
    try {
      const res = await axios.get(`${API_URL}/providers`);
      if (Array.isArray(res.data)) {
        setProveedores(res.data.map((p) => p.nombre));
      }
    } catch (error) {
      console.error("ERROR_FETCH_PROVIDERS", error);
    }
  };

  const fetchHistorial = async () => {
    try {
      const res = await fetch(`${BASE_URL}/historialRemitos`);
      const data = await res.json();
      setHistorialRemitos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("ERROR_FETCH", error);
      setHistorialRemitos([]);
    }
  };

  // --- LÓGICA RESTAURADA PARA CARGA COMPLETA ---
  const onError = (err) => {
    console.error("Error", err);
    alert("SISTEMA: Error al subir imágenes a la nube.");
    setIsUploading(false);
  };

  const onSuccess = (res) => {
    setProductoForm((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, res.url],
    }));
    setIsUploading(false);
  };

  const onUploadStart = (evt) => {
    setIsUploading(true);
  };

  const handleAddToList = () => {
    if (!productoForm.nombre)
      return alert("SISTEMA: Nombre del producto requerido.");
    if (productoForm.variantes.length === 0)
      return alert("SISTEMA: Debe agregar al menos una variante.");

    setListaProductosBuffer([
      ...listaProductosBuffer,
      { ...productoForm, tempId: Date.now() },
    ]);
    setProductoForm({
      ...productoForm,
      nombre: "",
      imagenes: [],
      descripcion: "",
      variantes: [],
    });
  };

  const handleVariantChange = (e) => {
    setVariantInput({ ...variantInput, [e.target.name]: e.target.value });
  };

  const addVariant = () => {
    if (!variantInput.stock || !variantInput.color)
      return alert("SISTEMA: Datos de variante incompletos.");
    setProductoForm((prev) => {
      const variantToAdd = {
        ...variantInput,
        stock: Number(variantInput.stock),
        costoDeCompra: Number(variantInput.costoDeCompra),
        precioAlPublico: Number(variantInput.precioAlPublico),
        precioMayorista: Number(variantInput.precioMayorista),
        precioRevendedor: Number(variantInput.precioRevendedor),
      };
      const newVariantes = [...prev.variantes, variantToAdd];
      return { ...prev, variantes: newVariantes };
    });
    setVariantInput({
      color: "",
      almacenamiento: "",
      stock: "",
      costoDeCompra: "",
      precioAlPublico: "",
      precioMayorista: "",
      precioRevendedor: "",
    });
  };

  const removeVariant = (idx) => {
    setProductoForm((prev) => {
      const newVariantes = prev.variantes.filter((_, i) => i !== idx);
      return { ...prev, variantes: newVariantes };
    });
  };

  const totalLote = useMemo(() => {
    return listaProductosBuffer.reduce((acc, p) => {
      const costoVariantes = p.variantes.reduce(
        (vAcc, v) => vAcc + Number(v.costoDeCompra || 0) * Number(v.stock),
        0,
      );
      return acc + costoVariantes;
    }, 0);
  }, [listaProductosBuffer]);

  const handleConfirmarIndexacionTotal = async () => {
    const isSimpleMode = !isDetailedMode;

    if (
      isSimpleMode &&
      (!datosRemito.numeroRemito ||
        !datosRemito.proveedorGeneral ||
        !datosRemito.total)
    ) {
      return alert(
        "SISTEMA: Número de Remito, Proveedor y Monto Total son requeridos para la carga simple.",
      );
    }
    if (
      !isSimpleMode &&
      (!datosRemito.numeroRemito ||
        !datosRemito.proveedorGeneral ||
        listaProductosBuffer.length === 0)
    ) {
      return alert(
        "SISTEMA: Remito, Proveedor y al menos un producto son requeridos para la carga completa.",
      );
    }

    const payload = {
      RemitoId: datosRemito.numeroRemito,
      proveedor: datosRemito.proveedorGeneral,
      fechaRecepcion: datosRemito.fechaRecepcion,
      total: isSimpleMode ? parseFloat(datosRemito.total) : totalLote,
      productos: isSimpleMode
        ? []
        : listaProductosBuffer.map(({ tempId, ...rest }) => {
            const totalStock =
              rest.variantes?.reduce(
                (acc, v) => acc + (Number(v.stock) || 0),
                0,
              ) || 0;
            return { ...rest, cantidad: totalStock };
          }),
    };

    try {
      const res = await fetch(`${BASE_URL}/crearRemito`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("SISTEMA: Remito registrado exitosamente.");
        setDatosRemito({
          numeroRemito: "",
          proveedorGeneral: "",
          fechaRecepcion: new Date().toISOString().split("T")[0],
          total: "",
        });
        setListaProductosBuffer([]);
        setActiveTab("HISTORIAL");
      }
    } catch (err) {
      alert("SISTEMA: Error crítico de red al registrar el remito.");
    }
  };

  const confirmarPago = async () => {
    if (!metodoPago) return;
    try {
      const id = selectedRemito.RemitoId || selectedRemito.id;
      const res = await fetch(`${BASE_URL}/liquidarPago/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodoPago }),
      });
      if (res.ok) {
        setShowPayModal(false);
        fetchHistorial();
        alert(
          `✅ PAGO CONFIRMADO\n\nLos productos del lote fueron cargados automáticamente al inventario.\n\nPodés verificarlos en la sección de Productos.`,
        );
      } else {
        const err = await res.json().catch(() => ({}));
        alert(
          `❌ Error al procesar el pago: ${err.detail || err.message || "Error desconocido"}`,
        );
      }
    } catch (e) {
      alert("ERR_PAY");
    }
  };

  const handleDeleteRemito = async (id) => {
    if (
      !window.confirm(
        `¿Está seguro de eliminar el remito ID #${id}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/eliminarRemito/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Remito eliminado correctamente.");
        fetchHistorial(); // Refresh list
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Error al eliminar: ${err.message || "Error desconocido"}`);
      }
    } catch (e) {
      console.error("DELETE_REMITO_ERROR", e);
      alert("Error de conexión al intentar eliminar el remito.");
    }
  };

  // --- LÓGICA DE CARGA MASIVA JSON ---
  const handleTransformJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed))
        throw new Error("El JSON debe ser un array de productos.");

      const today = new Date().toISOString().split("T")[0];
      let total = 0;

      parsed.forEach((p) => {
        total +=
          (Math.abs(parseFloat(p.precio)) || 0) *
          (Math.abs(parseFloat(p.cantidad)) || 0);
      });

      let proveedorGeneral = "Lu petruccelli";
      if (parsed.length > 0 && parsed[0].marca) {
        proveedorGeneral = parsed[0].marca.trim();
        if (!proveedorGeneral) proveedorGeneral = "Lu petruccelli";
      }

      const remitoId = "REM-" + Date.now();

      const transformedProducts = parsed.map((p) => {
        const qty = Math.abs(parseFloat(p.cantidad)) || 0;
        const precioNumerico = Math.abs(parseFloat(p.precio)) || 0;
        const precioMayoristaNum = p.talle
          ? Math.abs(parseFloat(p.talle))
          : null;
        const marcaLimpia = p.marca ? p.marca.trim() : "";

        return {
          nombre: p.nombre || "Sin nombre",
          marca: marcaLimpia,
          categoria: p.categoria || "Otros",
          descripcion: p.descripcion || "",
          imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
          alerta: 5,
          proveedor: marcaLimpia || proveedorGeneral,
          origenDeVenta: "admin",
          fechaActualizacion: today,
          fechaUltimoCargo: today,
          cantidad: qty,
          variantes: [
            {
              color: "N/A",
              almacenamiento: "N/A",
              stock: qty,
              costoDeCompra: null,
              precioAlPublico: precioNumerico,
              precioMayorista: Number.isNaN(precioMayoristaNum)
                ? null
                : precioMayoristaNum,
              precioRevendedor: null,
            },
          ],
        };
      });

      const finalResult = {
        RemitoId: remitoId,
        proveedor: proveedorGeneral,
        fechaRecepcion: today,
        total: total,
        productos: transformedProducts,
      };

      setJsonOutput(JSON.stringify(finalResult, null, 2));
      setTransformedData(finalResult);
    } catch (e) {
      alert("SISTEMA: Error al procesar JSON. " + e.message);
    }
  };

  const handleCopyJson = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
    alert("SISTEMA: JSON transformado copiado al portapapeles.");
  };

  const handleLoadMassiveJson = async () => {
    if (!transformedData)
      return alert("SISTEMA: Primero debe transformar un JSON válido.");

    const productos = transformedData.productos;
    if (!productos || productos.length === 0)
      return alert("SISTEMA: No hay productos para cargar.");

    const total = productos.length;
    let exitosos = 0;
    let errores = 0;

    setLoadingProgress({ current: 0, total, errors: 0 });

    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      const payloadIndividual = {
        RemitoId: `${transformedData.RemitoId}-${i + 1}`,
        proveedor: transformedData.proveedor,
        fechaRecepcion: transformedData.fechaRecepcion,
        total: producto.variantes?.[0]?.precioAlPublico || 0,
        productos: [producto],
      };

      try {
        const res = await fetch(`${BASE_URL}/crearRemito`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadIndividual),
        });
        if (res.ok) {
          exitosos++;
        } else {
          errores++;
          console.error(`ERROR_PRODUCTO_${i + 1}:`, await res.text());
        }
      } catch (err) {
        errores++;
        console.error(`NET_ERROR_PRODUCTO_${i + 1}:`, err);
      }

      setLoadingProgress({ current: i + 1, total, errors: errores });
    }

    setLoadingProgress(null);
    alert(
      `SISTEMA: Carga completada.\n✅ ${exitosos} productos cargados correctamente.\n${errores > 0 ? `❌ ${errores} productos fallaron.` : ""}`,
    );
    setJsonInput("");
    setJsonOutput("");
    setTransformedData(null);
    setActiveTab("HISTORIAL");
  };

  return (
    <div className="bg-white min-h-screen p-8 text-gray-900 font-sans selection:bg-blue-600 selection:text-black">
      {/* HEADER TÁCTICO */}
      <header className="mb-12 flex justify-between items-end border-b border-gray-200 pb-10">
        <div>
          <h1 className={STYLES.title + " text-4xl"}>INVENTARIO CORE</h1>
          <p className={STYLES.tech + " text-gray-500 mt-2"}>
            FEDECELL_LABS // BATCH_PROCESSING_UNIT
          </p>
          <div className="flex gap-4 mb-8 overflow-x-auto pb-4 custom-scrollbar">
          <button
            onClick={() => setActiveTab("CARGA")}
            className={`${activeTab === "CARGA" ? "bg-blue-600 text-white border-transparent" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"} border rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-2`}
          >
            CARGAR NUEVO
          </button>
          <button
            onClick={() => setActiveTab("MASIVA_JSON")}
            className={`${activeTab === "MASIVA_JSON" ? "bg-blue-600 text-white border-transparent" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"} border rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-2`}
          >
            JSON MASIVO
          </button>
          <button
            onClick={() => setActiveTab("HISTORIAL")}
            className={`${activeTab === "HISTORIAL" ? "bg-blue-600 text-white border-transparent" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"} border rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-2`}
          >
            HISTORIAL DE LOGS
          </button>
        </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === "CARGA" ? (
          <motion.div
            key="carga"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* 01. IDENTIFICACIÓN DEL DOCUMENTO */}
            <section className={`${STYLES.glass} p-8 mb-8 border-blue-200`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className={STYLES.sectionTitle}>01. DATOS DEL REMITO</h3>
                <div className="flex items-center gap-2 bg-white p-1 border border-gray-200">
                  <button
                    onClick={() => setIsDetailedMode(false)}
                    className={`${STYLES.tech} text-xs px-4 py-2 ${!isDetailedMode ? "bg-blue-600 text-black" : "text-gray-500"}`}
                  >
                    CARGA SIMPLE
                  </button>
                  <button
                    onClick={() => setIsDetailedMode(true)}
                    className={`${STYLES.tech} text-xs px-4 py-2 ${isDetailedMode ? "bg-blue-600 text-black" : "text-gray-500"}`}
                  >
                    CARGA COMPLETA
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <label className={STYLES.label}>
                    Folio Remito/Factura (ID)
                  </label>
                  <input
                    type="text"
                    className={STYLES.input}
                    value={datosRemito.numeroRemito}
                    onChange={(e) =>
                      setDatosRemito({
                        ...datosRemito,
                        numeroRemito: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <SearchableSelect
                    label="Proveedor Maestro"
                    options={proveedores}
                    value={datosRemito.proveedorGeneral}
                    onChange={(val) =>
                      setDatosRemito({ ...datosRemito, proveedorGeneral: val })
                    }
                    styles={STYLES}
                    placeholder="BUSCAR PROVEEDOR..."
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label className={STYLES.label}>Fecha Recepción</label>
                  <input
                    type="date"
                    className={STYLES.input}
                    value={datosRemito.fechaRecepcion}
                    onChange={(e) =>
                      setDatosRemito({
                        ...datosRemito,
                        fechaRecepcion: e.target.value,
                      })
                    }
                  />
                </div>
                {!isDetailedMode && (
                  <div className="md:col-span-1">
                    <label className={STYLES.label}>
                      Monto Total a Pagar ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`${STYLES.input} text-2xl text-orange-500 font-bold`}
                      value={datosRemito.total}
                      onChange={(e) =>
                        setDatosRemito({
                          ...datosRemito,
                          total: e.target.value,
                        })
                      }
                      required
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
            </section>

            <AnimatePresence>
              {isDetailedMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* 02. FORMULARIO TÉCNICO PRODUCTO */}
                  <section className={`${STYLES.glass} p-8 border-blue-200`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                      <div>
                        <label className={STYLES.label}>Nombre Producto</label>
                        <input
                          type="text"
                          className={STYLES.input}
                          value={productoForm.nombre}
                          onChange={(e) =>
                            setProductoForm({
                              ...productoForm,
                              nombre: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={STYLES.label}>
                          Marca / Fabricante
                        </label>
                        <input
                          type="text"
                          className={STYLES.input}
                          value={productoForm.marca}
                          onChange={(e) =>
                            setProductoForm({
                              ...productoForm,
                              marca: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="relative">
                        <label className={STYLES.label}>Categoría</label>
                        <select
                          className={STYLES.input}
                          value={productoForm.categoria}
                          onChange={(e) =>
                            setProductoForm({
                              ...productoForm,
                              categoria: e.target.value,
                            })
                          }
                        >
                          <option
                            value=""
                            disabled
                            className="bg-white text-gray-500 uppercase font-bold"
                          >
                            -- SELECCIONAR --
                          </option>
                          {CATEGORIAS_OPTIONS.map((cat) => (
                            <option
                              key={cat}
                              value={cat}
                              className="bg-white text-gray-900 uppercase font-bold"
                            >
                              {cat}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 bottom-4 pointer-events-none">
                          <FiChevronDown className="text-gray-500" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-12 bg-gray-50 p-6 border border-gray-200">
                      <h4 className={`${STYLES.tech} text-blue-600 mb-4`}>
                        CONFIGURACIÓN DE VARIANTES (OPCIONAL)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-4">
                        <div>
                          <label className={STYLES.label}>Color</label>
                          <div className="relative">
                            <div
                              className={`${STYLES.input} text-xs px-2 flex items-center justify-between cursor-pointer`}
                              onClick={() =>
                                setShowColorPicker(!showColorPicker)
                              }
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <div
                                  className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      variantInput.color || "transparent",
                                  }}
                                ></div>
                                <span
                                  className={`truncate ${variantInput.color ? "text-gray-900" : "text-gray-500"}`}
                                >
                                  {variantInput.color || "ELEGIR"}
                                </span>
                              </div>
                              <FiChevronDown
                                className={`text-gray-500 transition-transform ${showColorPicker ? "rotate-180" : ""}`}
                              />
                            </div>
                            {showColorPicker && (
                              <div className="absolute top-full left-0 w-[250%] z-50 bg-[#ffffff] border border-gray-200 p-3 shadow-2xl grid grid-cols-5 gap-2 mt-1">
                                {PREDEFINED_COLORS.map((c) => (
                                  <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => {
                                      setVariantInput({
                                        ...variantInput,
                                        color: c.code,
                                      });
                                      setShowColorPicker(false);
                                    }}
                                    className="flex flex-col items-center gap-1 p-1 hover:bg-gray-50 rounded transition-colors group"
                                    title={c.name}
                                  >
                                    <div
                                      className="w-5 h-5 rounded-full border border-gray-200 shadow-sm group-hover:scale-110 transition-transform"
                                      style={{ backgroundColor: c.code }}
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className={STYLES.label}>Capacidad</label>
                          <input
                            placeholder="EJ: 128GB"
                            name="almacenamiento"
                            value={variantInput.almacenamiento}
                            onChange={handleVariantChange}
                            className={`${STYLES.input} text-xs px-2`}
                          />
                        </div>
                        <div>
                          <label className={STYLES.label}>Stock</label>
                          <input
                            type="number"
                            placeholder="0"
                            name="stock"
                            value={variantInput.stock}
                            onChange={handleVariantChange}
                            className={`${STYLES.input} text-xs px-2 border-blue-200`}
                          />
                        </div>
                        <div>
                          <label className={STYLES.label}>Costo</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            name="costoDeCompra"
                            value={variantInput.costoDeCompra}
                            onChange={handleVariantChange}
                            className={`${STYLES.input} text-xs px-2`}
                          />
                        </div>
                        <div>
                          <label className={STYLES.label}>$ Público</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            name="precioAlPublico"
                            value={variantInput.precioAlPublico}
                            onChange={handleVariantChange}
                            className={`${STYLES.input} text-xs px-2`}
                          />
                        </div>
                        <div>
                          <label className={STYLES.label}>$ Mayor</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            name="precioMayorista"
                            value={variantInput.precioMayorista}
                            onChange={handleVariantChange}
                            className={`${STYLES.input} text-xs px-2`}
                          />
                        </div>
                        <div>
                          <label className={STYLES.label}>$ Revend</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            name="precioRevendedor"
                            value={variantInput.precioRevendedor}
                            onChange={handleVariantChange}
                            className={`${STYLES.input} text-xs px-2`}
                          />
                        </div>
                      </div>
                      <button
                        onClick={addVariant}
                        className="w-full bg-gray-100 text-gray-900 text-xs font-bold uppercase py-2 hover:bg-blue-600 hover:text-black transition-all mb-4"
                      >
                        AGREGAR VARIANTE AL PRODUCTO
                      </button>
                      {productoForm.variantes.length > 0 && (
                        <div className="space-y-1">
                          {productoForm.variantes.map((v, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-white p-2 border-l border-blue-500"
                            >
                              <span
                                className={
                                  STYLES.tech +
                                  " text-gray-500 flex items-center gap-2"
                                }
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: v.color }}
                                ></div>{" "}
                                {v.color} {v.almacenamiento} - {v.stock}u.
                              </span>
                              <button
                                onClick={() => removeVariant(i)}
                                className="text-red-500"
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <h3 className={STYLES.sectionTitle}>
                      03. Gestión de Existencias
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                      <div className="md:col-span-4">
                        <label className={STYLES.label}>Stock Total</label>
                        <input
                          type="number"
                          className={STYLES.input}
                          value={productoForm.variantes.reduce(
                            (acc, v) => acc + (Number(v.stock) || 0),
                            0,
                          )}
                          readOnly
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className={STYLES.label}>Alerta Mínimo</label>
                        <input
                          type="number"
                          className={STYLES.input}
                          value={productoForm.alerta}
                          onChange={(e) =>
                            setProductoForm({
                              ...productoForm,
                              alerta: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-4 border border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 relative min-h-[120px]">
                        <IKContext
                          publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
                          urlEndpoint={
                            import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT
                          }
                          authenticator={authenticator}
                        >
                          <IKUpload
                            fileName="product_img"
                            useUniqueFileName={true}
                            folder="/products"
                            multiple={true}
                            onError={onError}
                            onSuccess={onSuccess}
                            onUploadStart={onUploadStart}
                            className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                            disabled={isUploading}
                          />
                        </IKContext>
                        {isUploading ? (
                          <FiLoader className="animate-spin text-blue-600" />
                        ) : (
                          <FiImage className="text-gray-700" size={24} />
                        )}
                        <span className="text-xs uppercase mt-1">
                          {productoForm.imagenes.length} ARCHIVOS CARGADOS
                        </span>
                        <div className="absolute bottom-2 left-2 right-2 flex gap-1 overflow-x-auto no-scrollbar">
                          {productoForm.imagenes.map((url, i) => (
                            <div
                              key={i}
                              className="relative w-8 h-8 border border-blue-200 flex-shrink-0"
                            >
                              <img
                                src={url}
                                className="w-full h-full object-cover grayscale"
                              />
                              <button
                                onClick={() =>
                                  setProductoForm((p) => ({
                                    ...p,
                                    imagenes: p.imagenes.filter(
                                      (x) => x !== url,
                                    ),
                                  }))
                                }
                                className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full"
                              >
                                <FiX size={8} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <label className={STYLES.label}>Actualización</label>
                        <input
                          type="date"
                          className={STYLES.input}
                          value={productoForm.fechaActualizacion}
                          onChange={(e) =>
                            setProductoForm({
                              ...productoForm,
                              fechaActualizacion: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className={STYLES.label}>Último Cargo</label>
                        <input
                          type="date"
                          className={STYLES.input}
                          value={productoForm.fechaUltimoCargo}
                          onChange={(e) =>
                            setProductoForm({
                              ...productoForm,
                              fechaUltimoCargo: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-6">
                        <SearchableSelect
                          label="Proveedor Origen"
                          options={proveedores}
                          value={productoForm.proveedor}
                          onChange={(val) =>
                            setProductoForm({ ...productoForm, proveedor: val })
                          }
                          styles={STYLES}
                          placeholder="BUSCAR PROVEEDOR..."
                        />
                      </div>
                      <div className="md:col-span-12">
                        <label className={STYLES.label}>Descripción</label>
                        <textarea
                          className={`${STYLES.input} h-20 resize-none`}
                          value={productoForm.descripcion}
                          onChange={(e) =>
                            setProductoForm({
                              ...productoForm,
                              descripcion: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToList}
                      className="w-full bg-white text-black font-bold text-xs py-4 uppercase tracking-[0.2em] hover:bg-blue-600 transition-all"
                    >
                      AÑADIR PRODUCTO AL LOTE TEMPORAL
                    </button>
                  </section>

                  {listaProductosBuffer.length > 0 && (
                    <section
                      className={`${STYLES.glass} p-8 mt-12 border-t-2 border-blue-500 animate-in slide-in-from-bottom-4`}
                    >
                      <h3 className={STYLES.sectionTitle}>
                        04. Ítems Pendientes de Indexación
                      </h3>
                      <div className="space-y-4">
                        {listaProductosBuffer.map((p) => (
                          <div
                            key={p.tempId}
                            className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 group"
                          >
                            <div className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-white flex items-center justify-center border border-gray-200 overflow-hidden">
                                {p.imagenes[0] ? (
                                  <img
                                    src={p.imagenes[0]}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                  />
                                ) : (
                                  <FiPackage className="text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase">
                                  {p.nombre}
                                </p>
                                <p
                                  className={
                                    STYLES.tech + " text-xs text-gray-500"
                                  }
                                >
                                  {p.variantes.reduce(
                                    (acc, v) => acc + (Number(v.stock) || 0),
                                    0,
                                  )}{" "}
                                  UNIDADES ({p.variantes.length} VAR)
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8">
                              <p
                                className={
                                  STYLES.tech + " text-blue-600 font-bold"
                                }
                              >
                                $
                                {p.variantes
                                  .reduce(
                                    (acc, v) =>
                                      acc +
                                      Number(v.costoDeCompra || 0) *
                                        Number(v.stock),
                                    0,
                                  )
                                  .toLocaleString()}
                              </p>
                              <button
                                onClick={() =>
                                  setListaProductosBuffer(
                                    listaProductosBuffer.filter(
                                      (x) => x.tempId !== p.tempId,
                                    ),
                                  )
                                }
                                className="text-gray-700 hover:text-red-500 transition-colors"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="mt-10 pt-8 border-t border-gray-200 flex justify-between items-center">
                          <div className="text-2xl font-bold">
                            TOTAL LOTE:{" "}
                            <span className="text-blue-600">
                              ${totalLote.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 pt-8 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleConfirmarIndexacionTotal}
                className={STYLES.btnPrimary + " !py-6 !px-12"}
              >
                {isDetailedMode ? "INDEXAR REMITO COMPLETO" : "GUARDAR DEUDA"}
              </button>
            </div>
          </motion.div>
        ) : activeTab === "MASIVA_JSON" ? (
          <motion.div
            key="masiva_json"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <section className={`${STYLES.glass} p-8 mb-8 border-blue-200`}>
              <h3 className={STYLES.sectionTitle}>
                TRANSFORMACIÓN Y CARGA DE JSON
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <label className={STYLES.label}>
                    JSON Original (Array de Productos)
                  </label>
                  <textarea
                    className={`${STYLES.input} h-[400px] resize-none font-sans text-xs sm:text-xs leading-relaxed overflow-y-auto whitespace-pre`}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='[
  {
    "nombre": "Ejemplo",
    "precio": 1000,
    "cantidad": 5,
    "marca": "Lu Petruccelli",
    ...
  }
]'
                  />
                  <button
                    onClick={handleTransformJson}
                    className="w-full bg-blue-600 hover:bg-white text-black font-bold text-xs py-4 mt-4 uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2"
                  >
                    <FiLoader
                      className={
                        !transformedData && jsonInput
                          ? "animate-spin"
                          : "hidden"
                      }
                    />
                    TRANSFORMAR JSON
                  </button>
                </div>
                <div>
                  <label className={STYLES.label}>JSON Transformado</label>
                  <textarea
                    className={`${STYLES.input} h-[400px] resize-none font-sans text-xs sm:text-xs leading-relaxed overflow-y-auto whitespace-pre bg-gray-100 text-blue-600 border-gray-100 focus:border-gray-200 focus:ring-1 focus:ring-white`}
                    value={jsonOutput}
                    readOnly
                    placeholder="Esperando transformación..."
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                      onClick={handleCopyJson}
                      className="w-full border border-gray-200 hover:border-gray-200 text-gray-900 font-bold text-xs py-4 uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2"
                    >
                      <FiFileText />
                      COPIAR JSON
                    </button>
                    <button
                      onClick={handleLoadMassiveJson}
                      disabled={!transformedData || !!loadingProgress}
                      className={`w-full font-bold text-xs py-4 uppercase tracking-[0.2em] transition-all flex flex-col justify-center items-center gap-1 ${transformedData && !loadingProgress ? "bg-white text-black hover:bg-blue-600" : "bg-gray-50 text-gray-500 cursor-not-allowed"}`}
                    >
                      {loadingProgress ? (
                        <>
                          <span className="flex items-center gap-2">
                            <FiLoader className="animate-spin" />
                            CARGANDO {loadingProgress.current}/
                            {loadingProgress.total}
                          </span>
                          <div className="w-full bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{
                                width: `${(loadingProgress.current / loadingProgress.total) * 100}%`,
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {transformedData && (
                            <FiCheck className="text-green-500" />
                          )}
                          CARGAR AL SISTEMA
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          /* HISTORIAL */
          <motion.div
            key="historial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className={STYLES.glass + " p-8"}>
              <h3 className={STYLES.sectionTitle}>
                05. Registro de Remitos Confirmados
              </h3>
              <div className="space-y-4">
                {Array.isArray(historialRemitos) &&
                  historialRemitos.map((remito) => (
                    <div
                      key={remito.RemitoId}
                      className="border border-gray-200 bg-white overflow-hidden"
                    >
                      <div
                        onClick={() =>
                          setExpandedRemito(
                            expandedRemito === remito.RemitoId
                              ? null
                              : remito.RemitoId,
                          )
                        }
                        className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-center gap-6">
                          <div className="bg-gray-50 p-3 border border-gray-200">
                            <FiFileText className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm uppercase tracking-tighter">
                              {remito.proveedor}
                            </h4>
                            <p
                              className={
                                STYLES.tech + " text-xs text-gray-500"
                              }
                            >
                              FOLIO: {remito.RemitoId} // FECHA:{" "}
                              {remito.fechaRecepcion}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-bold text-blue-600 text-lg">
                              ${Number(remito.total).toLocaleString()}
                            </p>
                            <span
                              className={`${STYLES.badge} ${remito.estado === "pagado" ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}`}
                            >
                              {remito.estado}
                            </span>
                          </div>
                          {remito.estado === "no pagado" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRemito(remito);
                                  setShowPayModal(true);
                                }}
                                className="bg-white text-black font-bold text-xs px-4 py-2 uppercase hover:bg-blue-600 transition-all"
                              >
                                PAGAR
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRemito(
                                    remito.RemitoId || remito.id,
                                  );
                                }}
                                className="text-gray-600 hover:text-red-500 transition-colors p-2"
                                title="Eliminar Remito"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          )}
                          {expandedRemito === remito.RemitoId ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedRemito === remito.RemitoId && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50 border-t border-gray-200 p-8 overflow-hidden"
                          >
                            <h5
                              className={
                                STYLES.tech + " text-xs text-blue-600 mb-6"
                              }
                            >
                              ÍTEMS DENTRO DEL FOLIO
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {remito.productos &&
                                remito.productos.map((prod, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 border border-gray-200 overflow-hidden">
                                        {prod.imagenes?.[0] ? (
                                          <img
                                            src={prod.imagenes[0]}
                                            className="w-full h-full object-cover grayscale"
                                          />
                                        ) : (
                                          <FiPackage className="m-auto mt-3 text-gray-400" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold uppercase text-gray-900">
                                          {prod.nombre}
                                        </p>
                                        <p className="text-xs text-gray-600 tracking-widest">
                                          {prod.marca} // {prod.categoria}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p
                                        className={STYLES.tech + " text-gray-900"}
                                      >
                                        {prod.cantidad} UN x $
                                        {Number(
                                          prod.costoCompra ||
                                            prod.precioCompra ||
                                            0,
                                        ).toLocaleString()}
                                      </p>
                                      <p
                                        className={
                                          STYLES.tech +
                                          " text-blue-600 text-xs"
                                        }
                                      >
                                        SUBTOTAL: $
                                        {(
                                          prod.cantidad *
                                          (prod.costoCompra ||
                                            prod.precioCompra ||
                                            0)
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    {/* DESGLOSE DE VARIANTES SI EXISTE */}
                                    {prod.variantes &&
                                      prod.variantes.length > 0 && (
                                        <div className="mt-4 pl-16 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                          {prod.variantes.map((v, vIdx) => (
                                            <div
                                              key={vIdx}
                                              className="bg-white p-2 border border-gray-200 flex flex-col items-center"
                                            >
                                              <div
                                                className="w-2 h-2 rounded-full mb-1"
                                                style={{
                                                  backgroundColor: v.color,
                                                }}
                                              ></div>
                                              <span className="text-xs uppercase text-gray-500">
                                                {v.almacenamiento || "S/D"}
                                              </span>
                                              <span className="text-xs font-bold text-gray-900">
                                                CANT: {v.stock}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE LIQUIDACIÓN */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`${STYLES.glass} w-full max-w-md p-10 border-blue-200 shadow-xl`}
            >
              <h2 className={STYLES.title + " text-xl mb-8"}>
                Liquidación de Deuda
              </h2>
              <div className="mb-8">
                <p className={STYLES.tech + " text-gray-500"}>TOTAL A PAGAR</p>
                <p className="text-4xl font-bold text-gray-900">
                  ${Number(selectedRemito?.total).toLocaleString()}
                </p>
              </div>
              <div className="space-y-3">
                <label className={STYLES.label}>Origen de Fondos</label>
                {ORIGENES_FONDOS.map((o) => (
                  <button
                    key={o}
                    onClick={() => setMetodoPago(o)}
                    className={`w-full text-left p-4 border text-xs font-bold tracking-widest uppercase transition-all ${metodoPago === o ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600"}`}
                  >
                    <FiCreditCard className="inline mr-3" /> {o}
                  </button>
                ))}
                <button
                  onClick={confirmarPago}
                  className={STYLES.btnPrimary + " w-full mt-8 py-5"}
                >
                  CONFIRMAR LIQUIDACIÓN EN EL SISTEMA
                </button>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="w-full text-gray-700 text-xs font-bold uppercase mt-4"
                >
                  Abortar Operación
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IngresoMercaderia;
