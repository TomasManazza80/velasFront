import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage,
  FiSearch,
  FiAlertTriangle,
  FiEdit2,
  FiTrash2,
  FiX,
  FiInfo,
  FiSave,
  FiLoader,
  FiPlus,
} from "react-icons/fi";
import Swal from "sweetalert2";
import ProductInfoModal from "../ProductInfoModal";

/* --- CONFIGURACIÓN DE ESTILOS SAAS --- */
const styles = {
  label: "text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block",
  input: "w-full bg-white border border-gray-200 rounded-lg p-2 text-gray-900 text-[11px] font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 placeholder:text-gray-400",
  title: "text-lg md:text-xl font-bold text-gray-900",
  techValue: "font-semibold text-gray-900 text-xs",
  btnPrimary: "bg-blue-600 text-white text-[11px] font-medium rounded-full px-4 py-2 hover:bg-blue-700 transition-all flex items-center justify-center gap-2",
  btnSecondary: "bg-white border border-gray-200 text-gray-700 text-[11px] font-medium rounded-full px-4 py-2 hover:bg-gray-50 transition-all flex items-center justify-center gap-2",
  glassCard: "bg-white border border-gray-200 rounded-xl shadow-sm",
};

/* --- CREDENCIALES CLOUDINARY --- */
const CLOUD_NAME = "dxvkqumpu";
const UPLOAD_PRESET = "ecommerce";

