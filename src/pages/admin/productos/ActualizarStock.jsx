import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiSearch,
  FiPlus,
  FiTrash2,
  FiSave,
  FiPackage,
  FiChevronDown,
  FiCheck,
  FiRefreshCcw,
  FiChevronUp,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";

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

const API_URL = import.meta.env.VITE_API_URL;

const ActualizarStock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockToAdd, setStockToAdd] = useState({}); // { variantIndex: value }
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newVariantInput, setNewVariantInput] = useState({
    color: "",
    almacenamiento: "",
    stock: "",
    costoDeCompra: "",
    precioAlPublico: "",
    precioMayorista: "",
    precioRevendedor: "",
  });
  const [newVariantes, setNewVariantes] = useState([]);

  // Búsqueda de productos
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length > 1) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/products?search=${searchTerm}`);
      setSearchResults(
        Array.isArray(res.data) ? res.data : res.data.products || [],
      );
    } catch (error) {
      console.error("ERROR_SEARCH", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct({
      ...product,
      variantes: Array.isArray(product.variantes) ? product.variantes : [],
    });
    setSearchResults([]);
    setSearchTerm("");
    setStockToAdd({});
    setNewVariantes([]);
  };

  const handleStockToAddChange = (index, value) => {
    setStockToAdd((prev) => ({ ...prev, [index]: value }));
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariantInput((prev) => ({ ...prev, [name]: value }));
  };

  const addNewVariant = () => {
    if (!newVariantInput.color || !newVariantInput.stock) {
      return alert("SISTEMA: Color y Stock son requeridos.");
    }
    setNewVariantes((prev) => [
      ...prev,
      {
        ...newVariantInput,
        stock: Number(newVariantInput.stock),
        costoDeCompra: Number(newVariantInput.costoDeCompra || 0),
        precioAlPublico: Number(newVariantInput.precioAlPublico || 0),
        precioMayorista: Number(newVariantInput.precioMayorista || 0),
        precioRevendedor: Number(newVariantInput.precioRevendedor || 0),
      },
    ]);
    setNewVariantInput({
      color: "",
      almacenamiento: "",
      stock: "",
      costoDeCompra: "",
      precioAlPublico: "",
      precioMayorista: "",
      precioRevendedor: "",
    });
  };

  const removeNewVariant = (index) => {
    setNewVariantes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGuardarCambios = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      // Procesar variantes existentes sumando el stock nuevo
      const variantesActualizadas = selectedProduct.variantes.map((v, i) => {
        const add = Number(stockToAdd[i] || 0);
        return {
          ...v,
          stock: Number(v.stock) + add,
        };
      });

      // Combinar con las nuevas variantes
      const finalVariantes = [...variantesActualizadas, ...newVariantes];

      const payload = {
        ...selectedProduct,
        variantes: finalVariantes,
        ultimaFechaCargoStock: new Date().toISOString().split("T")[0],
      };

      const res = await axios.put(
        `${API_URL}/products/${selectedProduct.id}`,
        payload,
      );

      if (res.status === 200 || res.status === 204) {
        Swal.fire({
          title: "¡SISTEMA ACTUALIZADO!",
          text: `El stock del producto "${selectedProduct.nombre}" ha sido actualizado correctamente.`,
          icon: "success",
          background: "#ffffff",
          color: "#fff",
          confirmButtonColor: "#2563EB",
        });
        setSelectedProduct(null);
        setNewVariantes([]);
      }
    } catch (error) {
      console.error("ERROR_UPDATE", error);
      Swal.fire({
        title: "ERROR DE SISTEMA",
        text: "No se pudo actualizar el stock. Intente nuevamente.",
        icon: "error",
        background: "#ffffff",
        color: "#fff",
        confirmButtonColor: "#2563EB",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* BUSCADOR DE PRODUCTOS */}
      <section className={`${STYLES.glass} p-8 border-blue-200`}>
        <h3 className={STYLES.sectionTitle}>01. BÚSQUEDA DE PRODUCTO</h3>
        <div className="relative group">
          <input
            type="text"
            placeholder="BUSCAR PRODUCTO POR NOMBRE O MARCA..."
            className={`${STYLES.input} pl-12 py-5 text-lg`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-blue-600 transition-colors"
            size={24}
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <FiRefreshCcw className="animate-spin text-blue-600" />
            </div>
          )}
        </div>

        {/* RESULTADOS DE BÚSQUEDA */}
        {searchResults.length > 0 && (
          <div className="mt-4 bg-white border border-gray-200 divide-y divide-gray-200 max-h-60 overflow-y-auto custom-scrollbar shadow-2xl z-50">
            {searchResults.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                    {p.imagenes?.[0] ? (
                      <img
                        src={p.imagenes[0]}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0"
                      />
                    ) : (
                      <FiPackage className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-sm uppercase">
                      {p.nombre}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">
                      {p.marca} // {p.categoria}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={STYLES.tech + " text-xs text-blue-600"}>
                    STOCK:{" "}
                    {p.variantes?.reduce(
                      (acc, v) => acc + (Number(v.stock) || 0),
                      0,
                    ) || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <div className="space-y-10">
          {/* INFO PRODUCTO SELECCIONADO */}
          <section className={`${STYLES.glass} p-8 border-blue-200`}>
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                  {selectedProduct.imagenes?.[0] ? (
                    <img
                      src={selectedProduct.imagenes[0]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiPackage size={30} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-tighter">
                    {selectedProduct.nombre}
                  </h2>
                  <p className={STYLES.tech + " text-gray-500"}>
                    {selectedProduct.marca} // {selectedProduct.categoria}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-3 bg-gray-50 hover:bg-white text-gray-500 hover:text-black transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* SUMAR STOCK A VARIANTES EXISTENTES */}
            <div className="space-y-6">
              <h3 className={STYLES.sectionTitle + " !mb-6"}>
                02. ACTUALIZAR STOCK ACTUAL
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProduct.variantes.map((v, i) => (
                  <div
                    key={i}
                    className="bg-white p-5 border border-gray-200 flex items-center justify-between group hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: v.color }}
                      ></div>
                      <div>
                        <p className="text-sm font-bold uppercase text-gray-900">
                          {v.color} - {v.almacenamiento}
                        </p>
                        <p
                          className={STYLES.tech + " text-xs text-gray-500"}
                        >
                          DISPONIBLE:{" "}
                          <span className="text-gray-900">{v.stock}</span>
                        </p>
                      </div>
                    </div>
                    <div className="w-32">
                      <label className="text-xs font-bold text-gray-600 block mb-1 uppercase tracking-widest">
                        + SUMAR
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className={`${STYLES.input} !py-2 !px-3 text-center !text-lg font-bold text-blue-600`}
                        value={stockToAdd[i] || ""}
                        onChange={(e) =>
                          handleStockToAddChange(i, e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* AÑADIR NUEVAS VARIANTES */}
          <section className={`${STYLES.glass} p-8 border-blue-200`}>
            <h3 className={STYLES.sectionTitle}>03. AÑADIR NUEVAS VARIANTES</h3>

            <div className="bg-gray-50 p-6 border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
                <div>
                  <label className={STYLES.label}>Color</label>
                  <div className="relative">
                    <div
                      className={`${STYLES.input} text-xs px-2 flex items-center justify-between cursor-pointer`}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                          style={{
                            backgroundColor:
                              newVariantInput.color || "transparent",
                          }}
                        ></div>
                        <span
                          className={`truncate ${newVariantInput.color ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {newVariantInput.color || "ELEGIR"}
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
                              setNewVariantInput({
                                ...newVariantInput,
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
                    value={newVariantInput.almacenamiento}
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
                    value={newVariantInput.stock}
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
                    value={newVariantInput.costoDeCompra}
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
                    value={newVariantInput.precioAlPublico}
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
                    value={newVariantInput.precioMayorista}
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
                    value={newVariantInput.precioRevendedor}
                    onChange={handleVariantChange}
                    className={`${STYLES.input} text-xs px-2`}
                  />
                </div>
              </div>
              <button
                onClick={addNewVariant}
                className="w-full bg-gray-100 text-gray-900 text-xs font-bold uppercase py-3 hover:bg-white hover:text-black transition-all mb-4 border border-gray-200"
              >
                <FiPlus className="inline mr-2" /> AGREGAR NUEVA VARIANTE AL
                LOTE
              </button>

              {newVariantes.length > 0 && (
                <div className="space-y-1 mt-6">
                  <p
                    className={
                      STYLES.tech +
                      " text-xs text-gray-500 border-b border-gray-200 pb-2 mb-2"
                    }
                  >
                    VARIANTES A INCORPORAR:
                  </p>
                  {newVariantes.map((v, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-white p-3 border-l-2 border-blue-500"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: v.color }}
                        ></div>
                        <span className={STYLES.tech + " text-gray-900"}>
                          {v.color} - {v.almacenamiento}
                        </span>
                        <span className="bg-blue-600 text-black text-xs font-bold px-2 py-0.5 ml-4 uppercase tracking-[0.2em]">
                          {v.stock} UNIDADES
                        </span>
                      </div>
                      <button
                        onClick={() => removeNewVariant(i)}
                        className="text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* FOOTER DE ACCIONES */}
          <div className="flex justify-end pt-10 border-t border-gray-200">
            <button
              onClick={handleGuardarCambios}
              disabled={
                loading ||
                (Object.keys(stockToAdd).every((k) => !stockToAdd[k]) &&
                  newVariantes.length === 0)
              }
              className={`${STYLES.btnPrimary} !py-6 !px-16 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <FiRefreshCcw className="animate-spin" /> PROCESANDO...
                </>
              ) : (
                <>
                  <FiSave size={20} /> GUARDAR TODAS LAS ACTUALIZACIONES
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #ffffff; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563EB; }
            `}</style>
    </div>
  );
};

export default ActualizarStock;
