import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PaymentsSection from "./seccionPagos";
import TotalsSection from "./seccionTotales";
import EgressForm from "./seccionEgresos";
import PersonalBalanceModule from "./balancePersonal";
import MonthlyExpenseTracker from "./gastosMensuales";
import SeccionGanancias from "./seccionGanancias";
import axios from "axios";
import {
  ChartBarIcon,
  MinusCircleIcon,
  UserIcon,
  CalendarDaysIcon,
  PlusIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { FiTrendingUp, FiBriefcase } from "react-icons/fi";

// =================================================================
// Estilos aplicados en favor del Sistema de Diseño SaaS
const mockBalanceData = {
  payments: {
    efectivo: 125000,
    debito: 85000,
    tarjeta_credito: 55000,
    transferencia: 60000,
    credito_1: 45000,
    credito_2: 20000,
    credito_3: 15000,
    credito_4: 10000,
    credito_5: 5000,
    credito_6: 3000,
  },
  egresos: 30000,
  total_ventas: 423000,
};

const BalanceModule = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("balance");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [productsDetail, setProductsDetail] = useState([]);
  const [allEntries, setAllEntries] = useState([]);

  /* --- MANEJO AJUSTE ARQUEO DE CAJA --- */
  const [isEditingBills, setIsEditingBills] = useState(false);
  const [editedBillTotals, setEditedBillTotals] = useState({});
  const [isAdjusting, setIsAdjusting] = useState(false);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    producto: "",
    monto: "",
    cantidad: 1,
    precioCompra: 0,
    marca: "",
    categoria: "",
    proveedor: "",
    metodo_pago: "transferencia",
    detalles_mixto: { efectivo: "", transferencia: "", debito: "" },
    fecha: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/balanceMensual/ObtenBalanceMensual`,
      );
      const data = response.data || [];
      setAllEntries(data);

      const payments = {
        efectivo: 0,
        debito: 0,
        tarjeta_credito: 0,
        transferencia: 0,
        credito_1: 0,
        credito_2: 0,
        credito_3: 0,
        credito_4: 0,
        credito_5: 0,
        credito_6: 0,
        mercadopago: 0,
      };

      let totalVentas = 0;
      const billTotals = {
        20000: 0,
        10000: 0,
        5000: 0,
        2000: 0,
        1000: 0,
        500: 0,
        200: 0,
        100: 0,
      };

      data.forEach((entry) => {
        const monto = parseFloat(entry.monto) || 0;
        const metodo = entry.metodo_pago;

        if (metodo === "mixto" && entry.detalles_pago?.mixto) {
          const mixtoData = entry.detalles_pago.mixto;
          if (mixtoData.efectivo)
            payments.efectivo += parseFloat(mixtoData.efectivo) || 0;
          if (mixtoData.transferencia)
            payments.transferencia += parseFloat(mixtoData.transferencia) || 0;
          if (mixtoData.debito)
            payments.debito += parseFloat(mixtoData.debito) || 0;
          if (!payments.mixto) payments.mixto = 0;
          payments.mixto += monto;
        } else if (payments.hasOwnProperty(metodo)) {
          payments[metodo] += monto;
        }

        totalVentas += monto;

        if (metodo === "efectivo" && entry.detalles_pago?.billetes) {
          Object.entries(entry.detalles_pago.billetes).forEach(
            ([den, cant]) => {
              if (billTotals.hasOwnProperty(den)) {
                billTotals[den] += parseInt(cant) || 0;
              }
            },
          );
        }
        if (metodo === "efectivo" && entry.detalles_pago?.vuelto) {
          Object.entries(entry.detalles_pago.vuelto).forEach(([den, cant]) => {
            if (billTotals.hasOwnProperty(den)) {
              billTotals[den] -= parseInt(cant) || 0;
            }
          });
        }
      });

      setBalance({
        payments,
        egresos: 0,
        total_ventas: totalVentas,
        billTotals,
      });
    } catch (error) {
      console.error("Error fetching balance data:", error);
      setBalance(mockBalanceData);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/balanceMensual/CreaBalanceMensual`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...manualEntry,
            monto: parseFloat(manualEntry.monto),
            cantidad: parseInt(manualEntry.cantidad),
            detalles_pago:
              manualEntry.metodo_pago === "mixto"
                ? { mixto: manualEntry.detalles_mixto }
                : null,
          }),
        },
      );

      if (response.ok) {
        alert("OPERACIÓN_EXITOSA: BALANCE ACTUALIZADO");
        setManualEntry({
          producto: "",
          monto: "",
          cantidad: 1,
          precioCompra: 0,
          marca: "",
          categoria: "",
          proveedor: "",
          metodo_pago: "transferencia",
          detalles_mixto: { efectivo: "", transferencia: "", debito: "" },
          fecha: new Date().toISOString().split("T")[0],
        });
        setShowManualForm(false);
        fetchBalanceData();
      }
    } catch (err) {
      alert("ERROR_CONEXIÓN_SERVIDOR");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAjusteArqueo = async () => {
    setIsAdjusting(true);
    try {
      const currentTotals = balance.billTotals;
      const differences = {};
      let totalDiffMonto = 0;
      let hasChanges = false;

      Object.entries(editedBillTotals).forEach(([den, newCant]) => {
        const numCant = parseInt(newCant) || 0;
        const oldCant = currentTotals[den] || 0;
        const diff = numCant - oldCant;

        if (diff !== 0) {
          differences[den] = diff;
          totalDiffMonto += diff * parseInt(den);
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        setIsEditingBills(false);
        setIsAdjusting(false);
        return;
      }

      const billetesParaSumar = {};
      const billetesParaRestar = {};

      Object.entries(differences).forEach(([den, diff]) => {
        if (diff > 0) {
          billetesParaSumar[den] = diff;
        } else if (diff < 0) {
          billetesParaRestar[den] = Math.abs(diff);
        }
      });

      const transaccionId =
        Date.now().toString(36) + Math.random().toString(36).substr(2);

      const response = await fetch(
        `${API_URL}/balanceMensual/CreaBalanceMensual`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            producto: "AJUSTE MANUAL ARQUEO DE CAJA",
            monto: totalDiffMonto,
            cantidad: 1,
            precioCompra: 0,
            marca: "SISTEMA",
            categoria: "AJUSTE",
            proveedor: "ADMIN",
            metodo_pago: "efectivo",
            detalles_pago: {
              efectivo: "",
              billetes:
                Object.keys(billetesParaSumar).length > 0
                  ? billetesParaSumar
                  : null,
              vuelto:
                Object.keys(billetesParaRestar).length > 0
                  ? billetesParaRestar
                  : null,
            },
            fecha: new Date().toISOString().split("T")[0],
            id_transaccion: transaccionId,
            cliente: "Arqueo Interno",
            origenDeVenta: "Administracion",
          }),
        },
      );

      if (response.ok) {
        alert("AJUSTE DE ARQUEO APLICADO CORRECTAMENTE.");
        setIsEditingBills(false);
        fetchBalanceData();
      } else {
        alert("ERROR AL APLICAR EL AJUSTE.");
      }
    } catch (err) {
      console.error(err);
      alert("ERROR DE CONEXIÓN AL POSTEAR AJUSTE.");
    } finally {
      setIsAdjusting(false);
    }
  };

  const handlePaymentClick = (paymentType) => {
    if (selectedPayment === paymentType) {
      setSelectedPayment(null);
      setProductsDetail([]);
      return;
    }
    setSelectedPayment(paymentType);
    const filteredProducts = allEntries
      .filter((p) => p.metodo_pago === paymentType)
      .map((p) => ({
        ...p,
        producto: p.tarjeta_digitos
          ? `${p.producto} (Tarjeta ****${p.tarjeta_digitos})`
          : p.producto,
      }));
    setProductsDetail(filteredProducts);
  };

  const tabsMenu = [
    {
      id: "balance",
      labelDesktop: "Balance Diario",
      labelMobile: "Balance",
      icon: ChartBarIcon,
    },
    {
      id: "egresos",
      labelDesktop: "Cargar Egresos",
      labelMobile: "Egresos",
      icon: MinusCircleIcon,
    },
    {
      id: "personal",
      labelDesktop: "Personal",
      labelMobile: "Personal",
      icon: UserIcon,
    },
    {
      id: "ganancias",
      labelDesktop: "Ganancias",
      labelMobile: "Ganancias",
      icon: FiTrendingUp,
    },
    {
      id: "monthlyExpenses",
      labelDesktop: "Mensuales",
      labelMobile: "Mensual",
      icon: CalendarDaysIcon,
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-sans">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center px-4">
          Inicializando Sistema...
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-12 pb-32 md:pb-8 md:mt-[-100px] min-h-screen bg-[#FAFAFA] text-gray-900 font-sans antialiased relative max-w-7xl mx-auto selection:bg-blue-600 selection:text-white">
      {/* Header Style */}
      <div className="mb-6 md:mb-10 pt-4 md:pt-0 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            SISTEMA <span className="text-gray-900">BALANCE</span>
          </h1>
          <p className="mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider break-words">
            Nodo Santa Fe /* Desarrollo Empty
          </p>
        </div>
      </div>

      {/* 1. NAVEGACIÓN DESKTOP */}
      <div className="hidden md:flex flex-row overflow-x-auto mb-6 custom-scrollbar gap-4 pb-2 w-full">
        {tabsMenu.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id 
              ? "bg-blue-600 text-white border-transparent rounded-full px-5 py-2.5 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap" 
              : "bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full px-5 py-2.5 hover:bg-gray-50 transition-all flex items-center gap-2 whitespace-nowrap"}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="w-5 h-5" />
            {tab.labelDesktop}
          </button>
        ))}
      </div>

      {/* 2. NAVEGACIÓN MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-sm flex justify-around items-center h-[72px] pb-safe px-1">
        {tabsMenu.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full active:scale-95 transition-all duration-200 ${activeTab === tab.id ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium tracking-wider">
              {tab.labelMobile}
            </span>
          </button>
        ))}
      </nav>

      {/* Área de Contenido */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-8 min-h-[500px] relative w-full overflow-x-auto">
        {activeTab === "balance" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 md:space-y-10"
          >
            {/* CABECERA DE SECCIÓN + BOTÓN CARGA MANUAL */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Resumen Operativo
                </h2>
                <span className="text-lg font-semibold text-gray-800 block mt-1">
                  Panel de Control en Vivo
                </span>
              </div>
              <button
                onClick={() => setShowManualForm(!showManualForm)}
                className={showManualForm 
                  ? "bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full px-5 py-3 md:py-2 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 w-full md:w-auto" 
                  : "bg-blue-600 text-white text-sm font-medium rounded-full px-5 py-3 md:py-2 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 w-full md:w-auto"}
              >
                {showManualForm ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <PlusIcon className="w-5 h-5" />
                )}
                <span>{showManualForm ? "Cancelar" : "Carga Manual"}</span>
              </button>
            </div>

            {/* DESGLOSE DE BILLETES (RESUMEN DE CAJA) */}
            {balance.billTotals &&
              Object.values(balance.billTotals).some((c) => c > 0) && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mt-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>
                      Arqueo de Caja Estimado
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between md:justify-start w-full md:w-auto gap-4">
                      <div className="flex items-center gap-4 bg-white px-4 py-2 border border-gray-200 rounded-full w-full md:w-auto justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Reseteo Automático
                        </span>
                        <button
                          onClick={() => {
                            const current =
                              localStorage.getItem(
                                "fedecell_reseteo_billetes_auto",
                              ) === "true";
                            localStorage.setItem(
                              "fedecell_reseteo_billetes_auto",
                              !current,
                            );
                            window.dispatchEvent(new Event("storage"));
                            setBalance((prev) => ({ ...prev }));
                          }}
                          className={`relative w-10 h-5 rounded-full transition-all duration-300 ${localStorage.getItem("fedecell_reseteo_billetes_auto") === "true" ? "bg-blue-600" : "bg-gray-200"}`}
                        >
                          <div
                            className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-300 bg-white ${localStorage.getItem("fedecell_reseteo_billetes_auto") === "true" ? "left-6" : "left-1"}`}
                          ></div>
                        </button>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${localStorage.getItem("fedecell_reseteo_billetes_auto") === "true" ? "text-blue-600" : "text-gray-400"}`}
                        >
                          {localStorage.getItem(
                            "fedecell_reseteo_billetes_auto",
                          ) === "true"
                            ? "ON"
                            : "OFF"}
                        </span>
                      </div>
                      
                      {isEditingBills ? (
                        <div className="flex gap-2 w-full md:w-auto">
                          <button
                            onClick={() => setIsEditingBills(false)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full px-5 py-3 md:py-2 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
                            disabled={isAdjusting}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleAjusteArqueo}
                            className="bg-blue-600 text-white text-sm font-medium rounded-full px-5 py-3 md:py-2 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
                            disabled={isAdjusting}
                          >
                            {isAdjusting ? "Guardando..." : "Guardar Ajuste"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditedBillTotals({ ...balance.billTotals });
                            setIsEditingBills(true);
                          }}
                          className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full px-5 py-3 md:py-2 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 w-full md:w-auto mt-4 md:mt-0"
                        >
                          Ajustar Arqueo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 w-full overflow-x-auto">
                    {Object.entries(
                      isEditingBills ? editedBillTotals : balance.billTotals,
                    )
                      .sort((a, b) => b[0] - a[0])
                      .map(([den, cant]) => (
                        <div
                          key={den}
                          className={`flex flex-col items-center justify-center p-4 border rounded-2xl min-w-[80px] ${cant > 0 || isEditingBills ? "border-gray-200 bg-white shadow-sm" : "border-gray-100 bg-white opacity-50"}`}
                        >
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            ${Number(den).toLocaleString()}
                          </span>
                          {isEditingBills ? (
                            <input
                              type="number"
                              min="0"
                              className="w-full bg-white border border-gray-200 text-center text-sm font-medium text-gray-700 p-2 outline-none rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all flex items-center justify-center"
                              value={cant}
                              onChange={(e) =>
                                setEditedBillTotals({
                                  ...editedBillTotals,
                                  [den]: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          ) : (
                            <div className="flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200">
                                {cant}
                              </span>
                            </div>
                          )}
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
                            Billetes
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* FORMULARIO DESPLEGABLE */}
            <AnimatePresence>
              {showManualForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <form
                    onSubmit={handleManualSubmit}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mt-6 shadow-sm"
                  >
                    <div className="md:col-span-3">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Descripción Producto
                      </label>
                      <input
                        name="producto"
                        value={manualEntry.producto}
                        onChange={(e) =>
                          setManualEntry({
                            ...manualEntry,
                            producto: e.target.value,
                          })
                        }
                        type="text"
                        placeholder="ID / DESCRIPCIÓN"
                        className="w-full bg-white border border-gray-200 p-3 px-4 text-sm font-medium text-gray-900 outline-none rounded-2xl transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Monto ARS
                      </label>
                      <input
                        name="monto"
                        value={manualEntry.monto}
                        onChange={(e) =>
                          setManualEntry({
                            ...manualEntry,
                            monto: e.target.value,
                          })
                        }
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-white border border-gray-200 p-3 px-4 text-sm font-medium text-gray-900 outline-none rounded-2xl transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Método
                      </label>
                      <select
                        name="metodo_pago"
                        value={manualEntry.metodo_pago}
                        onChange={(e) =>
                          setManualEntry({
                            ...manualEntry,
                            metodo_pago: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-gray-200 p-3 px-4 text-sm font-medium text-gray-900 outline-none rounded-2xl transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="transferencia">TRANSFERENCIA</option>
                        <option value="efectivo">EFECTIVO</option>
                        <option value="debito">DÉBITO</option>
                        <option value="mixto">MIXTO (2 PAGOS)</option>
                      </select>
                    </div>

                    {/* CAMPOS DINÁMICOS PARA PAGO MIXTO */}
                    {manualEntry.metodo_pago === "mixto" && (
                      <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-white border border-gray-200 mt-2 rounded-2xl">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Efectivo
                          </label>
                          <input
                            type="number"
                            placeholder="$"
                            value={manualEntry.detalles_mixto?.efectivo || ""}
                            onChange={(e) =>
                              setManualEntry({
                                ...manualEntry,
                                detalles_mixto: {
                                  ...manualEntry.detalles_mixto,
                                  efectivo: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-white border border-gray-200 p-3 px-4 text-sm font-medium text-gray-900 outline-none rounded-2xl transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Transferencia
                          </label>
                          <input
                            type="number"
                            placeholder="$"
                            value={
                              manualEntry.detalles_mixto?.transferencia || ""
                            }
                            onChange={(e) =>
                              setManualEntry({
                                ...manualEntry,
                                detalles_mixto: {
                                  ...manualEntry.detalles_mixto,
                                  transferencia: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-white border border-gray-200 p-3 px-4 text-sm font-medium text-gray-900 outline-none rounded-2xl transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Débito
                          </label>
                          <input
                            type="number"
                            placeholder="$"
                            value={manualEntry.detalles_mixto?.debito || ""}
                            onChange={(e) =>
                              setManualEntry({
                                ...manualEntry,
                                detalles_mixto: {
                                  ...manualEntry.detalles_mixto,
                                  debito: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-white border border-gray-200 p-3 px-4 text-sm font-medium text-gray-900 outline-none rounded-2xl transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <p className="md:col-span-3 text-sm font-medium text-gray-700 text-center mt-2">
                          Total Asignado: $
                          {(
                            parseFloat(
                              manualEntry.detalles_mixto?.efectivo || 0,
                            ) +
                              parseFloat(
                                manualEntry.detalles_mixto?.transferencia || 0,
                              ) +
                              parseFloat(
                                manualEntry.detalles_mixto?.debito || 0,
                              ) || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="md:col-span-5 flex justify-end pt-4 md:pt-2 mt-2 md:mt-0">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white text-sm font-medium rounded-full px-6 py-3 md:py-2 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span>
                          {isSubmitting
                            ? "Sincronizando..."
                            : "Ejecutar Transacción"}
                        </span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <PaymentsSection
              payments={balance.payments}
              onPaymentClick={handlePaymentClick}
              selectedPayment={selectedPayment}
              productsDetail={productsDetail}
              allEntries={allEntries}
              onUpdate={fetchBalanceData}
            />
          </motion.div>
        )}

        {/* Resto de secciones */}
        {activeTab === "egresos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EgressForm onSubmit={() => {}} />
          </motion.div>
        )}
        {activeTab === "personal" && <PersonalBalanceModule />}
        {activeTab === "ganancias" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SeccionGanancias entries={allEntries} />
          </motion.div>
        )}
        {activeTab === "monthlyExpenses" && <MonthlyExpenseTracker />}
      </div>

      <div className="mt-8 md:mt-12 text-center relative z-10">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider break-words px-4">
          Desarrollo Empty // CEO Tomás Manazza // {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default BalanceModule;
