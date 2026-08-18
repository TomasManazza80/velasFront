import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiPlus,
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiCalendar,
  FiClock,
  FiBarChart2,
  FiHome,
  FiTag,
  FiLayers,
  FiAlertTriangle,
  FiSearch,
  FiTrendingUp,
  FiArrowLeft,
  FiArrowRight,
  FiUploadCloud,
  FiMinusCircle,
  FiCornerDownRight,
  FiMenu,
  FiCreditCard,
  FiMessageSquare,
  FiUser,
  FiTruck,
  FiActivity,
  FiHeart,
  FiZap,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Componentes internos
import HistorialDeVentas from "../admin/historialVentas";
import ModuloCaja from "../admin/caja.jsx";
import ConfiguracionCostos from "./configuracionCostos.jsx";
import Encargos from "./encargos.jsx";
import HistorialDeVentasLocal from "../admin/ventasLocalFisico.jsx";
import HistorialRecaudacionFinal from "../admin/cierresDeCaja/historialRecaudacionFinal.jsx";
import CierreCajaDiario from "../admin/cierresDeCaja/cierreCajaDiario.jsx";
import BalanceModule from "./balance/balance.jsx";
import PersonalBalance from "./balance/personalBalance.jsx";
import CargaDeProductos from "./productos/cargaDeProductos.jsx";
import Facturacion from "./facturacion/facturacion.jsx";
import InventarioProductos from "./productos/inventarioProductos.jsx";
import LikesControl from "./productos/LikesControl.jsx";
import ModuloProveedores from "./proveedores/proveedores.jsx";
import ModuloClientes from "./clientes/clientes.jsx";
import ModuloRevendedores from "./revendedores/revendedoresAdmin.jsx";
import EnviosProductos from "./envios/enviosProductos.jsx";
import VentasEcommerceOnline from "./ventas/ventasEcommerceOnline.jsx";
import CargaContenidoWeb from "./cargaDeContenido/cargaDeContenido.jsx";
import Gastos from "./gastos.jsx";
import WhatsappQrSection from "./whatsapp/whatsappQrSection.jsx";
import ReporteGanancias from "./reporteGanancias.jsx";
import ConfiguracionMayorista from "./configuracionMayorista.jsx";
import ModuloEmpleados from "./empleados/moduloEmpleados.jsx";

const API_URL = import.meta.env.VITE_API_URL;

// --- CONFIGURACIÓN DE ANIMACIÓN ---
const springTransition = { type: "spring", stiffness: 300, damping: 30 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: springTransition },
};

const sectionVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
};

const sidebarGroupVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { staggerChildren: 0.1, ...springTransition },
  },
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

