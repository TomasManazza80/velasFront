import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
  FiHeart,
  FiPackage,
  FiTrendingUp,
  FiStar,
  FiSearch,
  FiSave,
  FiMenu,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiEye,
  FiEyeOff,
  FiUploadCloud,
  FiTag,
  FiZap,
  FiGift,
} from "react-icons/fi";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

// Helper para ImageKit Auth
const authenticator = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/imagekit`);
    if (!response.ok) {
      throw new Error(`Auth failed with status ${response.status}`);
    }
    const data = await response.json();
    return { signature: data.signature, expire: data.expire, token: data.token };
  } catch (error) {
    console.error("Error autenticando ImageKit:", error);
    throw error;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace("ARS", "$");
};

const LikesControl = () => {
  const [activeTab, setActiveTab] = useState("combos"); // "combos" | "popularity"

  // --- ESTADO PARA CONTROL DE POPULARIDAD (PRODUCTOS) ---
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSavingReorder, setIsSavingReorder] = useState(false);

  // --- ESTADO PARA GESTIÓN DE COMBOS ---
  const [combos, setCombos] = useState([]);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [showComboModal, setShowComboModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [catalogQuantity, setCatalogQuantity] = useState(1);
  const [catalogProduct, setCatalogProduct] = useState("");


  // Formulario Combo
  const [comboForm, setComboForm] = useState({
    nombre: "",
    subtitulo: "",
    descripcion: "",
    imagen: "",
    precio: "",
    precioOriginal: "",
    descuento: 0,
    badge: "OFERTA ESPECIAL",
    productosIncluidosText: "",
    productId: "",
    activo: true,
    orden: 0,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  // 1. Cargar datos de Productos Popularidad
  const fetchProductsByLikes = async () => {
    try {
      setLoadingProducts(true);
      const { data } = await axios.get(`${API_URL}/products?limit=1000`);
      const allProducts = data.products || data || [];
      setProducts(allProducts);
      setOriginalProducts(JSON.parse(JSON.stringify(allProducts)));
    } catch (error) {
      console.error("Error fetching likes data:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // 2. Cargar datos de Combos
  const fetchCombos = async () => {
    try {
      setLoadingCombos(true);
      const { data } = await axios.get(`${API_URL}/api/combos`);
      setCombos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching combos data:", error);
    } finally {
      setLoadingCombos(false);
    }
  };

  useEffect(() => {
    fetchProductsByLikes();
    fetchCombos();
  }, []);

  // --- LOGICA DE POPULARIDAD PRODUCTOS ---
  const handleLocalUpdate = async (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    try {
      await axios.put(`${API_URL}/products/${id}`, { [field]: value });
      setOriginalProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
    } catch (error) {
      console.error("Error updating product:", error);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: "Ocurrió un error al actualizar la popularidad. Reintentando...",
      });
      fetchProductsByLikes();
    }
  };

  const handleReorder = async (newOrder) => {
    if (searchTerm.trim().length > 0) return;
    const updated = newOrder.map((item, index) => ({
      ...item,
      customOrder: index + 1,
    }));
    setProducts(updated);

    const changedProducts = updated.filter((p) => {
      const orig = originalProducts.find((o) => o.id === p.id);
      return !orig || orig.customOrder !== p.customOrder;
    });

    if (changedProducts.length > 0) {
      setIsSavingReorder(true);
      try {
        for (const p of changedProducts) {
          await axios.put(`${API_URL}/products/${p.id}`, {
            customOrder: p.customOrder,
          });
        }
        setOriginalProducts(JSON.parse(JSON.stringify(updated)));
      } catch (error) {
        console.error("Error saving reorder changes:", error);
        Swal.fire({ icon: "error", title: "Error al guardar orden" });
        fetchProductsByLikes();
      } finally {
        setIsSavingReorder(false);
      }
    }
  };

  // --- LOGICA DE COMBOS ---
  const handleOpenComboModal = (combo = null) => {
    if (combo) {
      setEditingCombo(combo);
      const itemsText = Array.isArray(combo.productosIncluidos)
        ? combo.productosIncluidos.join("\n")
        : combo.productosIncluidos || "";

      setComboForm({
        nombre: combo.nombre || "",
        subtitulo: combo.subtitulo || "",
        descripcion: combo.descripcion || "",
        imagen: combo.imagen || "",
        precio: combo.precio || "",
        precioOriginal: combo.precioOriginal || "",
        descuento: combo.descuento || 0,
        badge: combo.badge || "OFERTA ESPECIAL",
        productosIncluidosText: itemsText,
        productId: combo.productId || "",
        activo: combo.activo !== undefined ? combo.activo : true,
        orden: combo.orden || 0,
      });
    } else {
      setEditingCombo(null);
      setComboForm({
        nombre: "",
        subtitulo: "",
        descripcion: "",
        imagen: "",
        precio: "",
        precioOriginal: "",
        descuento: 0,
        badge: "PROMO MES",
        productosIncluidosText: "",
        productId: "",
        activo: true,
        orden: combos.length + 1,
      });
    }
    setCatalogProduct("");
    setCatalogQuantity(1);
    setShowComboModal(true);
  };

  const handleAddProductFromCatalog = () => {
    if (!catalogProduct) return;
    const qty = parseInt(catalogQuantity) || 1;
    const formattedLine = `${qty}x ${catalogProduct}`;
    const currentText = comboForm.productosIncluidosText || "";
    const updatedText = currentText.trim().length > 0
      ? `${currentText.trim()}\n${formattedLine}`
      : formattedLine;

    setComboForm((prev) => ({
      ...prev,
      productosIncluidosText: updatedText,
    }));
    setCatalogProduct("");
    setCatalogQuantity(1);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const authParams = await authenticator();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("publicKey", import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("signature", authParams.signature);
      formData.append("expire", authParams.expire);
      formData.append("token", authParams.token);
      formData.append("folder", "/combos");
      formData.append("fileName", `combo_${Date.now()}`);

      const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Subida a ImageKit fallida");
      const ikFile = await res.json();

      setComboForm((prev) => ({ ...prev, imagen: ikFile.url }));
      Swal.fire({
        icon: "success",
        title: "Imagen cargada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      Swal.fire({
        icon: "error",
        title: "Error al subir imagen",
        text: "Revisá las credenciales de ImageKit o intentá ingresar una URL manual.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCombo = async (e) => {
    e.preventDefault();
    if (!comboForm.nombre.trim() || !comboForm.precio) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Ingresá al menos el nombre y el precio del combo.",
      });
      return;
    }

    const itemsArray = comboForm.productosIncluidosText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    // Cálculo automático de porcentaje de descuento si hay precioOriginal > precio
    const pCurrent = parseFloat(comboForm.precio) || 0;
    const pOriginal = parseFloat(comboForm.precioOriginal) || 0;
    let computedDiscount = comboForm.descuento;
    if (pOriginal > pCurrent && pOriginal > 0) {
      computedDiscount = Math.round(((pOriginal - pCurrent) / pOriginal) * 100);
    }

    const payload = {
      nombre: comboForm.nombre,
      subtitulo: comboForm.subtitulo,
      descripcion: comboForm.descripcion,
      imagen: comboForm.imagen,
      precio: pCurrent,
      precioOriginal: pOriginal,
      descuento: computedDiscount,
      badge: comboForm.badge,
      productosIncluidos: itemsArray,
      productId: comboForm.productId ? parseInt(comboForm.productId) : null,
      activo: comboForm.activo,
      orden: parseInt(comboForm.orden) || 0,
    };

    try {
      if (editingCombo) {
        await axios.put(`${API_URL}/api/combos/${editingCombo.id}`, payload);
        Swal.fire({ icon: "success", title: "Combo actualizado", timer: 1500, showConfirmButton: false });
      } else {
        await axios.post(`${API_URL}/api/combos`, payload);
        Swal.fire({ icon: "success", title: "Combo creado con éxito", timer: 1500, showConfirmButton: false });
      }
      setShowComboModal(false);
      fetchCombos();
    } catch (error) {
      console.error("Error guardando combo:", error);
      Swal.fire({ icon: "error", title: "Error al guardar combo", text: error.response?.data?.message || error.message });
    }
  };

  const handleToggleComboActive = async (combo) => {
    const updatedStatus = !combo.activo;
    setCombos((prev) => prev.map((c) => (c.id === combo.id ? { ...c, activo: updatedStatus } : c)));

    try {
      await axios.put(`${API_URL}/api/combos/${combo.id}`, { activo: updatedStatus });
    } catch (error) {
      console.error("Error al cambiar estado de combo:", error);
      fetchCombos();
    }
  };

  const handleDeleteCombo = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar Combo?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/combos/${id}`);
        Swal.fire({ icon: "success", title: "Combo eliminado", timer: 1500, showConfirmButton: false });
        fetchCombos();
      } catch (error) {
        console.error("Error deleting combo:", error);
        Swal.fire({ icon: "error", title: "Error al eliminar" });
      }
    }
  };

  const isSearching = searchTerm.trim().length > 0;
  const filteredProducts = isSearching
    ? products.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : products;

  const renderRow = (product) => {
    const RowComponent = isSearching ? "tr" : Reorder.Item;

    return (
      <RowComponent
        key={product.id}
        value={product}
        as="tr"
        className={`bg-white transition-colors group ${!isSearching ? "cursor-grab active:cursor-grabbing hover:bg-gray-50" : "hover:bg-[#FAFAFA]"
          }`}
      >
        <td className="w-12 px-4 py-4 text-center">
          {!isSearching && (
            <FiMenu className="text-gray-300 group-hover:text-gray-500 mx-auto w-4 h-4 transition-colors" />
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
              <img
                src={product.imagenes?.[0] || product.image || "https://via.placeholder.com/150"}
                alt=""
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
            <span className="text-sm font-medium text-gray-900 pointer-events-none">
              {product.nombre}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider pointer-events-none">
          {product.categoria}
        </td>
        <td className="px-6 py-4" onPointerDown={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() =>
                  handleLocalUpdate(
                    product.id,
                    "tendenciaStars",
                    product.tendenciaStars === star ? 0 : star
                  )
                }
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${(product.tendenciaStars || 0) >= star
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-blue-500"
                  }`}
              >
                <FiStar className={`w-4 h-4 ${(product.tendenciaStars || 0) >= star ? "fill-current" : ""}`} />
              </button>
            ))}
          </div>
        </td>
        <td className="px-6 py-4" onPointerDown={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center">
            <input
              type="number"
              value={product.customOrder || 0}
              onChange={(e) =>
                handleLocalUpdate(product.id, "customOrder", parseInt(e.target.value) || 0)
              }
              className="w-20 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            />
          </div>
        </td>
        <td className="px-6 py-4 text-center pointer-events-none">
          <span className={`text-sm font-medium ${product.likes > 0 ? "text-blue-600" : "text-gray-500"}`}>
            {product.likes || 0}
          </span>
        </td>
      </RowComponent>
    );
  };

  return (
    <div className="space-y-8 p-6 md:p-8 bg-[#FAFAFA] min-h-screen">

      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FiZap className="text-blue-600 w-6 h-6" /> Combos y Promociones Destacadas
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Administrá los combos visibles en el inicio de la tienda y la popularidad del catálogo de productos.
          </p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex items-center bg-gray-200 p-1.5 rounded-full self-start md:self-auto">
          <button
            onClick={() => setActiveTab("combos")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === "combos"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <FiZap className="w-4 h-4" /> Combos & Promos ({combos.length})
          </button>
          <button
            onClick={() => setActiveTab("popularity")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === "popularity"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <FiHeart className="w-4 h-4" /> Popularidad Productos ({products.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑA 1: GESTIÓN DE COMBOS & PROMOCIONES               */}
      {/* ========================================================= */}
      {activeTab === "combos" && (
        <div className="space-y-6">

          {/* Barra Superior con Botón Crear Combo */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiTag className="text-blue-600" /> Promociones Activas para el Inicio
              </h3>
              <p className="text-xs text-gray-500">
                Los combos creados aparecerán destacados en la portada principal antes del catálogo.
              </p>
            </div>

            <button
              onClick={() => handleOpenComboModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-full flex items-center gap-2 shadow-md transition-all self-stretch sm:self-auto justify-center"
            >
              <FiPlus className="w-4 h-4 stroke-[3]" /> Crear Nuevo Combo
            </button>
          </div>

          {/* Estado de Carga Combos */}
          {loadingCombos ? (
            <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : combos.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                <FiGift />
              </div>
              <h4 className="text-lg font-bold text-gray-800">No tenés combos cargados</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Creá tu primer combo para promocionarlo en el inicio de la web y aumentar tus ventas rápidamente.
              </p>
              <button
                onClick={() => handleOpenComboModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-sm"
              >
                <FiPlus className="w-4 h-4 stroke-[3]" /> Crear Primer Combo
              </button>
            </div>
          ) : (
            /* Grid de Tarjetas de Combos Admin */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combos.map((combo) => {
                const currentPrice = Number(combo.precio) || 0;
                const origPrice = Number(combo.precioOriginal) || 0;
                const itemsList = Array.isArray(combo.productosIncluidos)
                  ? combo.productosIncluidos
                  : typeof combo.productosIncluidos === "string"
                    ? combo.productosIncluidos.split("\n").filter(Boolean)
                    : [];

                return (
                  <motion.div
                    key={combo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-white border rounded-2xl p-6 flex flex-col justify-between relative shadow-sm transition-all ${combo.activo ? "border-gray-200 hover:border-blue-300" : "border-gray-200 bg-gray-50/70 opacity-75"
                      }`}
                  >
                    <div>
                      {/* Badge y Estado Activo */}
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                          {combo.badge || "PROMO"}
                        </span>

                        <button
                          onClick={() => handleToggleComboActive(combo)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${combo.activo
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-200 text-gray-600"
                            }`}
                        >
                          {combo.activo ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                          {combo.activo ? "Visible en Inicio" : "Oculto"}
                        </button>
                      </div>

                      {/* Imagen + Título */}
                      <div className="flex gap-4 items-start mb-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                          <img
                            src={combo.imagen || "https://via.placeholder.com/150"}
                            alt={combo.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-gray-900 truncate">{combo.nombre}</h4>
                          {combo.subtitulo && (
                            <p className="text-xs text-gray-500 italic mt-0.5 line-clamp-2">{combo.subtitulo}</p>
                          )}
                        </div>
                      </div>

                      {/* Productos Incluidos */}
                      {itemsList.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                            <FiGift className="text-blue-600" /> Incluye:
                          </p>
                          {itemsList.slice(0, 3).map((item, idx) => (
                            <p key={idx} className="text-xs text-gray-700 font-medium truncate flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                              {item}
                            </p>
                          ))}
                          {itemsList.length > 3 && (
                            <p className="text-[10px] text-gray-400 italic pt-0.5">
                              + {itemsList.length - 3} producto(s) más
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Precios y Botones de Acción */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-2">
                      <div>
                        {origPrice > currentPrice && (
                          <span className="text-xs text-gray-400 line-through font-medium block">
                            {formatPrice(origPrice)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-gray-900">{formatPrice(currentPrice)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenComboModal(combo)}
                          className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-full transition-all"
                          title="Editar Combo"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCombo(combo.id)}
                          className="p-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-full transition-all"
                          title="Eliminar Combo"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 2: CONTROL DE POPULARIDAD DE PRODUCTOS           */}
      {/* ========================================================= */}
      {activeTab === "popularity" && (
        <div className="space-y-8">

          {/* Encabezado Pestaña Popularidad */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiHeart className="text-blue-600" /> Ranking de Popularidad y Tendencia
              </h3>
              <p className="text-xs text-gray-500">
                Ajustá las estrellas de tendencia o arrastrá para cambiar el orden de los productos en la tienda.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full px-4 py-2 shadow-sm flex items-center gap-2">
                Total Productos: <span className="text-blue-600 font-bold">{products.length}</span>
              </div>

              {isSavingReorder && (
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-full border border-blue-200 shadow-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Guardando cambios...
                </div>
              )}
            </div>
          </div>

          {/* Tarjetas Top 6 */}
          {loadingProducts ? (
            <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-sm"
                >
                  <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-sm">
                    #{index + 1}
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                      <img
                        src={product.imagenes?.[0] || product.image || "https://via.placeholder.com/150"}
                        alt={product.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{product.nombre}</h3>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
                        {product.categoria || "Sin Categoría"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                    <div className="flex items-center gap-2">
                      <FiHeart className={`w-5 h-5 ${product.likes > 0 ? "text-blue-600" : "text-gray-400"}`} />
                      <span className="text-lg font-bold text-gray-900">{product.likes || 0}</span>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                        Likes
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <FiPackage className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {product.variantes?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0} Stk
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-gray-100 mt-2 rounded-full overflow-hidden border border-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, ((product.likes || 0) / (products[0]?.likes || 1)) * 100)}%`,
                      }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tabla completa de Productos */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-800">Listado Completo para Gestión</h3>

              <div className="relative w-full md:w-72">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar producto o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 text-gray-900 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-[#FAFAFA] border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-4 text-center">
                      {!isSearching && <FiMenu className="text-gray-400 inline-block w-4 h-4" />}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tendencia
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                      Orden
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                      Likes
                    </th>
                  </tr>
                </thead>

                {isSearching ? (
                  <tbody className="divide-y divide-gray-200">{filteredProducts.map(renderRow)}</tbody>
                ) : (
                  <Reorder.Group
                    as="tbody"
                    values={products}
                    onReorder={handleReorder}
                    className="divide-y divide-gray-200"
                  >
                    {products.map(renderRow)}
                  </Reorder.Group>
                )}
              </table>

              {filteredProducts.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No se encontraron productos que coincidan con la búsqueda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL CREAR / EDITAR COMBO (COMPACTO & Z-INDEX ALTO)     */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showComboModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 md:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden my-auto"
            >
              {/* Header Modal - Compacto */}
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FiZap className="text-blue-600 w-4 h-4" />
                  {editingCombo ? "Editar Combo Promocional" : "Crear Nuevo Combo Promocional"}
                </h3>
                <button
                  onClick={() => setShowComboModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Formulario Modal - Scrollable e Intuitivo */}
              <form onSubmit={handleSaveCombo} className="p-4 md:p-5 space-y-3.5 overflow-y-auto flex-1">

                {/* Nombre y Subtítulo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                      Nombre del Combo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Combo Vela + Spray Textil"
                      value={comboForm.nombre}
                      onChange={(e) => setComboForm({ ...comboForm, nombre: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                      Subtítulo / Frase Corta
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Edición limitada de fragancias"
                      value={comboForm.subtitulo}
                      onChange={(e) => setComboForm({ ...comboForm, subtitulo: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Precios y Etiqueta */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                      Precio Combo ($) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="18500"
                      value={comboForm.precio}
                      onChange={(e) => setComboForm({ ...comboForm, precio: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                      Precio Anterior ($)
                    </label>
                    <input
                      type="number"
                      placeholder="24000"
                      value={comboForm.precioOriginal}
                      onChange={(e) => setComboForm({ ...comboForm, precioOriginal: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                      Etiqueta / Badge
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 30% OFF"
                      value={comboForm.badge}
                      onChange={(e) => setComboForm({ ...comboForm, badge: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Productos Incluidos */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block">
                      Productos Incluidos (Un producto por línea)
                    </label>

                    {/* Selector rápido desde el catálogo */}
                    <select
                      value=""
                      onChange={(e) => {
                        handleAddProductFromCatalog(e.target.value);
                      }}
                      className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-lg px-2 py-0.5 outline-none cursor-pointer transition-colors max-w-[230px] truncate"
                    >
                      <option value="">+ Seleccionar del catálogo...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.nombre}>
                          {p.nombre} {p.categoria ? `(${p.categoria})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    placeholder={`Vela Aromática Paris 250g\nHome Spray Vanilla 500ml`}
                    value={comboForm.productosIncluidosText}
                    onChange={(e) => setComboForm({ ...comboForm, productosIncluidosText: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Imagen (Carga ImageKit o URL) */}
                <div>
                  <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                    Imagen del Combo (URL o Subida ImageKit)
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={comboForm.imagen}
                      onChange={(e) => setComboForm({ ...comboForm, imagen: e.target.value })}
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />

                    <label className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap">
                      <FiUploadCloud className="w-3.5 h-3.5 text-blue-600" />
                      <span>{uploadingImage ? "Subiendo..." : "Subir Imagen"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {comboForm.imagen && (
                    <div className="mt-2 flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                      <img
                        src={comboForm.imagen}
                        alt="Vista previa"
                        className="w-8 h-8 object-cover rounded border border-gray-200"
                      />
                      <span className="text-[10px] text-gray-600 truncate flex-1">{comboForm.imagen}</span>
                    </div>
                  )}
                </div>

                {/* Opciones Adicionales: Producto Vinculado, Activo, Orden */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 items-center">
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                      Producto Vinculado
                    </label>
                    <select
                      value={comboForm.productId}
                      onChange={(e) => setComboForm({ ...comboForm, productId: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="">Ninguno (Independiente)</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block mb-0.5">
                      Orden
                    </label>
                    <input
                      type="number"
                      value={comboForm.orden}
                      onChange={(e) => setComboForm({ ...comboForm, orden: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="pt-2 sm:pt-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comboForm.activo}
                        onChange={(e) => setComboForm({ ...comboForm, activo: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2.5 text-xs font-bold text-gray-700 uppercase">
                        {comboForm.activo ? "Visible" : "Oculto"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Acciones Modal Footer */}
                <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-200 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowComboModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <FiSave className="w-3.5 h-3.5" />
                    <span>Guardar Combo</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LikesControl;
