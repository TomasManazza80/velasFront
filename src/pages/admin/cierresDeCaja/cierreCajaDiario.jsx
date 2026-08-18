import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheck,
  FiDollarSign,
  FiShoppingCart,
  FiCreditCard,
  FiAlertTriangle,
  FiLoader,
  FiCalendar,
  FiArchive,
  FiTrendingUp,
  FiActivity,
  FiPackage,
} from "react-icons/fi";
import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_API_URL;
const styles = {
  title: "text-2xl font-bold text-gray-900",
  subtitle: "text-lg font-semibold text-gray-800",
  label: "text-xs font-semibold text-gray-500 uppercase tracking-wider block",
  glassCard: "bg-white border border-gray-200 rounded-2xl shadow-sm",
  btnPrimary: "bg-blue-600 text-white text-sm font-medium rounded-full px-5 py-3 md:py-2 hover:bg-blue-700 transition-all flex items-center justify-center gap-2",
  btnSecondary: "bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full px-4 py-3 md:py-2 hover:bg-gray-50 transition-all flex items-center justify-center gap-2",
  btnFilterActive: "bg-blue-600 text-white border-transparent rounded-full px-4 py-3 md:py-2 text-sm font-medium transition-all flex items-center justify-center gap-2",
};

const CierreCajaDiario = () => {
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [ventasEcommerce, setVentasEcommerce] = useState([]);
  const [ventasLocal, setVentasLocal] = useState([]);
  const [egresos, setEgresos] = useState([]);
  /* ESTADO PARA TABS EN MÓVILES */
  const [mobileTab, setMobileTab] = useState("local");
  /* --- CARGA DE DATOS --- */
  const fetchData = async () => {
    console.log("CIERRE_CAJA: INICIANDO_FETCH...");
    console.log("CIERRE_CAJA: API_URL =", API_URL);
    setLoading(true);
    try {
      let resEcom = { data: [] };
      let resLocal = { data: [] };
      try {
        resEcom = await axios.get(
          `${API_URL}/ecommerce/pedidos?unshipped=true`,
        );
        console.log("FETCH_ECOM_SUCCESS:", resEcom.data?.length, "items");
      } catch (e) {
        console.error("FETCH_ECOM_ERROR:", e.message);
      }
      try {
        resLocal = await axios.get(`${API_URL}/pagoCaja/pagos`);
        console.log("FETCH_LOCAL_SUCCESS:", resLocal.data?.length, "items");
      } catch (e) {
        console.error("FETCH_LOCAL_ERROR:", e.message);
      }
      const ecommerceProducts = (resEcom.data || [])
        .filter((order) => !order.metadata_ecommerce?.cierreCaja)
        .flatMap((order) => {
          let items = order.items || [];
          if (typeof items === "string") {
            try {
              items = JSON.parse(items);
            } catch (e) {
              console.error(
                `ERROR_PARSING_ITEMS for Order ${order.id}:`,
                items,
              );
              items = [];
            }
          }
          if (!Array.isArray(items)) {
            console.warn(`ORDER_ITEMS_NOT_ARRAY for Order ${order.id}:`, items);
            items = [];
          }
          return items.map((item) => ({
            ...item,
            nombre: item.title,
            precio: parseFloat(item.unit_price),
            cantidad: parseInt(item.quantity),
            precioCompra: parseFloat(item.cost_price || item.precioCompra || 0),
            orderId: order.id,
            nombreComprador: order.name,
            fechaCompra: order.createdAt,
            descuentoGlobalAplicado: 0,
            originalMetadata: order.metadata_ecommerce || {},
          }));
        });
      console.log("ECOMMERCE_PRODUCTS_FLATTENED:", ecommerceProducts.length);
      setVentasEcommerce(ecommerceProducts);
      setVentasLocal(resLocal.data || []);
      try {
        const resEgress = await axios.get(`${API_URL}/egresos/egress`);
        setEgresos(resEgress.data || []);
      } catch (e) {
        console.error("FETCH_EGRESS_ERROR:", e.message);
      }
    } catch (error) {
      console.error("CRITICAL_FETCH_ERROR:", error);
      Swal.fire(
        "Error",
        "No se pudieron sincronizar los datos de caja.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  /* --- CÁLCULOS --- */
  const totales = useMemo(() => {
    const totalEcom = ventasEcommerce.reduce((acc, item) => {
      const precio = parseFloat(item.precio || item.price) || 0;
      const cant = parseInt(item.cantidad || item.quantity) || 1;
      const desc = parseFloat(item.descuentoGlobalAplicado) || 0;
      return acc + precio * cant * (1 - desc / 100);
    }, 0);
    const totalLocal = ventasLocal.reduce((acc, item) => {
      return acc + (parseFloat(item.montoTotal) || 0);
    }, 0);
    return {
      ecommerce: totalEcom,
      local: totalLocal,
      global: totalEcom + totalLocal,
    };
  }, [ventasEcommerce, ventasLocal]);
  /* --- LÓGICA DE CIERRE AUTOMÁTICO --- */
  const [autoCierre, setAutoCierre] = useState(() => {
    const savedAuto = localStorage.getItem("FEDECELL_AUTO_CIERRE");
    return savedAuto !== null ? JSON.parse(savedAuto) : false;
  });
  useEffect(() => {
    localStorage.setItem("FEDECELL_AUTO_CIERRE", JSON.stringify(autoCierre));
    let interval;
    if (autoCierre) {
      interval = setInterval(() => {
        const now = new Date();
        if (
          now.getHours() === 23 &&
          now.getMinutes() === 59 &&
          now.getSeconds() === 0
        ) {
          if (totales.global > 0 && !procesando) {
            handleCierreCaja({ automatico: true });
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [autoCierre, totales.global]);
  /* --- MANEJADOR DE CIERRE --- */
  const [resetBalanceOnCierre, setResetBalanceOnCierre] = useState(true);
  const handleCierreCaja = async (opciones = {}) => {
    if (totales.global === 0) {
      Swal.fire({
        title: "Caja Vacía",
        text: "No hay movimientos para cerrar.",
        icon: "info",
        background: "#0a0a0a",
        color: "#fff",
        confirmButtonColor: "#fff",
      });
      return;
    }
    const confirm = opciones?.automatico
      ? { isConfirmed: true }
      : await Swal.fire({
          title: "¿CONFIRMAR CIERRE DIARIO?",
          html: ` <p>Se archivarán ${ventasEcommerce.length + ventasLocal.length} operaciones por un total de $${totales.global.toLocaleString("es-AR")}.</p> <div style="margin-top: 15px; padding: 10px; border-top: 1px solid #333; text-align: center;"> <p style="color: #888; font-size: 10px; text-transform: uppercase; font-family: 'Inter', sans-serif; letter-spacing: 1px;"> Reseteo de Billetes: <span style="color: ${localStorage.getItem("fedecell_reseteo_billetes_auto") === "true" ? "#fff" : "#666"}">${localStorage.getItem("fedecell_reseteo_billetes_auto") === "true" ? "HABILITADO" : "DESHABILITADO"}</span> </p> <p style="color: #555; font-size: 8px; font-family: 'Inter', sans-serif; margin-top: 5px;">(Configurado en la sección de Balance)</p> </div> `,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ffffff",
          cancelButtonColor: "#111111",
          confirmButtonText:
            '<span style="color: #000; font-weight: 900; font-family: Inter;">SÍ, EJECUTAR</span>',
          cancelButtonText:
            '<span style="color: #fff; font-family: Inter;">CANCELAR</span>',
          background: "#050505",
          color: "#fff",
        });
    if (!confirm.isConfirmed) return;
    const doReset =
      localStorage.getItem("fedecell_reseteo_billetes_auto") === "true";
    setProcesando(true);
    try {
      const billsTotal = {
        20000: 0,
        10000: 0,
        5000: 0,
        2000: 0,
        1000: 0,
        500: 0,
        200: 0,
        100: 0,
      };
      const changeTotal = {
        20000: 0,
        10000: 0,
        5000: 0,
        2000: 0,
        1000: 0,
        500: 0,
        200: 0,
        100: 0,
      };
      ventasLocal.forEach((pago) => {
        if (pago.medioPago === "efectivo" && pago.detalles_pago) {
          if (pago.detalles_pago.billetes) {
            Object.entries(pago.detalles_pago.billetes).forEach(
              ([den, cant]) => {
                if (billsTotal.hasOwnProperty(den))
                  billsTotal[den] += parseInt(cant) || 0;
              },
            );
          }
          if (pago.detalles_pago.vuelto) {
            Object.entries(pago.detalles_pago.vuelto).forEach(([den, cant]) => {
              if (changeTotal.hasOwnProperty(den))
                changeTotal[den] += parseInt(cant) || 0;
            });
          }
        }
      });
      const productosEcommerceFormatted = ventasEcommerce.map((v) => {
        const precio = parseFloat(v.precio) || 0;
        const cantidad = parseInt(v.cantidad) || 1;
        const descP = parseFloat(v.descuentoGlobalAplicado) || 0;
        const montoTotal = precio * cantidad * (1 - descP / 100);
        return {
          nombreProducto:
            v.nombre || v.nombreProducto || "Producto Desconocido",
          cantidadComprada: cantidad,
          monto: Number(montoTotal.toFixed(2)),
          idPago: v.orderId,
          fecha: v.fechaCompra || new Date().toISOString(),
          canal: "ECOMMERCE",
          cliente: v.nombreComprador || "Cliente Web",
          medioPago: "MercadoPago",
          hora: new Date(v.fechaCompra || Date.now()).toLocaleTimeString(
            "es-AR",
            { hour: "2-digit", minute: "2-digit" },
          ),
          precioCompra: parseFloat(v.precioCompra) || 0,
          marca: v.marca || "GENERICO",
          categoria: v.categoria || "ECOMMERCE",
          proveedor: v.proveedor || "N/A",
        };
      });
      const productosLocalFormatted = [];
      ventasLocal.forEach((pago) => {
        const items = pago.productos || [];
        let canal = "LOCAL";
        const origen = (pago.origenDeVenta || "").toLowerCase();
        if (origen.includes("revendedor")) canal = "REVENDEDOR";
        else if (origen.includes("ecommerce") || origen.includes("web"))
          canal = "ECOMMERCE";
        const cliente = pago.opcion1
          ? pago.opcion1.replace("Cliente: ", "")
          : "Consumidor Final";
        const hora = new Date(pago.createdAt || pago.fecha).toLocaleTimeString(
          "es-AR",
          { hour: "2-digit", minute: "2-digit" },
        );
        if (Array.isArray(items)) {
          items.forEach((item) => {
            const montoItem = parseFloat(item.monto) || 0;
            const cantItem = parseInt(item.cantidad) || 1;
            productosLocalFormatted.push({
              nombreProducto: item.nombre || "Item Venta",
              cantidadComprada: cantItem,
              monto: Number((montoItem * cantItem).toFixed(2)),
              idPago: pago.pagoId || pago.id,
              fecha: pago.createdAt || pago.fecha,
              canal: canal,
              cliente: cliente,
              medioPago: pago.medioPago || "Desconocido",
              hora: hora,
              precioCompra: parseFloat(item.precioCompra) || 0,
              marca: item.marca || "",
              categoria: item.categoria || "",
              proveedor: item.proveedor || "",
              tarjeta_digitos: pago.tarjeta_digitos || null,
              detalles_pago: pago.detalles_pago || null,
            });
          });
        }
      });
      const payload = {
        mes: new Date()
          .toLocaleString("es-AR", { month: "long", year: "numeric" })
          .toUpperCase(),
        op2: `Fecha: ${new Date().toLocaleDateString("es-AR")}`,
        productosVendidos: [
          ...productosEcommerceFormatted,
          ...productosLocalFormatted,
        ],
        totalFinal: Number(totales.global.toFixed(2)) || 0,
        montoFinalEcommerce: Number(totales.ecommerce.toFixed(2)) || 0,
        montoFinalLocal: Number(totales.local.toFixed(2)) || 0,
        detalles_billetes: billsTotal,
        detalles_vuelto: changeTotal,
        resumen_cierre: (() => {
          const metodosPago = {
            efectivo: 0,
            debito: 0,
            transferencia: 0,
            credito_1: 0,
            credito_2: 0,
            credito_3: 0,
            credito_4: 0,
            credito_5: 0,
            credito_6: 0,
            mixto: 0,
            mercadopago: totales.ecommerce,
          };
          ventasLocal.forEach((v) => {
            const m = (v.medioPago || "").toLowerCase();
            const monto = parseFloat(v.montoTotal) || 0;
            if (m === "mixto") {
              metodosPago.mixto += monto;
              if (v.detalles_pago?.mixto) {
                const desglose = v.detalles_pago.mixto;
                if (desglose.efectivo)
                  metodosPago.efectivo += parseFloat(desglose.efectivo);
                if (desglose.transferencia)
                  metodosPago.transferencia += parseFloat(
                    desglose.transferencia,
                  );
                if (desglose.debito)
                  metodosPago.debito += parseFloat(desglose.debito);
                if (desglose.credito_info && desglose.credito_info.monto > 0) {
                  const cuotas = desglose.credito_info.cuotas || 1;
                  const key = `credito_${cuotas}`;
                  const montoCredito =
                    parseFloat(desglose.credito_info.monto) || 0;
                  const montoInteres =
                    parseFloat(desglose.credito_info.interes_monto) || 0;
                  const totalCreditoParte = montoCredito + montoInteres;
                  if (metodosPago.hasOwnProperty(key)) {
                    metodosPago[key] += totalCreditoParte;
                  } else {
                    metodosPago.credito_1 += totalCreditoParte;
                  }
                }
              }
            } else if (metodosPago.hasOwnProperty(m)) {
              metodosPago[m] += monto;
            } else if (m.includes("tarjeta_credito") || m.includes("credito")) {
              if (m.includes("1")) metodosPago.credito_1 += monto;
              else if (m.includes("2")) metodosPago.credito_2 += monto;
              else if (m.includes("3")) metodosPago.credito_3 += monto;
              else if (m.includes("4")) metodosPago.credito_4 += monto;
              else if (m.includes("5")) metodosPago.credito_5 += monto;
              else if (m.includes("6")) metodosPago.credito_6 += monto;
              else metodosPago.credito_1 += monto;
            }
          });
          const totalEgresos = egresos.reduce(
            (acc, e) => acc + (parseFloat(e.monto) || 0),
            0,
          );
          return {
            Balance_Neto_Rango: totales.global - totalEgresos,
            Ventas_Registradas_Hoy: totales.global,
            Extracciones_en_Rango: totalEgresos,
            Operaciones_en_Rango: ventasEcommerce.length + ventasLocal.length,
            metodosPago,
          };
        })(),
      };
      await axios.post(`${API_URL}/recaudacionFinal/`, payload);
      const deletePromises = [];
      const orderIdsToUpdate = [
        ...new Set(ventasEcommerce.map((v) => v.orderId)),
      ];
      orderIdsToUpdate.forEach((orderId) => {
        const item = ventasEcommerce.find((v) => v.orderId === orderId);
        if (item) {
          const newMeta = {
            ...item.originalMetadata,
            cierreCaja: true,
            fechaCierre: new Date(),
          };
          deletePromises.push(
            axios
              .patch(`${API_URL}/ecommerce/pedidos/${orderId}/estado`, {
                metadata_ecommerce: newMeta,
              })
              .catch((e) =>
                console.warn(
                  `Fallo al archivar orden e-commerce ${orderId}`,
                  e,
                ),
              ),
          );
        }
      });
      ventasLocal.forEach((v) => {
        if (v.pagoId || v.id) {
          deletePromises.push(
            axios
              .delete(`${API_URL}/pagoCaja/pagos/${v.pagoId || v.id}`)
              .catch((e) => console.warn("Fallo borrar local", v)),
          );
        }
      });
      egresos.forEach((e) => {
        if (e.id) {
          deletePromises.push(
            axios
              .delete(`${API_URL}/egresos/egress/${e.id}`)
              .catch((err) => console.warn("Fallo borrar egreso", e)),
          );
        }
      });
      if (doReset) {
        deletePromises.push(
          axios
            .delete(`${API_URL}/balanceMensual/BorraTodoBalanceMensual`)
            .catch((e) => console.warn("Fallo borrar balance total")),
        );
      }
      await Promise.all(deletePromises);
      await Swal.fire({
        title: "CIERRE EXITOSO",
        text: "La caja ha sido cerrada y los registros archivados correctamente.",
        icon: "success",
        confirmButtonColor: "#ffffff",
        confirmButtonText:
          '<span style="color: #000; font-family: Inter; font-weight: bold;">OK</span>',
        background: "#050505",
        color: "#fff",
      });
      fetchData();
    } catch (error) {
      console.error("Error en cierre:", error);
      const msg =
        error.response?.data?.message ||
        "Hubo un problema al procesar el cierre.";
      const details = error.response?.data?.details
        ? `

Detalles:
${JSON.stringify(error.response.data.details, null, 2)}`
        : `

Error: ${error.message}`;
      Swal.fire({
        title: "Error Crítico",
        text: `${msg}${details}`,
        icon: "error",
        background: "#050505",
        color: "#fff",
        confirmButtonColor: "#fff",
        confirmButtonText:
          '<span style="color: #000; font-family: Inter; font-weight: bold;">CERRAR</span>',
      });
    } finally {
      setProcesando(false);
    }
  };
  if (loading)
    return (
      <div className="h-full flex flex-col items-center justify-center min-h-[400px] bg-[#FAFAFA]">
        <FiLoader className="animate-spin text-blue-600 mb-4 w-8 h-8" />
        <p className="text-sm font-medium text-gray-700">
          Sincronizando operaciones...
        </p>
      </div>
    );
  return (
    <div className="bg-[#FAFAFA] min-h-screen p-4 md:p-6 lg:p-8 text-gray-900 selection:bg-blue-600 selection:text-white pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b border-gray-200 pb-6 gap-6 max-w-7xl mx-auto">
        <div className="w-full">
          <h2 className={`${styles.title} flex items-center gap-2`}>
            <FiCheck className="text-blue-600 w-6 h-6 hidden md:block" /> Cierre de Caja Diario
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-2">
            {new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase()}
          </p>
        </div>
        {/* CONTROLES HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full md:w-auto bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border border-gray-200 md:border-none gap-4">
          <div className="flex flex-col md:items-end w-full md:w-auto">
            <p className={`${styles.label} mb-2`}>Configuración</p>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-end gap-4 w-full md:w-auto">
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-600 uppercase tracking-wider transition-colors">
                  {autoCierre ? "Auto Activo" : "Auto Inactivo"}
                </span>
                <div
                  onClick={() => setAutoCierre(!autoCierre)}
                  className={`w-12 h-6 rounded-full p-1 transition-all flex items-center border ${autoCierre ? "bg-blue-600 border-blue-600" : "bg-gray-200 border-gray-300"}`}
                >
                  <div className={`w-4 h-4 rounded-full shadow-sm transform transition-transform bg-white ${autoCierre ? "translate-x-6" : "translate-x-0"}`} />
                </div>
              </label>
              <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Caja Abierta</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESUMEN DE TOTALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-7xl mx-auto">
        {/* CARD ECOMMERCE */}
        <div className={`${styles.glassCard} p-6 relative overflow-hidden group`}>
          <div className="absolute top-4 right-4 text-gray-100 group-hover:text-blue-50 transition-colors">
            <FiShoppingCart className="w-16 h-16" />
          </div>
          <p className={`${styles.label} mb-2 relative z-10`}>Ingresos Web</p>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2 truncate relative z-10">
            ${totales.ecommerce.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
          </h3>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider relative z-10">
            {ventasEcommerce.length} operaciones
          </p>
        </div>

        {/* CARD LOCAL */}
        <div className={`${styles.glassCard} p-6 relative overflow-hidden group`}>
          <div className="absolute top-4 right-4 text-gray-100 group-hover:text-blue-50 transition-colors">
            <FiDollarSign className="w-16 h-16" />
          </div>
          <p className={`${styles.label} mb-2 relative z-10`}>Ingresos Local</p>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2 truncate relative z-10">
            ${totales.local.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
          </h3>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider relative z-10">
            {ventasLocal.length} operaciones
          </p>
        </div>

        {/* CARD TOTAL */}
        <div className="bg-blue-600 p-6 relative overflow-hidden rounded-2xl shadow-sm border border-blue-500 md:col-span-2 lg:col-span-1">
          <div className="absolute top-1/2 -translate-y-1/2 right-4 text-white/10">
            <FiActivity className="w-20 h-20" />
          </div>
          <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2 block relative z-10">
            Recaudación Neta
          </p>
          <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight truncate relative z-10">
            ${totales.global.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
          </h3>
        </div>
      </div>

      {/* TABS NAVEGACIÓN (SÓLO VISIBLES EN MÓVILES) */}
      <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto w-full pb-2">
        <button
          onClick={() => setMobileTab("local")}
          className={mobileTab === "local" ? styles.btnFilterActive : styles.btnSecondary}
        >
          Local Físico ({ventasLocal.length})
        </button>
        <button
          onClick={() => setMobileTab("ecommerce")}
          className={mobileTab === "ecommerce" ? styles.btnFilterActive : styles.btnSecondary}
        >
          E-Commerce ({ventasEcommerce.length})
        </button>
      </div>

      {/* DETALLE DE OPERACIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 max-w-7xl mx-auto">
        {/* LISTA ECOMMERCE */}
        <div className={`${styles.glassCard} flex-col h-[60vh] md:h-[500px] ${mobileTab === "ecommerce" ? "flex" : "hidden"} lg:flex overflow-hidden`}>
          <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
            <h4 className={`${styles.subtitle} flex items-center gap-2`}>
              <FiShoppingCart className="text-blue-600 w-5 h-5" /> Detalle Ecommerce
            </h4>
            <span className="bg-gray-50 text-gray-700 px-3 py-1 text-xs font-semibold rounded-full border border-gray-200">
              {ventasEcommerce.length} ítems
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white custom-scrollbar">
            {ventasEcommerce.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <FiPackage className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">Sin operaciones</p>
              </div>
            ) : (
              ventasEcommerce.map((v, i) => (
                <div key={i} className="p-4 bg-white border border-gray-200 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {v.nombre || v.nombreProducto}
                      </span>
                      <span className="text-xs font-medium text-gray-500 mt-1">
                        {v.nombreComprador}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ${(parseFloat(v.precio) * parseInt(v.cantidad)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500">
                        Cant: <span className="text-gray-900">{v.cantidad}</span>
                      </span>
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-semibold text-xs">
                        WEB
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(v.fechaCompra || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LISTA LOCAL */}
        <div className={`${styles.glassCard} flex-col h-[60vh] md:h-[500px] ${mobileTab === "local" ? "flex" : "hidden"} lg:flex overflow-hidden`}>
          <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
            <h4 className={`${styles.subtitle} flex items-center gap-2`}>
              <FiDollarSign className="text-blue-600 w-5 h-5" /> Detalle Local
            </h4>
            <span className="bg-gray-50 text-gray-700 px-3 py-1 text-xs font-semibold rounded-full border border-gray-200">
              {ventasLocal.length} ítems
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white custom-scrollbar">
            {ventasLocal.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <FiPackage className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">Sin operaciones</p>
              </div>
            ) : (
              ventasLocal.map((v, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <FiCheck className="text-blue-600 w-4 h-4" /> VNT #{v.pagoId || v.id}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-gray-500 capitalize">
                          {v.medioPago}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-semibold text-xs ${(v.origenDeVenta || "").toLowerCase().includes("revendedor") ? "bg-gray-800 text-white" : "bg-blue-50 text-blue-600"}`}>
                          {(v.origenDeVenta || "LOCAL").toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-500 mt-2">
                        {v.opcion1 || "Consumidor Final"}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ${parseFloat(v.montoTotal).toLocaleString()}
                    </span>
                  </div>
                  {/* DETALLE DE PRODUCTOS */}
                  <div className="p-4 bg-gray-50 divide-y divide-gray-200">
                    {(v.productos || []).map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-2 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          <span className="font-semibold text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded-md text-xs">
                            {p.cantidad}x
                          </span>
                          <span className="truncate font-medium text-gray-700">
                            {p.nombre}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 ml-4">
                          ${(parseFloat(p.monto || p.precio || p.precioVenta || 0) * parseInt(p.cantidad || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {v.medioPago === "mixto" && v.detalles_pago?.mixto && (
                      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(v.detalles_pago.mixto).map(([metodo, valor]) =>
                          valor > 0 && (
                            <div key={metodo} className="bg-white p-3 rounded-xl border border-gray-200">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                                {metodo}
                              </span>
                              <span className="text-sm text-gray-900 font-bold">
                                ${parseFloat(valor).toLocaleString()}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-t-0 md:p-0 z-50 flex justify-center md:justify-end max-w-7xl mx-auto">
        <button
          onClick={handleCierreCaja}
          disabled={procesando || totales.global === 0}
          className={`${styles.btnPrimary} w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {procesando ? (
            <>
              <FiLoader className="animate-spin w-5 h-5" /> Procesando...
            </>
          ) : (
            <>
              <FiArchive className="w-5 h-5" />
              <span className="font-medium">Ejecutar Cierre y Archivar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

};
export default CierreCajaDiario;
