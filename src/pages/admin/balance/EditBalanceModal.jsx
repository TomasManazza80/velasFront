import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiSave,
  FiTag,
  FiHash,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiPackage,
  FiLayers,
  FiTruck,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}/balanceMensual/ActualizaBalanceMensual`;

const paymentLabels = {
  efectivo: "EFECTIVO (CAJA)",
  debito: "TARJETA DE DÉBITO",
  transferencia: "TRANSFERENCIA",
  credito_1: "CRÉDITO 1 CUOTA",
  credito_2: "CRÉDITO 2 CUOTAS",
  credito_3: "CRÉDITO 3 CUOTAS",
  credito_4: "CRÉDITO 4 CUOTAS",
  credito_5: "CRÉDITO 5 CUOTAS",
  credito_6: "CRÉDITO 6 CUOTAS",
  mixto: "PAGOS MIXTOS",
  mercadopago: "MERCADO PAGO",
};

const styles = {
  title: "text-2xl font-bold text-gray-900",
  body: "font-sans font-medium text-gray-700",
  tech: "font-sans font-semibold text-gray-800",
  glass:
    "bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden",
  input:
    "w-full bg-white border border-gray-200 p-3 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
  btnBw:
    "bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-5 transition-all rounded-full flex items-center justify-center gap-2 text-sm",
  statCard:
    "bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:border-gray-300 transition-all group",
  tableHeader:
    "px-8 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50",
  tableRow: "border-b border-gray-200 hover:bg-gray-50 transition-colors",
};

const EditBalanceModal = ({ entry, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    producto: "",
    cliente: "",
    monto: 0,
    metodo_pago: "",
    origenDeVenta: "",
    fecha: "",
    marca: "",
    categoria: "",
    proveedor: "",
    cantidad: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lock background scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (entry) {
      setFormData({
        producto: entry.producto || "",
        cliente: entry.cliente || "",
        monto: entry.monto || 0,
        metodo_pago: entry.metodo_pago || "",
        origenDeVenta: entry.origenDeVenta || "",
        fecha: entry.fecha
          ? entry.fecha.split("T")[0]
          : new Date().toISOString().split("T")[0],
        marca: entry.marca || "",
        categoria: entry.categoria || "",
        proveedor: entry.proveedor || "",
        cantidad: entry.cantidad || 1,
      });
    }
  }, [entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "monto" || name === "cantidad" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const id = entry.BalanceMensualId || entry.id;
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Error al actualizar el registro");
      onUpdate();
      onClose();
    } catch (err) {
      console.error("UPDATE_ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!entry) return null;

  // Portal: render directly on document.body so `fixed` always works
  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        key="edit-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.form
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="bg-[#0D0D0D] border border-orange-500/40 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-[0_0_60px_rgba(255,140,0,0.15)]"
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-orange-500/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 text-black p-2 rounded-lg">
                <FiPackage size={18} />
              </div>
              <div>
                <h2 className="font-['Montserrat'] font-black text-base uppercase tracking-tighter text-gray-900">
                  CORREGIR REGISTRO
                </h2>
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                  ID: {entry.BalanceMensualId || entry.id}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors rounded-lg"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-500 text-xs font-bold uppercase">
                ERROR: {error}
              </div>
            )}

            <div>
              <label className={styles.label}>Descripción / Producto</label>
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  name="producto"
                  value={formData.producto}
                  onChange={handleChange}
                  className={`${styles.input} pl-10`}
                  required
                />
              </div>
            </div>

            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Cliente</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    className={`${styles.input} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className={styles.label}>Monto</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    name="monto"
                    step="0.01"
                    value={formData.monto}
                    onChange={handleChange}
                    className={`${styles.input} pl-10`}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Método de Pago</label>
                <select
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  {Object.entries(paymentLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.label}>Origen de Venta</label>
                <select
                  name="origenDeVenta"
                  value={formData.origenDeVenta}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="LocalFisico">🏪 LOCAL FÍSICO</option>
                  <option value="Revendedor">🤝 REVENDEDOR</option>
                  <option value="ecommerce">🛒 E-COMMERCE</option>
                  <option value="n/a">S/D</option>
                </select>
              </div>
            </div>

            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Fecha</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className={`${styles.input} pl-10`}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={styles.label}>Cantidad</label>
                <div className="relative">
                  <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    className={`${styles.input} pl-10`}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-white" />

            <div className={styles.grid}>
              <div>
                <label className={styles.label}>Marca</label>
                <div className="relative">
                  <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    className={`${styles.input} pl-10`}
                    placeholder="Ej: Apple, Samsung..."
                  />
                </div>
              </div>
              <div>
                <label className={styles.label}>Categoría</label>
                <div className="relative">
                  <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className={`${styles.input} pl-10`}
                    placeholder="Ej: Accesorios, Celulares..."
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={styles.label}>Proveedor</label>
              <div className="relative">
                <FiTruck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  className={`${styles.input} pl-10`}
                  placeholder="Nombre del proveedor"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={styles.btnCancel}
            >
              DESCARTAR
            </button>
            <button type="submit" disabled={loading} className={styles.btnSave}>
              {loading ? (
                "GUARDANDO..."
              ) : (
                <>
                  <FiSave /> APLICAR CAMBIOS
                </>
              )}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export default EditBalanceModal;