/* --- UTILIDAD: OPTIMIZACIÓN DE IMÁGENES --- */
const optimizeImage = (url, width = 800) => {
  if (!url) return "";
  if (url.includes("ik.imagekit.io")) {
    return `${url}?tr=w-${width},f-webp,q-80`;
  } else if (url.includes("res.cloudinary.com")) {
    const parts = url.split("/upload/");
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},f_webp,q_auto/${parts[1]}`;
    }
  }
  return url;
};

/* --- COMPONENTE: FORMULARIO DE EDICIÓN --- */
const FormularioEditarModal = ({
  producto,
  onClose,
  onSave,
  proveedores,
  categorias,
}) => {
  const [editado, setEditado] = useState({
    ...producto,
    variantes: producto.variantes || [],
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [fileError, setFileError] = useState("");
  const [stockToAdd, setStockToAdd] = useState({});

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditado((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariantInput((prev) => ({ ...prev, [name]: value }));
  };

  const addVariant = () => {
    if (!variantInput.stock || !variantInput.color)
      return alert("Color y Stock son requeridos.");
    setEditado((prev) => ({
      ...prev,
      variantes: [
        ...prev.variantes,
        { ...variantInput, stock: Number(variantInput.stock) },
      ],
    }));
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
    setEditado((prev) => ({
      ...prev,
      variantes: prev.variantes.filter((_, i) => i !== idx),
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setEditado((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleExistingVariantChange = (index, field, value) => {
    const newVariantes = [...editado.variantes];
    newVariantes[index] = { ...newVariantes[index], [field]: value };
    setEditado((prev) => ({ ...prev, variantes: newVariantes }));
  };

  const handleStockToAddChange = (index, value) => {
    setStockToAdd((prev) => ({ ...prev, [index]: value }));
  };

  const handleAddStock = (index) => {
    const amount = Number(stockToAdd[index]) || 0;
    if (amount !== 0) {
      const currentStock = Number(editado.variantes[index].stock) || 0;
      handleExistingVariantChange(index, "stock", currentStock + amount);
      setStockToAdd((prev) => ({ ...prev, [index]: "" }));
    }
  };

  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files);
    setFileError("");
    if (files.length === 0) return;
    const invalidFiles = files.filter((file) => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      setFileError(
        `NO VÁLIDO: Se detectaron ${invalidFiles.length} archivos que no son imágenes.`,
      );
      return;
    }
    const uploadedUrls = [];
    try {
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: data },
        );
        if (response.ok) {
          const fileData = await response.json();
          uploadedUrls.push(fileData.secure_url);
        }
      }
      setEditado((prev) => ({
        ...prev,
        imagenes: [...(prev.imagenes || []), ...uploadedUrls].slice(0, 10),
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Error al subir imágenes a la nube.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...editado,
      fechaActualizacionPrecio: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-gray-900/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white border border-gray-200 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FiEdit2 className="text-blue-600" size={16} /> Editar Producto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <FiX size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <section>
            <label className={styles.label}>
              Archivos Media (Cloud) ({editado.imagenes?.length || 0}/10)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {editado.imagenes?.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square bg-gray-50 border border-gray-200 group overflow-hidden rounded-lg"
                >
                  <img
                    src={optimizeImage(img, 400)}
                    loading="lazy"
                    alt="preview"
                    className="w-full h-full object-cover transition-opacity"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
              {(!editado.imagenes || editado.imagenes.length < 10) && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all text-gray-400 hover:text-blue-600">
                  <FiPlus size={16} />
                  <input
                    type="file"
                    multiple
                    onChange={handleAddImages}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              )}
            </div>
            {fileError && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium p-2 rounded-lg">
                {fileError}
              </div>
            )}
          </section>

          <div>
            <label className={styles.label}>Nombre del Producto / Dispositivo</label>
            <input
              name="nombre"
              value={editado.nombre}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-4 md:col-span-1">
              <div>
                <label className={styles.label}>Marca</label>
                <input
                  name="marca"
                  value={editado.marca}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div>
                <label className={styles.label}>Categoría</label>
                <select
                  name="categoria"
                  value={editado.categoria}
                  onChange={handleChange}
                  className={styles.input}
                  required
                >
                  <option value="" className="text-gray-500">
                    SELECCIONAR...
                  </option>
                  {categorias?.map((c) => (
                    <option key={c.categoryId} value={c.categoryName}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.label}>Proveedor</label>
                <select
                  name="proveedor"
                  value={editado.proveedor}
                  onChange={handleChange}
                  className={styles.input}
                >
                  <option value="" className="text-gray-500">
                    SELECCIONAR...
                  </option>
                  {proveedores?.map((p) => (
                    <option key={p.id} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* VARIANTES SECTION */}
            <div className="md:col-span-2 bg-gray-50 p-4 lg:p-5 border border-gray-200 rounded-xl">
              <label className={styles.label}>Administrador de Variantes</label>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-5">
                <div className="relative">
                  <div
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-gray-900 text-[11px] font-medium flex items-center justify-between cursor-pointer outline-none focus:border-blue-500"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: variantInput.color || "transparent" }}
                      ></div>
                      <span className="truncate">{variantInput.color || "COLOR"}</span>
                    </div>
                  </div>
                  {showColorPicker && (
                    <div className="absolute top-full z-50 bg-white border border-gray-200 shadow-sm rounded-lg p-2 grid grid-cols-4 gap-2 mt-1">
                      {PREDEFINED_COLORS.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setVariantInput((p) => ({ ...p, color: c.code }));
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: c.code }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <input
                  name="almacenamiento"
                  placeholder="CAPACIDAD"
                  value={variantInput.almacenamiento}
                  onChange={handleVariantChange}
                  className={styles.input}
                />
                <input
                  name="stock"
                  type="number"
                  placeholder="STOCK"
                  value={variantInput.stock}
                  onChange={handleVariantChange}
                  className={styles.input}
                />
                <input
                  name="precioAlPublico"
                  type="number"
                  placeholder="$ PÚBLICO"
                  value={variantInput.precioAlPublico}
                  onChange={handleVariantChange}
                  className={styles.input}
                />
                <input
                  name="precioMayorista"
                  type="number"
                  placeholder="$ MAYORISTA"
                  value={variantInput.precioMayorista}
                  onChange={handleVariantChange}
                  className={styles.input}
                />
                <input
                  name="precioRevendedor"
                  type="number"
                  placeholder="$ REVENDEDOR"
                  value={variantInput.precioRevendedor}
                  onChange={handleVariantChange}
                  className={styles.input}
                />
                <input
                  name="costoDeCompra"
                  type="number"
                  placeholder="$ COSTO"
                  value={variantInput.costoDeCompra}
                  onChange={handleVariantChange}
                  className={styles.input}
                />
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="w-full bg-white border border-gray-200 text-gray-700 font-medium text-[11px] rounded-full px-3 py-2 hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 mb-5"
              >
                <FiPlus size={14} /> Agregar Variante
              </button>
              <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {editado.variantes?.map((v, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block border border-gray-200 shadow-sm"
                          style={{ backgroundColor: v.color }}
                        ></span>
                        <span className="font-semibold text-gray-900 text-[11px]">
                          {v.color} - {v.almacenamiento}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-red-50 flex items-center justify-center"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">STOCK</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => handleExistingVariantChange(i, "stock", e.target.value)}
                          className={styles.input}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">PÚBLICO</label>
                        <input
                          type="number"
                          value={v.precioAlPublico}
                          onChange={(e) => handleExistingVariantChange(i, "precioAlPublico", e.target.value)}
                          className={styles.input}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">MAYORISTA</label>
                        <input
                          type="number"
                          value={v.precioMayorista}
                          onChange={(e) => handleExistingVariantChange(i, "precioMayorista", e.target.value)}
                          className={styles.input}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">REVENDE</label>
                        <input
                          type="number"
                          value={v.precioRevendedor}
                          onChange={(e) => handleExistingVariantChange(i, "precioRevendedor", e.target.value)}
                          className={styles.input}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">COSTO</label>
                        <input
                          type="number"
                          value={v.costoDeCompra}
                          onChange={(e) => handleExistingVariantChange(i, "costoDeCompra", e.target.value)}
                          className={styles.input}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 pt-3 border-t border-gray-100">
                      <input
                        type="number"
                        placeholder="Cargar stock..."
                        value={stockToAdd[i] || ""}
                        onChange={(e) => handleStockToAddChange(i, e.target.value)}
                        className={styles.input}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddStock(i)}
                        className={styles.btnSecondary}
                      >
                        AGREGAR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={styles.label}>Stock Total</label>
              <input
                value={
                  editado.variantes?.reduce((acc, v) => acc + (Number(v.stock) || 0), 0) || 0
                }
                readOnly
                className={`${styles.input} bg-gray-50 text-gray-500`}
              />
            </div>
            <div>
              <label className={styles.label}>Alerta de Stock</label>
              <input
                name="alerta"
                type="number"
                value={editado.alerta}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Descuento (%)</label>
              <input
                name="descuento"
                type="number"
                min="0"
                max="100"
                placeholder="ej: 10, 20"
                value={editado.descuento || 0}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div>
            <label className={styles.label}>Specs</label>
            <textarea
              name="descripcion"
              value={editado.descripcion}
              onChange={handleChange}
              rows="3"
              className={`${styles.input} resize-none`}
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 ${styles.btnSecondary}`}
            >
              Descartar Cambios
            </button>
            <button
              type="submit"
              className={`flex-1 ${styles.btnPrimary}`}
            >
              <FiSave size={16} /> Sincronizar Cambios
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* --- COMPONENTE PRINCIPAL --- */
const InventarioProductos = () => {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productoAEditar, setProductoAEditar] = useState(null);

  const handleEliminarProducto = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: "¿ELIMINAR PRODUCTO?",
        text: "Se borrará de forma permanente del sistema.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2563EB",
        cancelButtonColor: "#ffffff",
        confirmButtonText: "SÍ, ELIMINAR",
        cancelButtonText: "<span style='color:black'>CANCELAR</span>",
        background: "#ffffff",
        color: "#111827",
      });
      if (!confirm.isConfirmed) return;
      
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/products/${id}`,
      );
      
      if (response.status === 204) {
        setProductos(productos.filter((p) => p.id !== id));
        Swal.fire({
          title: "ÉXITO",
          text: "Producto eliminado correctamente.",
          icon: "success",
          background: "#ffffff",
          color: "#111827",
          confirmButtonColor: "#2563EB",
        });
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
      if (
        err.response?.data?.code === "REQUIRE_ADMIN_PASS" ||
        err.response?.status === 403
      ) {
        const { value: pass } = await Swal.fire({
          title: "SEGURIDAD: STOCK DETECTADO",
          text: "Este producto tiene unidades disponibles. Ingrese contraseña maestra para forzar eliminación:",
          input: "password",
          inputPlaceholder: "Password...",
          showCancelButton: true,
          background: "#ffffff",
          color: "#111827",
          confirmButtonColor: "#2563EB",
          cancelButtonColor: "#ffffff",
          cancelButtonText: "<span style='color:black'>CANCELAR</span>",
        });
        if (pass) {
          try {
            await axios.delete(
              `${import.meta.env.VITE_API_URL}/products/${id}`,
              { data: { adminPassword: pass } },
            );
            setProductos(productos.filter((p) => p.id !== id));
            Swal.fire({
              title: "BORRADO FORZADO",
              icon: "success",
              background: "#ffffff",
              color: "#111827",
              confirmButtonColor: "#2563EB",
            });
          } catch (e) {
            Swal.fire({
              title: "ERROR",
              text: "Contraseña incorrecta o fallo de sistema.",
              icon: "error",
              background: "#ffffff",
              color: "#111827",
              confirmButtonColor: "#2563EB",
            });
          }
        }
      } else {
        Swal.fire({
          title: "ERROR",
          text: "No se pudo eliminar el item.",
          icon: "error",
          background: "#ffffff",
          color: "#111827",
          confirmButtonColor: "#2563EB",
        });
      }
    }
  };

  const obtenerProductos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/products`,
      );
      setProductos(response.data);
      setError(null);
    } catch (err) {
      setError("ERROR DE CONEXIÓN");
    } finally {
      setLoading(false);
    }
  };

  const obtenerProveedores = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/providers`);
      setProveedores(res.data);
    } catch (err) {
      console.error("Error al cargar proveedores", err);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/categories`,
      );
      setCategorias(res.data);
    } catch (err) {
      console.error("Error al cargar categorías", err);
    }
  };

  useEffect(() => {
    obtenerProductos();
    obtenerProveedores();
    obtenerCategorias();
  }, []);

  const handleGuardarEdicion = async (datos) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/products/${datos.id}`,
        datos,
      );
      setProductos(productos.map((p) => (p.id === datos.id ? datos : p)));
      setProductoAEditar(null);
      if (selectedProduct) setSelectedProduct(datos);
    } catch (err) {
      alert("FALLO EN ACTUALIZACIÓN");
    }
  };

  const productosFiltrados = useMemo(() => {
    const searchTerms = busqueda
      .toLowerCase()
      .split(" ")
      .filter((term) => term.trim() !== "");
    if (searchTerms.length === 0) {
      return productos;
    }
    return productos.filter((p) => {
      const productText = [p.nombre, p.marca, p.categoria]
        .join(" ")
        .toLowerCase();
      return searchTerms.every((term) => productText.includes(term));
    });
  }, [productos, busqueda]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA]">
        <FiLoader className="animate-spin text-blue-600 mb-4" size={24} />
        <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">
          Sincronizando...
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 p-4 md:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER CONTROL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Inventario de Productos
            </h2>
            <p className="text-[11px] font-medium text-gray-500 mt-1">
              {productos.length} productos registrados
            </p>
          </div>
          <div className="relative w-full md:w-80 group">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-gray-900 text-[11px] font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm placeholder:text-gray-400"
              placeholder="Buscar por nombre, marca..."
            />
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
              size={14}
            />
          </div>
        </div>

        {/* GRID */}
        <div className={styles.glassCard}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Imagen</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">Precios</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-center">Stock</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-center">Últ. Act.</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {productosFiltrados.map((producto) => {
                  const totalStock = producto.variantes?.reduce((acc, v) => acc + (Number(v.stock) || 0), 0) || producto.cantidad || 0;
                  const precioPublico = producto.variantes?.[0]?.precioAlPublico || producto.precioVenta || 0;
                  const costoCompra = producto.variantes?.[0]?.costoDeCompra || producto.precioCompra || 0;

                  return (
                    <tr
                      key={producto.id}
                      onClick={() => setSelectedProduct(producto)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors group"
                      title="Clic para ver detalles"
                    >
                      <td className="px-4 py-3 align-middle">
                        <div className="w-10 h-10 bg-white flex items-center justify-center overflow-hidden rounded-lg border border-gray-200">
                          {producto.imagenes?.length > 0 ? (
                            <img
                              src={optimizeImage(producto.imagenes[0], 100)}
                              loading="lazy"
                              alt={producto.nombre}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <FiPackage className="text-gray-400" size={16} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                            {producto.marca}
                          </span>
                          {Number(producto.descuento) > 0 && (
                            <span className="bg-blue-100 text-blue-700 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                              -{producto.descuento}%
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs text-gray-900 leading-tight">
                          {producto.nombre}
                        </h4>
                        <span className="text-[10px] font-medium text-gray-500 block mt-0.5">
                          {producto.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right align-middle">
                        <div className="text-[10px] font-medium text-gray-500 mb-0.5">
                          Costo: <span className="text-gray-900">${Number(costoCompra).toLocaleString()}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-900">
                          PVP: <span className="text-blue-600">${Number(precioPublico).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        <div
                          className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                            totalStock <= producto.alerta
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {totalStock}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-medium text-gray-700 align-middle">
                        {producto.proveedor || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-medium text-gray-500 align-middle text-center">
                        {new Date(producto.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        <div className="flex justify-center items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedProduct(producto)}
                            className="p-1.5 bg-white text-gray-500 border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-full transition-all shadow-sm flex items-center justify-center"
                            title="Ver Detalles"
                          >
                            <FiInfo size={14} />
                          </button>
                          <button
                            onClick={() => setProductoAEditar(producto)}
                            className="p-1.5 bg-white text-gray-500 border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-full transition-all shadow-sm flex items-center justify-center"
                            title="Editar"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleEliminarProducto(producto.id)}
                            className="p-1.5 bg-white text-gray-500 border border-gray-200 hover:border-red-500 hover:text-red-600 rounded-full transition-all shadow-sm flex items-center justify-center"
                            title="Eliminar"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {selectedProduct && (
            <ProductInfoModal
              productData={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}
          {productoAEditar && (
            <FormularioEditarModal
              producto={productoAEditar}
              proveedores={proveedores}
              categorias={categorias}
              onClose={() => setProductoAEditar(null)}
              onSave={handleGuardarEdicion}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InventarioProductos;
