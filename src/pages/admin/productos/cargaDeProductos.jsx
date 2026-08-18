import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiPlus,
  FiCheck,
  FiRefreshCcw,
  FiClock,
  FiLayers,
  FiImage,
  FiInfo,
  FiPackage,
  FiDollarSign,
  FiList,
  FiTrash2,
  FiChevronDown,
  FiLock,
} from "react-icons/fi";
import IngresoMercaderia from "./cargaMercaderiaMasiva";
import ActualizarStock from "./ActualizarStock";
import ProductReturnTracker from "../productos/devolucionProductos";
import HistorialDevoluciones from "./historial de devoluciones";
import SearchableSelect from "../../../components/SearchableSelect";
import { IKContext, IKUpload } from "imagekitio-react";
/* --- Datos de Referencia --- */
const getTodayDate = () => new Date().toISOString().split("T")[0];
const API_URL = import.meta.env.VITE_API_URL;
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
const initialProductState = {
  nombre: "",
  marca: "",
  categoria: "",
  alerta: "5",
  descuento: "0",
  proveedor: "",
  fechaActualizacionPrecio: getTodayDate(),
  ultimaFechaCargoStock: getTodayDate(),
  descripcion: "",
  imagenes: [],
  variantes: [],
};
const initialVariantState = {
  color: "",
  almacenamiento: "",
  aroma: "",
  stock: "",
  costoDeCompra: "",
  precioAlPublico: "",
  precioMayorista: "",
  precioRevendedor: "",
};