const EditarProducto = ({ producto, onGuardarCambios, onCancelar }) => {
  const [formData, setFormData] = useState({ ...producto });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-xl"
      >
        <h3 className="text-gray-900 font-bold text-lg mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
          <FiEdit2 className="w-5 h-5 text-blue-600" /> Editar Registro
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onGuardarCambios(formData);
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full bg-white border border-gray-200 rounded-full p-2.5 px-4 text-gray-900 text-sm font-medium outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Precio
              </label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) =>
                  setFormData({ ...formData, precio: e.target.value })
                }
                className="w-full bg-white border border-gray-200 rounded-full p-2.5 px-4 text-gray-900 text-sm font-medium outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Stock
              </label>
              <input
                type="number"
                value={formData.cantidad}
                onChange={(e) =>
                  setFormData({ ...formData, cantidad: e.target.value })
                }
                className="w-full bg-white border border-gray-200 rounded-full p-2.5 px-4 text-gray-900 text-sm font-medium outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-end gap-4 pt-4 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={onCancelar}
              className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full px-4 py-2 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white text-sm font-medium rounded-full px-5 py-2 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Admin = () => {
  const [recaudaciones, setRecaudaciones] = useState([]);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [todosMisProductos, setTodosMisProductos] = useState([]);
  const [seccionActiva, setSeccionActiva] = useState(
    () => localStorage.getItem("adminSeccionActiva") || "dashboard",
  );
  const [loading, setLoading] = useState(false);
  const [ventasPendientesDeCierre, setVentasPendientesDeCierre] = useState([]);
  const [pagosCajaPendientes, setPagosCajaPendientes] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const dateInicioRef = useRef(null);
  const dateFinRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarVisible(false);
      else setSidebarVisible(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("adminSeccionActiva", seccionActiva);
  }, [seccionActiva]);

  const obtenerDatos = async () => {
    setLoading(true);
    try {
      const [prod, vent, rec, caja] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/boughtProduct/AllboughtProducts`),
        axios.get(`${API_URL}/recaudacionFinal`),
        axios.get(`${API_URL}/pagoCaja/pagos`),
      ]);
      setTodosMisProductos(prod.data);
      setVentasPendientesDeCierre(vent.data);
      setPagosCajaPendientes(caja.data || []);
      setRecaudaciones(
        rec.data.map((r) => {
          let fechaExplicita = (r.op2 || "").replace("Fecha: ", "");
          if (!fechaExplicita && r.createdAt) {
            fechaExplicita = new Date(r.createdAt).toLocaleDateString("es-AR");
          }
          return {
            id: r.id,
            mes: fechaExplicita || r.mes || "S/D",
            montoRecaudado: parseFloat(r.totalFinal) || 0,
            productosVendidos: [
              ...(r.pagosEcommerce || []),
              ...(r.pagosLocal || []),
            ],
            createdAt: r.createdAt,
          };
        }),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const dataGrafico = useMemo(() => {
    let filtered = [...recaudaciones].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
    if (fechaInicio || fechaFin) {
      if (fechaInicio)
        filtered = filtered.filter(
          (r) => new Date(r.createdAt) >= new Date(fechaInicio + "T00:00:00"),
        );
      if (fechaFin)
        filtered = filtered.filter(
          (r) => new Date(r.createdAt) <= new Date(fechaFin + "T23:59:59"),
        );
      return filtered.map((r) => ({ mes: r.mes, recaudado: r.montoRecaudado }));
    }
    return filtered
      .map((r) => ({ mes: r.mes, recaudado: r.montoRecaudado }))
      .slice(-10);
  }, [recaudaciones, fechaInicio, fechaFin]);

  const recaudacionPendienteTotal = useMemo(() => {
    const ecom = ventasPendientesDeCierre.reduce(
      (acc, s) =>
        acc +
        parseFloat(s.precio) *
        parseInt(s.cantidad) *
        (1 - parseFloat(s.descuentoGlobalAplicado || 0) / 100),
      0,
    );
    const local = pagosCajaPendientes.reduce(
      (acc, p) => acc + parseFloat(p.montoTotal || 0),
      0,
    );
    return ecom + local;
  }, [ventasPendientesDeCierre, pagosCajaPendientes]);

  const desgloseCajaAbierta = useMemo(() => {
    let ecomRev = 0,
      ecomCost = 0,
      localRev = 0,
      localCost = 0;
    ventasPendientesDeCierre.forEach((s) => {
      const precioVenta =
        (parseFloat(s.precio) || 0) *
        (parseInt(s.cantidad) || 1) *
        (1 - parseFloat(s.descuentoGlobalAplicado || 0) / 100);
      const costo =
        (parseFloat(s.precioCompra) || 0) * (parseInt(s.cantidad) || 1);
      ecomRev += precioVenta;
      ecomCost += costo;
    });
    pagosCajaPendientes.forEach((p) => {
      localRev += parseFloat(p.montoTotal) || 0;
      (p.productos || []).forEach((prod) => {
        localCost +=
          (parseFloat(prod.precioCompra) || 0) * (parseInt(prod.cantidad) || 1);
      });
    });
    const gananciaTotal = ecomRev + localRev - (ecomCost + localCost);
    return {
      ecommerce: { rev: ecomRev, cost: ecomCost, profit: ecomRev - ecomCost },
      local: { rev: localRev, cost: localCost, profit: localRev - localCost },
      total: {
        rev: ecomRev + localRev,
        cost: ecomCost + localCost,
        profit: gananciaTotal,
      },
    };
  }, [ventasPendientesDeCierre, pagosCajaPendientes]);

  const gananciaPendienteTotal = desgloseCajaAbierta.total.profit;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 overflow-x-hidden font-sans">
      <AnimatePresence>
        {isMobile && sidebarVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarVisible(false)}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[50]"
          />
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSidebarVisible(!sidebarVisible)}
        className="fixed h-[48px] top-[20px] md:top-[40px] left-[20px] z-[1001] bg-white text-gray-900 rounded-full shadow-sm border border-gray-200 p-3 flex items-center justify-center transition-all"
      >
        {sidebarVisible && !isMobile ? (
          <FiArrowLeft size={20} className="w-5 h-5 text-gray-600" />
        ) : (
          <FiMenu size={20} className="w-5 h-5 text-gray-600" />
        )}
      </motion.button>

      <motion.div
        initial={false}
        animate={{ x: sidebarVisible ? 0 : isMobile ? "-100%" : -260 }}
        transition={springTransition}
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-sm z-[55] overflow-y-auto pb-24 ${isMobile ? "w-[80vw]" : "w-[260px]"}`}
      >
        <div className="p-8 border-b border-gray-200 pt-28 flex justify-between items-center">
          <div className="mb-2">
            <h1 className="text-gray-900 font-bold text-2xl flex items-center gap-2">
              <FiLayers className="text-blue-600 w-6 h-6" /> Admin Panel
            </h1>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarVisible(false)}
              className="text-gray-400 hover:text-gray-900 p-2 transition-colors"
            >
              <FiX size={20} className="w-5 h-5" />
            </button>
          )}
        </div>

        <motion.nav
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-4 space-y-6 mt-4"
        >
          {[
            {
              title: "Principal",
              items: [
                {
                  id: "dashboard",
                  label: "Dashboard",
                  icon: <FiHome className="w-5 h-5" />,
                },
                {
                  id: "caja",
                  label: "Caja Operativa",
                  icon: <FiDollarSign className="w-5 h-5" />,
                },
                {
                  id: "Encargos",
                  label: "Encargos / Pedidos",
                  icon: <FiPackage className="w-5 h-5" />,
                },
                {
                  id: "control",
                  label: "Cierre Diario",
                  icon: <FiCheck className="w-5 h-5" />,
                },
              ],
            },
            {
              title: "Finanzas",
              items: [
                {
                  id: "Balance",
                  label: "Balance",
                  icon: <FiBarChart2 className="w-5 h-5" />,
                },

                {
                  id: "gastos",
                  label: "Costos",
                  icon: <FiDollarSign className="w-5 h-5" />,
                },
                {
                  id: "historialRecaudacionFinal",
                  label: "Historial",
                  icon: <FiClock className="w-5 h-5" />,
                },
                {
                  id: "facturacion",
                  label: "Facturación",
                  icon: <FiTag className="w-5 h-5" />,
                },
                {
                  id: "configMayorista",
                  label: "Config. Mayorista",
                  icon: <FiDollarSign className="w-5 h-5" />,
                },
              ],
            },
            {
              title: "Inventario",
              items: [
                {
                  id: "productos",
                  label: "Stock",
                  icon: <FiPackage className="w-5 h-5" />,
                },
                {
                  id: "cargar",
                  label: "Nueva Carga",
                  icon: <FiPlus className="w-5 h-5" />,
                },
                {
                  id: "likes",
                  label: "Combos & Popularidad",
                  icon: <FiZap className="w-5 h-5" />,
                },
                {
                  id: "cargarContenidoWeb",
                  label: "Contenido Web",
                  icon: <FiEdit2 className="w-5 h-5" />,
                },
                {
                  id: "proveedores",
                  label: "Proveedores",
                  icon: <FiTruck className="w-5 h-5" />,
                },
              ],
            },
            {
              title: "Ventas",
              items: [
                {
                  id: "ventasLocal",
                  label: "Local",
                  icon: <FiShoppingCart className="w-5 h-5" />,
                },
                {
                  id: "ventasOnline",
                  label: "Ecommerce",
                  icon: <FiUploadCloud className="w-5 h-5" />,
                },
                {
                  id: "envios",
                  label: "Logística",
                  icon: <FiTrendingUp className="w-5 h-5" />,
                },
                {
                  id: "clientes",
                  label: "Clientes",
                  icon: <FiUser className="w-5 h-5" />,
                },
              ],
            },
            {
              title: "Sistema",
              items: [
                {
                  id: "whatsapp",
                  label: "WhatsApp",
                  icon: <FiMessageSquare className="w-5 h-5" />,
                },
                {
                  id: "empleados",
                  label: "Personal",
                  icon: <FiUser className="w-5 h-5" />,
                },
              ],
            },
          ].map((group, i) => (
            <motion.div
              key={i}
              variants={sidebarGroupVariants}
              className="space-y-1.5"
            >
              <motion.p
                variants={sidebarItemVariants}
                className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
              >
                {group.title}
              </motion.p>
              {group.items.map((item) => (
                <motion.button
                  key={item.id}
                  variants={sidebarItemVariants}
                  onClick={() => {
                    setSeccionActiva(item.id);
                    if (isMobile) setSidebarVisible(false);
                  }}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-medium transition-all rounded-full border border-transparent
                  ${seccionActiva === item.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
                >
                  <span className="mr-3">{item.icon}</span> {item.label}
                </motion.button>
              ))}
            </motion.div>
          ))}
        </motion.nav>
      </motion.div>

      <motion.div
        animate={{ paddingLeft: sidebarVisible && !isMobile ? 260 : 0 }}
        transition={springTransition}
        className="pt-24 md:pt-28 p-4 md:p-8 min-h-screen w-full flex flex-col"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={seccionActiva}
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {seccionActiva === "dashboard" && (
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Dashboard Overview
                  </h2>
                  {loading && (
                    <p className="text-xs font-semibold text-gray-500 animate-pulse bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                      Sincronizando datos...
                    </p>
                  )}
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                >
                  {[
                    {
                      label: "Stock Items",
                      val: todosMisProductos.length,
                      icon: <FiPackage className="w-6 h-6 text-gray-400" />,
                    },
                    {
                      label: "Cajas Activas",
                      val:
                        ventasPendientesDeCierre.length +
                        pagosCajaPendientes.length,
                      icon: <FiClock className="w-6 h-6 text-gray-400" />,
                    },
                    {
                      label: "Bruto Pendiente",
                      val: `$${recaudacionPendienteTotal.toLocaleString()}`,
                      icon: <FiDollarSign className="w-6 h-6 text-gray-400" />,
                    },
                    {
                      label: "Ganancia Neta",
                      val: `$${gananciaPendienteTotal.toLocaleString()}`,
                      icon: <FiTrendingUp className="w-6 h-6 text-blue-600" />,
                      highlight: true,
                    },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex justify-between items-center ${card.highlight ? "border-blue-600/30 bg-blue-50/20" : ""}`}
                    >
                      <div>
                        <p
                          className={`text-xs font-semibold uppercase tracking-wider ${card.highlight ? "text-blue-600" : "text-gray-500"}`}
                        >
                          {card.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {card.val}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-2xl">
                        {card.icon}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                      <h3 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                        <FiBarChart2 className="w-5 h-5 text-blue-600" />{" "}
                        Analíticas de Ingresos
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
                          <FiCalendar className="text-gray-400 w-4 h-4 mr-2" />
                          <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="bg-transparent border-none text-xs text-gray-700 font-medium outline-none w-full cursor-pointer"
                          />
                        </div>
                        <span className="text-gray-400 text-xs font-medium">a</span>
                        <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
                          <FiCalendar className="text-gray-400 w-4 h-4 mr-2" />
                          <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="bg-transparent border-none text-xs text-gray-700 font-medium outline-none w-full cursor-pointer"
                          />
                        </div>
                        {(fechaInicio || fechaFin) && (
                          <button
                            onClick={() => {
                              setFechaInicio("");
                              setFechaFin("");
                            }}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full p-2 transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dataGrafico}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#F1F5F9"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="mes"
                            stroke="#94A3B8"
                            tick={{ fontSize: 11, fill: "#64748B" }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis
                            stroke="#94A3B8"
                            tick={{ fontSize: 11, fill: "#64748B" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `$${val.toLocaleString()}`}
                            dx={-10}
                            width={70}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #E2E8F0",
                              borderRadius: "16px",
                              color: "#111827",
                              fontSize: 12,
                              fontWeight: 600,
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                            itemStyle={{ color: "#2563EB" }}
                            cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="recaudado"
                            stroke="#2563EB"
                            strokeWidth={3}
                            dot={{
                              r: 4,
                              fill: "#fff",
                              stroke: "#2563EB",
                              strokeWidth: 2,
                            }}
                            activeDot={{
                              r: 6,
                              fill: "#2563EB",
                              stroke: "#fff",
                              strokeWidth: 2,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-gray-900 font-bold text-lg flex items-center gap-2 mb-6">
                        <FiActivity className="w-5 h-5 text-blue-600" />{" "}
                        Resumen de Caja
                      </h3>

                      <div className="space-y-5">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Ingresos Brutos
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            ${desgloseCajaAbierta.total.rev.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Costos Estimados
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            ${desgloseCajaAbierta.total.cost.toLocaleString()}
                          </p>
                        </div>

                        <div className="mt-6 pt-4">
                          <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Ganancia Neta Actual
                            </p>
                            <p className="text-3xl font-bold text-blue-600 tracking-tight">
                              $
                              {desgloseCajaAbierta.total.profit.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 max-h-56">
                      <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                        Últimos Cierres
                      </h3>
                      <div className="space-y-3">
                        {recaudaciones.slice(0, 5).map((r) => (
                          <div
                            key={r.id}
                            className="bg-white border border-gray-200 p-3.5 rounded-2xl flex justify-between items-center hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-xs font-medium text-gray-600 truncate mr-2">
                              {r.mes}
                            </span>
                            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                              ${r.montoRecaudado.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full mt-4 flex-1 flex flex-col [&>div]:flex-1 [&>div]:w-full [&>div]:min-h-[calc(100vh-140px)]">
              {seccionActiva === "Balance" && <BalanceModule />}
              {seccionActiva === "personalBalance" && <PersonalBalance />}
              {seccionActiva === "Encargos" && <Encargos />}
              {seccionActiva === "caja" && <ModuloCaja />}
              {seccionActiva === "productos" && <InventarioProductos />}
              {seccionActiva === "cargar" && <CargaDeProductos />}
              {seccionActiva === "likes" && <LikesControl />}
              {seccionActiva === "ventasOnline" && <VentasEcommerceOnline />}
              {seccionActiva === "ventasLocal" && <HistorialDeVentasLocal />}
              {seccionActiva === "historialRecaudacionFinal" && (
                <HistorialRecaudacionFinal />
              )}
              {seccionActiva === "facturacion" && <Facturacion />}
              {seccionActiva === "proveedores" && <ModuloProveedores />}
              {seccionActiva === "clientes" && <ModuloClientes />}
              {seccionActiva === "revendedores" && <ModuloRevendedores />}
              {seccionActiva === "envios" && <EnviosProductos />}
              {seccionActiva === "cargarContenidoWeb" && <CargaContenidoWeb />}
              {seccionActiva === "gastos" && <Gastos />}
              {seccionActiva === "whatsapp" && <WhatsappQrSection />}
              {seccionActiva === "ganancias" && <ReporteGanancias />}
              {seccionActiva === "control" && <CierreCajaDiario />}
              {seccionActiva === "configMayorista" && (
                <ConfiguracionMayorista />
              )}
              {seccionActiva === "empleados" && <ModuloEmpleados />}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {productoAEditar && (
            <EditarProducto
              producto={productoAEditar}
              onCancelar={() => setProductoAEditar(null)}
              onGuardarCambios={() => { }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Admin;