/* --- COMPONENTE: CARGA DE PRODUCTOS --- */
const CargaDeProductosContent = () => {
  const [nuevoProducto, setNuevoProducto] = useState(initialProductState);
  const [variantInput, setVariantInput] = useState(initialVariantState);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileError, setFileError] = useState("");
  
  // --- UI Stepper State ---
  const [activeStep, setActiveStep] = useState(1);
  const isStep1Complete = () => nuevoProducto.nombre.trim() !== "" && nuevoProducto.categoria !== "";
  const isStep2Complete = () => nuevoProducto.variantes.length > 0;

  useEffect(() => {
    fetchProvidersList();
    fetchCategoriesList();
  }, []);
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
  const fetchCategoriesList = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      if (Array.isArray(res.data)) {
        setCategorias(res.data);
      }
    } catch (error) {
      console.error("ERROR_FETCH_CATEGORIES", error);
      /* No bloqueamos la UI si falla, el usuario puede agregar una nueva */
    }
  };
  const handleAddCategory = async () => {
    const trimmedCategory = newCategoryInput.trim();
    if (!trimmedCategory) return;
    setIsAddingCategory(true);
    try {
      const response = await axios.post(`${API_URL}/api/categories`, {
        nombre: trimmedCategory,
      });
      await fetchCategoriesList();
      // Re-sincroniza la lista completa
      setNuevoProducto((prev) => ({
        ...prev,
        categoria: response.data.categoryName,
      }));
      setNewCategoryInput("");
    } catch (error) {
      console.error("ERROR_ADD_CATEGORY", error);
      if (error.response && error.response.status === 409) {
        const existingCategory = error.response.data.category;
        setNuevoProducto((prev) => ({
          ...prev,
          categoria: existingCategory.categoryName,
        }));
        setNewCategoryInput("");
        alert("SISTEMA: La categoría ya existe, se ha seleccionado.");
      } else {
        alert("SISTEMA: Error al agregar la categoría.");
      }
    } finally {
      setIsAddingCategory(false);
    }
  };
  const handleDeleteCategory = async () => {
    const categoryName = nuevoProducto.categoria;
    if (!categoryName) {
      alert("SISTEMA: Por favor, seleccione una categoría para eliminar.");
      return;
    }
    const categoryToDelete = categorias.find(
      (cat) => cat.categoryName === categoryName,
    );
    if (!categoryToDelete) {
      alert(
        "SISTEMA: La categoría seleccionada no es válida o ya fue eliminada.",
      );
      return;
    }
    if (
      window.confirm(
        `¿Está seguro que desea eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`,
      )
    ) {
      setIsDeletingCategory(true);
      try {
        await axios.delete(
          `${API_URL}/api/categories/${categoryToDelete.categoryId}`,
        );
        // Activamos animación de éxito
        setDeleteSuccess(true);
        setNuevoProducto((prev) => ({ ...prev, categoria: "" }));
        await fetchCategoriesList();
        // Reseteamos el estado después de 2 segundos
        setTimeout(() => setDeleteSuccess(false), 2000);
      } catch (error) {
        console.error("ERROR_DELETE_CATEGORY", error);
        alert(
          error.response?.data?.message ||
            "SISTEMA: Error al eliminar la categoría. Es posible que esté en uso por algún producto.",
        );
      } finally {
        setIsDeletingCategory(false);
      }
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };
  const onError = (err) => {
    console.error("Error", err);
    alert("SISTEMA: Error al subir imágenes a la nube.");
    setLoading(false);
    setUploadProgress(0);
  };
  const onSuccess = (res) => {
    setNuevoProducto((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, res.url],
    }));
    setLoading(false);
    setUploadProgress(0);
  };
  const handleRemoveImage = (indexToRemove) => {
    setNuevoProducto((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, index) => index !== indexToRemove),
    }));
  };
  const onUploadStart = (evt) => {
    setFileError("");
    const file = evt.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setFileError(
        "SISTEMA: El archivo seleccionado no es una imagen válida (JPG, PNG, WEBP, etc.).",
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    setUploadProgress(50);
  };
  const preventInvalidNumbers = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };
  const handleGuardarProducto = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nuevoProducto, origenDeVenta: "admin" }),
      });
      if (response.ok) {
        alert(
          `SISTEMA: Producto "${nuevoProducto.nombre || "Sin nombre"}" indexado con éxito.`,
        );
        setNuevoProducto(initialProductState);
        setErrorMsg("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMsg(
          errorData.message || "ERROR: No se pudo crear el producto.",
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("ERROR: Fallo de conexión o del servidor.");
    } finally {
      setLoading(false);
    }
  };
  /* --- LÓGICA DE VARIANTES --- */
  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariantInput((prev) => ({ ...prev, [name]: value }));
  };
  const addVariant = () => {
    setNuevoProducto((prev) => {
      const variantToAdd = {
        ...variantInput,
        color: variantInput.color || "Unico",
        almacenamiento: variantInput.almacenamiento || "Unico",
        stock: Number(variantInput.stock),
        costoDeCompra: Number(variantInput.costoDeCompra),
        precioAlPublico: Number(variantInput.precioAlPublico),
        precioMayorista: Number(variantInput.precioMayorista),
        precioRevendedor: Number(variantInput.precioRevendedor),
      };
      const updatedVariantes = [...prev.variantes, variantToAdd];
      return { ...prev, variantes: updatedVariantes };
    });
    setVariantInput(initialVariantState);
  };
  const removeVariant = (index) => {
    setNuevoProducto((prev) => {
      const updatedVariantes = prev.variantes.filter((_, i) => i !== index);
      return { ...prev, variantes: updatedVariantes };
    });
  };
  /* --- ESTILOS SAAS --- */
  const inputStyle =
    "w-full bg-white border border-gray-200 rounded-xl p-2.5 px-4 text-gray-900 text-sm focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA] outline-none transition-all placeholder:text-gray-400";
  const labelStyle =
    "text-xs font-medium text-gray-700 mb-2 block";
  const sectionTitle =
    "text-sm font-semibold text-gray-900 mb-6 flex items-center";
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGuardarProducto();
        }}
        className="space-y-6"
      >
        {/* I. Identificación Técnica */}
        <div className={`bg-white border ${activeStep === 1 ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-gray-200 shadow-sm'} rounded-2xl overflow-hidden transition-all duration-300`}>
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className="w-full bg-slate-50 px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isStep1Complete() && activeStep !== 1 ? 'bg-green-500 text-white' : activeStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {isStep1Complete() && activeStep !== 1 ? <FiCheck /> : "1"}
              </div>
              <h3 className={`text-lg font-semibold ${activeStep === 1 ? 'text-blue-600' : 'text-gray-800'}`}>
                Identificación Principal
              </h3>
            </div>
            <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeStep === 1 ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${activeStep === 1 ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100">
              <div className="md:col-span-3">
                <label className={labelStyle}>Nombre del Producto</label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoProducto.nombre}
                  onChange={handleInputChange}
                  className={inputStyle}
                  placeholder="Ej: Vela Aromática Vainilla Francesa"
                  required
                />
              </div>
              <div>
                <label className={labelStyle}>Marca / Línea</label>
                <input
                  type="text"
                  name="marca"
                  value={nuevoProducto.marca}
                  onChange={handleInputChange}
                  className={inputStyle}
                  placeholder="Ej: Lu Home"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Categoría</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex gap-2">
                    <select
                      name="categoria"
                      value={nuevoProducto.categoria}
                      onChange={handleInputChange}
                      className={inputStyle}
                    >
                      <option value="">Seleccionar...</option>
                      {categorias.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryName}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleDeleteCategory}
                      disabled={isDeletingCategory || (!nuevoProducto.categoria && !deleteSuccess) || deleteSuccess}
                      className={`px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm ${deleteSuccess ? "bg-green-100 text-green-600 border border-green-200" : "bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"}`}
                      title="Eliminar categoría seleccionada"
                    >
                      {isDeletingCategory ? "..." : deleteSuccess ? <FiCheck size={18} /> : <FiTrash2 size={18} />}
                    </button>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      className={inputStyle}
                      placeholder="O crear nueva..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={isAddingCategory || !newCategoryInput.trim()}
                      className="px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      title="Añadir categoría"
                    >
                      {isAddingCategory ? "..." : <FiPlus size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end mt-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setActiveStep(2)}
                  className="bg-blue-600 text-white rounded-full px-6 py-2.5 hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  Siguiente Paso <FiCheck />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* II. Configuración de Variantes */}
        <div className={`bg-white border ${activeStep === 2 ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-gray-200 shadow-sm'} rounded-2xl overflow-hidden transition-all duration-300`}>
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className="w-full bg-slate-50 px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isStep2Complete() && activeStep !== 2 ? 'bg-green-500 text-white' : activeStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {isStep2Complete() && activeStep !== 2 ? <FiCheck /> : "2"}
              </div>
              <h3 className={`text-lg font-semibold ${activeStep === 2 ? 'text-blue-600' : 'text-gray-800'}`}>
                Variantes y Precios
              </h3>
            </div>
            <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeStep === 2 ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${activeStep === 2 ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 md:p-8 border-t border-gray-100">
              <div className="bg-slate-50 rounded-2xl p-6 border border-gray-200 mb-8 shadow-sm">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                  Añadir Nueva Variante
                </h4>
                <div className="space-y-6">
                  {/* Fila 1: Atributos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelStyle}>Color / Aspecto</label>
                      <div className={`${inputStyle} flex items-center gap-3 p-1.5`}>
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-200">
                          <input
                            type="color"
                            value={variantInput.color && variantInput.color.startsWith('#') ? variantInput.color : "#000000"}
                            onChange={(e) => setVariantInput((prev) => ({ ...prev, color: e.target.value }))}
                            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={variantInput.color || ""}
                          onChange={(e) => setVariantInput((prev) => ({ ...prev, color: e.target.value }))}
                          placeholder="Ej: Blanco, Hexadecimal"
                          className="flex-1 bg-transparent border-none focus:outline-none text-[13px] text-gray-900 placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelStyle}>Tamaño / Capacidad</label>
                      <input
                        type="text"
                        name="almacenamiento"
                        placeholder="Ej: 250ml / Grande"
                        value={variantInput.almacenamiento}
                        onChange={handleVariantChange}
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Aroma / Fragancia</label>
                      <input
                        type="text"
                        name="aroma"
                        placeholder="Ej: Lavanda y Miel"
                        value={variantInput.aroma || ""}
                        onChange={handleVariantChange}
                        className={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Fila 2: Inventario y Costos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                      <label className={labelStyle}>Stock Inicial</label>
                      <input
                        type="number"
                        name="stock"
                        placeholder="0"
                        value={variantInput.stock}
                        onChange={handleVariantChange}
                        onKeyDown={preventInvalidNumbers}
                        min="0"
                        className={inputStyle}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Costo de Producción/Compra</label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="costoDeCompra"
                          placeholder="0.00"
                          value={variantInput.costoDeCompra}
                          onChange={handleVariantChange}
                          onKeyDown={preventInvalidNumbers}
                          min="0"
                          className={`${inputStyle} pl-10`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fila 3: Precios de Venta */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={labelStyle}>Precio Público</label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="precioAlPublico"
                          placeholder="0.00"
                          value={variantInput.precioAlPublico}
                          onChange={handleVariantChange}
                          onKeyDown={preventInvalidNumbers}
                          min="0"
                          className={`${inputStyle} pl-10 border-blue-200 focus:ring-blue-500`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelStyle}>Precio Mayorista</label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="precioMayorista"
                          placeholder="0.00"
                          value={variantInput.precioMayorista}
                          onChange={handleVariantChange}
                          onKeyDown={preventInvalidNumbers}
                          min="0"
                          className={`${inputStyle} pl-10`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelStyle}>Precio Revendedor</label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          name="precioRevendedor"
                          placeholder="0.00"
                          value={variantInput.precioRevendedor}
                          onChange={handleVariantChange}
                          onKeyDown={preventInvalidNumbers}
                          min="0"
                          className={`${inputStyle} pl-10`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={addVariant}
                      className="w-full py-3.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <FiList size={18} /> Añadir Variante al Lote
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de Variantes Agregadas */}
              {nuevoProducto.variantes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                    Variantes en Lote ({nuevoProducto.variantes.length})
                  </h4>
                  <div className="space-y-3">
                    {nuevoProducto.variantes.map((v, i) => (
                      <div
                        key={i}
                        className="group flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all gap-4"
                      >
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm w-full">
                          <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                            <div
                              className="w-8 h-8 rounded-full border border-gray-200 shadow-inner flex-shrink-0"
                              style={{ backgroundColor: v.color }}
                            ></div>
                            <div>
                              <p className="font-bold text-gray-900 leading-tight">{v.color}</p>
                              <p className="text-xs text-gray-500">{v.almacenamiento}</p>
                              {v.aroma && <p className="text-xs text-blue-600 font-medium">{v.aroma}</p>}
                            </div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Stock</span>
                            <span className="font-semibold text-gray-800">{v.stock} uds</span>
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Costo</span>
                            <span className="font-semibold text-gray-800">${v.costoDeCompra}</span>
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Público</span>
                            <span className="font-bold text-green-600">${v.precioAlPublico}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="p-3 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white flex-shrink-0 self-end md:self-auto"
                          title="Eliminar variante"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setActiveStep(1)}
                  className="bg-white border border-gray-200 text-gray-700 rounded-full px-5 py-2 hover:bg-gray-50 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  Atrás
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveStep(3)}
                  className="bg-blue-600 text-white rounded-full px-6 py-2.5 hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  Siguiente Paso <FiCheck />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* III. Existencias y Detalles */}
        <div className={`bg-white border ${activeStep === 3 ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-gray-200 shadow-sm'} rounded-2xl overflow-hidden transition-all duration-300`}>
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className="w-full bg-slate-50 px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${activeStep > 3 ? 'bg-green-500 text-white' : activeStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {activeStep > 3 ? <FiCheck /> : "3"}
              </div>
              <h3 className={`text-lg font-semibold ${activeStep === 3 ? 'text-blue-600' : 'text-gray-800'}`}>
                Inventario, Detalles y Logística
              </h3>
            </div>
            <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeStep === 3 ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${activeStep === 3 ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 md:p-8 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <label className={labelStyle}>Unidades Totales</label>
                  <input
                    type="number"
                    value={nuevoProducto.variantes.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)}
                    readOnly
                    className={`${inputStyle} bg-slate-100 font-bold text-gray-900 border-dashed cursor-not-allowed`}
                  />
                  <span className="text-[10px] text-gray-500 font-medium block mt-1">
                    * Auto-calculado por variantes
                  </span>
                </div>
                <div>
                  <label className={labelStyle}>Alerta Stock Mínimo</label>
                  <input
                    type="number"
                    name="alerta"
                    value={nuevoProducto.alerta}
                    onChange={handleInputChange}
                    onKeyDown={preventInvalidNumbers}
                    min="0"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Descuento General (%)</label>
                  <input
                    type="number"
                    name="descuento"
                    placeholder="Ej: 10, 20"
                    value={nuevoProducto.descuento}
                    onChange={handleInputChange}
                    onKeyDown={preventInvalidNumbers}
                    min="0"
                    max="100"
                    className={inputStyle}
                  />
                </div>
                <div className="relative z-20">
                  <SearchableSelect
                    label="Proveedor / Origen"
                    options={proveedores}
                    value={nuevoProducto.proveedor}
                    onChange={(val) => setNuevoProducto({ ...nuevoProducto, proveedor: val })}
                    styles={{ label: labelStyle, input: inputStyle }}
                    placeholder="Buscar proveedor..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Fecha Act. Precio</label>
                      <div className="relative">
                        <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          name="fechaActualizacionPrecio"
                          value={nuevoProducto.fechaActualizacionPrecio}
                          onChange={handleInputChange}
                          className={`${inputStyle} pl-10 text-sm`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelStyle}>Fecha Últ. Ingreso</label>
                      <div className="relative">
                        <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          name="ultimaFechaCargoStock"
                          value={nuevoProducto.ultimaFechaCargoStock}
                          onChange={handleInputChange}
                          className={`${inputStyle} pl-10 text-sm`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Descripción del Producto</label>
                  <textarea
                    name="descripcion"
                    value={nuevoProducto.descripcion}
                    onChange={handleInputChange}
                    rows="4"
                    className={`${inputStyle} resize-none normal-case`}
                    placeholder="Escribe aquí los detalles del producto, notas aromáticas, recomendaciones de uso..."
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setActiveStep(2)}
                  className="bg-white border border-gray-200 text-gray-700 rounded-full px-5 py-2 hover:bg-gray-50 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  Atrás
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveStep(4)}
                  className="bg-blue-600 text-white rounded-full px-6 py-2.5 hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  Siguiente Paso <FiCheck />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* IV. Galería de Imágenes */}
        <div className={`bg-white border ${activeStep === 4 ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-gray-200 shadow-sm'} rounded-2xl overflow-hidden transition-all duration-300`}>
          <button
            type="button"
            onClick={() => setActiveStep(4)}
            className="w-full bg-slate-50 px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${nuevoProducto.imagenes.length > 0 ? 'bg-green-500 text-white' : activeStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {nuevoProducto.imagenes.length > 0 ? <FiCheck /> : "4"}
              </div>
              <h3 className={`text-lg font-semibold ${activeStep === 4 ? 'text-blue-600' : 'text-gray-800'}`}>
                Galería Multimedia
              </h3>
            </div>
            <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeStep === 4 ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${activeStep === 4 ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 md:p-8 border-t border-gray-100">
              <label className={labelStyle}>Archivos Fotográficos (Máx 10)</label>
              <div className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-12 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer relative group">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <FiRefreshCcw size={40} className="text-blue-600 animate-spin mb-4" />
                    <div className="w-32 h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                      Subiendo {uploadProgress}%
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <FiImage size={32} className="text-blue-500" />
                    </div>
                    <span className="text-base font-semibold text-gray-700 group-hover:text-blue-600">
                      Haz clic aquí para subir imágenes
                    </span>
                    <span className="text-xs text-gray-400 mt-2 font-medium">JPG, PNG, WEBP permitidos</span>
                  </>
                )}
                <IKContext
                  publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
                  urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
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
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                  />
                </IKContext>
                {fileError && (
                  <div className="absolute top-4 right-4 bg-red-100 border border-red-300 text-red-700 text-xs font-bold px-4 py-2 rounded-lg shadow-sm">
                    {fileError}
                  </div>
                )}
              </div>

              {nuevoProducto.imagenes.length > 0 && !loading && (
                <div className="mt-8">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Imágenes Subidas ({nuevoProducto.imagenes.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {nuevoProducto.imagenes.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square group rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white"
                      >
                        <img
                          src={url}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transform scale-75 group-hover:scale-100 transition-all shadow-lg"
                            title="Eliminar imagen"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-start items-center mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setActiveStep(3)}
                  className="bg-white border border-gray-200 text-gray-700 rounded-full px-5 py-2 hover:bg-gray-50 transition-all flex items-center gap-2 text-sm font-medium"
                >
                  Atrás
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de Error Global */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl text-sm font-medium shadow-sm">
            {errorMsg}
          </div>
        )}

        {/* Acciones Finales Flotantes / Fijadas */}
        <div className="sticky bottom-4 z-40 bg-white/80 backdrop-blur-md border border-gray-200 p-4 rounded-full shadow-lg flex justify-between items-center px-6 py-3">
          <button
            type="button"
            onClick={() => {
               setNuevoProducto(initialProductState);
               setActiveStep(1);
            }}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4 py-2 font-medium text-sm transition-all"
          >
            Limpiar Formulario
          </button>
          <button
            type="submit"
            disabled={loading || nuevoProducto.variantes.length === 0}
            className="px-8 py-3 bg-blue-600 text-white font-bold text-sm rounded-full hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <FiRefreshCcw className="animate-spin" /> Procesando...
              </div>
            ) : (
              <>
                <FiCheck className="group-hover:scale-125 transition-transform" size={18} /> 
                {nuevoProducto.variantes.length === 0 ? "Añade al menos 1 variante" : "Publicar Producto"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
/* --- COMPONENTE PRINCIPAL --- */
const CargaDeProductos = () => {
  const [activeTab, setActiveTab] = useState("carga");
  const getTabClasses = (tabName) =>
    `px-6 py-4 text-sm font-medium transition-all duration-300 flex items-center border-b-2 ${activeTab === tabName ? "text-[#0A58CA] border-[#0A58CA] bg-[#F8FAFC]" : "text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-50"}`;
  return (
    <div className="min-h-screen bg-[#F4F7FE] text-gray-900 p-4 md:p-12 font-['Inter'] selection:bg-[#0A58CA] selection:text-white max-w-7xl mx-auto">
      {" "}
      {/* Header Principal */}{" "}
      <header className="mb-10">
        {" "}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {" "}
          Gestión de Inventario{" "}
        </h1>{" "}
        <p className="font-medium text-xs text-gray-500 mt-2">
          Control y registro de productos
        </p>{" "}
      </header>{" "}
      {/* Navegación */}{" "}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto custom-scrollbar bg-white rounded-t-2xl px-2 pt-2">
        {" "}
        <button
          className={getTabClasses("carga")}
          onClick={() => setActiveTab("carga")}
        >
          {" "}
          <FiPlus className="mr-2" /> Carga Manual{" "}
        </button>{" "}
        <button
          className={getTabClasses("masiva")}
          onClick={() => setActiveTab("masiva")}
        >
          {" "}
          <FiLayers className="mr-2" /> Importación Masiva{" "}
        </button>{" "}
        <button
          className={getTabClasses("actualizar")}
          onClick={() => setActiveTab("actualizar")}
        >
          {" "}
          <FiPackage className="mr-2" /> Actualizar Stock{" "}
        </button>{" "}
        <button
          className={getTabClasses("devolucion")}
          onClick={() => setActiveTab("devolucion")}
        >
          {" "}
          <FiRefreshCcw className="mr-2" /> Devoluciones{" "}
        </button>{" "}
      </div>{" "}
      {/* Contenido */}{" "}
      <div className="transition-opacity duration-500">
        {" "}
        {activeTab === "carga" && <CargaDeProductosContent />}{" "}
        {activeTab === "masiva" && <IngresoMercaderia />}{" "}
        {activeTab === "actualizar" && <ActualizarStock />}{" "}
        {activeTab === "devolucion" && <ProductReturnTracker />}{" "}
        {activeTab === "historial" && <HistorialDevoluciones />}{" "}
      </div>{" "}
    </div>
  );
};
export default CargaDeProductos;
