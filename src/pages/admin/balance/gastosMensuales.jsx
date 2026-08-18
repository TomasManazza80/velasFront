import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiPlusCircle,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiTrash2,
  FiRefreshCw,
  FiClock,
  FiDollarSign,
  FiCreditCard,
  FiSmartphone,
  FiCalendar,
  FiEdit,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
const API_URL = import.meta.env.VITE_API_URL;

// --- CONFIGURACIÓN TÉCNICA DE RUTAS ---
const API_BASE = `${API_URL}/gastosMensuales`;
const API_BALANCE_URL = `${API_URL}/balanceMensual/CreaBalanceMensual`;
const API_RESPONSABLES = `${API_URL}/egresos/responsables`;

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

// Mismos apartados que el módulo de egresos
const medioLabels = {
  efectivo: "EFECTIVO (CAJA)",
  debito: "TARJETA DE DÉBITO",
  tarjeta_credito: "TARJETA DE CRÉDITO",
  transferencia: "TRANSFERENCIA",
  credito_1: "CRÉDITO 1 CUOTA",
  credito_2: "CRÉDITO 2 CUOTAS",
  credito_3: "CRÉDITO 3 CUOTAS",
  credito_4: "CRÉDITO 4 CUOTAS",
  credito_5: "CRÉDITO 5 CUOTAS",
  credito_6: "CRÉDITO 6 CUOTAS",
  mixto: "PAGOS MIXTOS",
};

const MonthlyExpenseTracker = () => {
  const [expenseList, setExpenseList] = useState([]);
  const [view, setView] = useState("list"); // 'list' | 'form'
  const [searchTerm, setSearchTerm] = useState("");
  const [syncingId, setSyncingId] = useState(null);
  const [selectingSourceId, setSelectingSourceId] = useState(null);
  const [overallBalance, setOverallBalance] = useState({});
  const [isResetting, setIsResetting] = useState(false);

  // Form fields for new/edit expense
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [medio, setMedio] = useState("efectivo");
  const [vencimiento, setVencimiento] = useState("");
  const [responsable, setResponsable] = useState("");
  const [responsablesList, setResponsablesList] = useState([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/obtenerGastosMensuales`);
      setExpenseList(res.data);
    } catch (e) {
      console.error("FETCH_ERROR", e);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/balanceMensual/ObtenBalanceMensual`,
      );
      const data = res.data || [];
      const totals = {
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
        mixtos: 0,
      };

      data.forEach((entry) => {
        const monto = parseFloat(entry.monto) || 0;
        const metodo = entry.metodo_pago;

        if (metodo === "mixto" && entry.detalles_pago?.mixto) {
          const mixtoData = entry.detalles_pago.mixto;
          if (mixtoData.efectivo)
            totals.efectivo += parseFloat(mixtoData.efectivo) || 0;
          if (mixtoData.transferencia)
            totals.transferencia += parseFloat(mixtoData.transferencia) || 0;
          if (mixtoData.debito)
            totals.debito += parseFloat(mixtoData.debito) || 0;
        } else if (totals.hasOwnProperty(metodo)) {
          totals[metodo] += monto;
        }
      });
      setOverallBalance(totals);
    } catch (e) {
      console.error("FETCH_BALANCE_ERROR", e);
    }
  };

  const fetchResponsables = async () => {
    try {
      const res = await axios.get(API_RESPONSABLES);
      setResponsablesList(
        Array.isArray(res.data) ? res.data.map((r) => r.nombre) : [],
      );
    } catch (e) {
      console.error("Error fetching responsables:", e);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBalance();
    fetchResponsables();
  }, []);

  const confirmPaymentWithSource = async (id, source) => {
    const expense = expenseList.find((ex) => ex.MonthlyExpenseId === id);
    if (!expense) return;

    // VERIFICACIÓN DE FONDOS
    const available = overallBalance[source] || 0;
    if (available < expense.monto) {
      alert(
        `SITUACIÓN_ALERTA: Fondos insuficientes en ${medioLabels[source] || source}.\nSaldo disponible: $${available.toLocaleString()}\nMonto a pagar: $${parseFloat(expense.monto).toLocaleString()}`,
      );
      setSelectingSourceId(null);
      return;
    }

    setSyncingId(id);
    setSelectingSourceId(null);
    try {
      await axios.put(`${API_BASE}/confirmarPago/${id}`, {
        medio_pago: source,
      });
      // Descontar del balance mensual (monto negativo)
      await axios.post(API_BALANCE_URL, {
        producto: `PAGO_GASTO: ${expense.nombre}`,
        monto: -parseFloat(expense.monto),
        cantidad: 1,
        metodo_pago: source,
        fecha: new Date().toISOString().split("T")[0],
      });

      setTimeout(() => {
        fetchExpenses();
        fetchBalance();
        setSyncingId(null);
      }, 500);
    } catch (e) {
      setSyncingId(null);
    }
  };

  const handleRevertPayment = async (id) => {
    setSyncingId(id);
    try {
      await axios.put(`${API_BASE}/confirmarPago/${id}`);
      fetchExpenses();
      setSyncingId(null);
    } catch (e) {
      setSyncingId(null);
    }
  };

  const handleResetMonth = async () => {
    if (
      !window.confirm(
        "¿ATENCIÓN: REINICIAR_MES? Esto marcará TODOS los gastos fijos como PENDIENTES de pago para el nuevo mes. ¿Continuar?",
      )
    )
      return;
    setIsResetting(true);
    try {
      await axios.put(`${API_BASE}/resetGastos`);
      await fetchExpenses();
      alert("ÉXITO: Todos los gastos han sido reiniciados para el nuevo mes.");
    } catch (e) {
      console.error("ERROR_RESET_MONTH", e);
      alert("ERROR: No se pudieron reiniciar los gastos.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingId(expense.MonthlyExpenseId);
    setNombre(expense.nombre);
    setMonto(expense.monto);
    // Aseguramos que la fecha esté en formato YYYY-MM-DD para el input
    const formattedDate = expense.vencimiento
      ? new Date(expense.vencimiento).toISOString().split("T")[0]
      : "";
    setVencimiento(formattedDate);
    setMedio(expense.medio_pago || "efectivo");
    setResponsable(expense.responsable || "");
    setView("form");
  };

  const handleNotify = async (expense) => {
    const phone = prompt(
      "Ingrese el número de WhatsApp para notificar (ej: 5491166778899):",
    );
    if (!phone) return;
    try {
      await axios.post(`${API_BASE}/notificar/${expense.MonthlyExpenseId}`, {
        phoneNumber: phone,
      });
      alert("Notificación enviada con éxito.");
    } catch (e) {
      alert(e.response?.data?.error || "Error al enviar notificación.");
    }
  };

  const formatTechDate = (dateString) => {
    if (!dateString) return "NO_MOD";
    const date = new Date(dateString);
    return date
      .toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", " //");
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return "ST_UNDEFINED";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // --- CREAR/EDITAR GASTO MENSUAL ---
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Modo Edición
        await axios.put(`${API_BASE}/actualizarGasto/${editingId}`, {
          nombre,
          monto: parseFloat(monto),
          vencimiento,
          medio_pago: medio,
          responsable: responsable.toUpperCase(),
        });
        setEditingId(null);
      } else {
        // Modo Creación
        await axios.post(`${API_BASE}/crearGastoMensual`, {
          nombre,
          monto: parseFloat(monto),
          vencimiento,
          medio_pago: medio,
          responsable: responsable.toUpperCase(),
        });
      }

      // Limpiar formulario y volver a lista
      setNombre("");
      setMonto("");
      setVencimiento("");
      setMedio("efectivo");
      setResponsable("");
      fetchExpenses();
      setView("list");
    } catch (err) {
      console.error("SAVE_EXPENSE_ERROR", err);
    }
  };

  const filtered = expenseList.filter((ex) =>
    ex.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      className={`bg-transparent min-h-screen p-10 font-sans font-medium text-gray-900`}
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-20 gap-6">
        <div>
          <h2 className={styles.title + " text-4xl md:text-6xl"}>
            GASTOS_FIJOS
          </h2>
          <div className="h-1 w-24 bg-white mt-4 shadow-[0_0_20px_rgba(255,255,255,0.6)]"></div>
          <p className={styles.tech + " mt-6 text-gray-900"}>
            Control_de_Origen // Registro_v6.0
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button
            onClick={handleResetMonth}
            disabled={isResetting}
            className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full px-4 py-2 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <FiRefreshCw
              className={isResetting ? "animate-spin text-gray-900" : "text-gray-900"}
            />
            {isResetting ? "PROCESANDO..." : "REINICIAR_MES"}
          </button>
          <button
            onClick={() => {
              setView(view === "list" ? "form" : "list");
              setEditingId(null);
            }}
            className={`${styles.btnBw} w-full md:w-auto`}
          >
            {view === "list" ? "NUEVO_REGISTRO" : "VOLVER"}
          </button>
        </div>
      </header>

      {view === "list" && (
        <div className="space-y-6">
          <div className={`${styles.glass} p-4 flex items-center gap-4`}>
            <FiSearch className="text-gray-900" />
            <input
              type="text"
              placeholder="BUSCAR_CONCEPTO..."
              className="bg-white border-none outline-none text-gray-900 text-xs w-full uppercase font-sans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={`${styles.glass} overflow-x-auto custom-scrollbar`}>
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 font-sans text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-6">Concepto_de_Servicio</th>
                  <th className="p-6">Responsable</th>
                  <th className="p-6">Fecha_Límite</th>
                  <th className="p-6">Estatus_Pago</th>
                  <th className="p-6">Acción_Principal</th>
                  <th className="p-6">Herramientas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans text-sm">
                {filtered.map((expense) => (
                  <tr
                    key={expense.MonthlyExpenseId}
                    className={`transition-all duration-300 hover:bg-gray-50 ${expense.pagado ? "bg-green-50" : ""}`}
                  >
                    <td className="p-6">
                      <p className="text-gray-900 font-[900] text-sm uppercase tracking-tighter">
                        {expense.nombre}
                      </p>
                      <p className="text-gray-900 font-black mt-1 text-[12px]">
                        ${parseFloat(expense.monto).toLocaleString()}
                      </p>
                    </td>
                    <td className="p-6 uppercase text-gray-500 text-xs">
                      {expense.responsable || "-"}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <FiCalendar className="text-gray-900" size={16} />
                        <p className="text-gray-900 font-[900] text-[13px] tracking-widest">
                          {formatDeadline(expense.vencimiento)}
                        </p>
                      </div>
                      <p className="text-gray-500 text-[8px] font-black mt-1 uppercase tracking-widest">
                        PROX_VENCIMIENTO
                      </p>
                    </td>
                    <td className="p-6">
                      {expense.pagado ? (
                        <div className="flex flex-col">
                          <span className="text-green-500 font-black">
                            COMPLETADO
                          </span>
                          <span className="text-gray-500 text-xs">
                            {medioLabels[expense.medio_pago] ||
                              expense.medio_pago}
                          </span>
                        </div>
                      ) : (
                        <span className="text-red-500 font-black">
                          PENDIENTE
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      {syncingId === expense.MonthlyExpenseId ? (
                        <div className="flex items-center gap-2 text-gray-900 animate-pulse font-bold">
                          <FiRefreshCw className="animate-spin" /> PROCESANDO...
                        </div>
                      ) : selectingSourceId === expense.MonthlyExpenseId ? (
                        <div className="flex flex-wrap gap-2 animate-in fade-in zoom-in duration-300">
                          {Object.keys(medioLabels).map((m) => (
                            <button
                              key={m}
                              onClick={() =>
                                confirmPaymentWithSource(
                                  expense.MonthlyExpenseId,
                                  m,
                                )
                              }
                              className="bg-white hover:bg-white hover:text-black border border-gray-200 p-2 text-xs uppercase tracking-tighter transition-all font-bold"
                            >
                              {medioLabels[m]}
                            </button>
                          ))}
                          <button
                            onClick={() => setSelectingSourceId(null)}
                            className="p-2 text-red-500 hover:bg-red-50"
                          >
                            <FiXCircle />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (expense.pagado) {
                              handleRevertPayment(expense.MonthlyExpenseId);
                            } else {
                              setSelectingSourceId(expense.MonthlyExpenseId);
                            }
                          }}
                          className={
                            expense.pagado ? styles.btnPaid : styles.btnPending
                          }
                        >
                          {expense.pagado ? (
                            <>
                              <FiCheckCircle /> PAGADO (REVERTIR)
                            </>
                          ) : (
                            <>
                              <FiDollarSign /> PAGAR_AHORA
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleNotify(expense)}
                          className="p-2 text-gray-500 hover:text-gray-900 transition-all"
                          title="Notificar WhatsApp"
                        >
                          <FiSmartphone className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="p-2 text-gray-500 hover:text-gray-900 transition-all"
                          title="Editar Gasto Fijo"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "¿ELIMINAR_REGISTRO? Esta acción no se puede deshacer.",
                              )
                            )
                              return;
                            try {
                              await axios.delete(
                                `${API_BASE}/eliminarGastoMensual/${expense.MonthlyExpenseId}`,
                              );
                              fetchExpenses();
                            } catch (e) {
                              console.error("DELETE_ERROR", e);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-all font-black"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "form" && (
        <div className={styles.glass + " p-6 md:p-20"}>
          <form className="space-y-12" onSubmit={handleCreateExpense}>
            <div className="border-l-4 border-gray-200 pl-8">
              <h3 className={styles.title + " text-5xl mb-2"}>
                {editingId ? "EDITAR_GASTO" : "NUEVO_GASTO_MENSUAL"}
              </h3>
              <p className={styles.tech}>
                {editingId
                  ? `MODIFICACIÓN_DE_ID: ${editingId}`
                  : "REGISTRO_DE_NUEVO_FLUJO"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className={styles.tech}>CONCEPTO</label>
                <input
                  type="text"
                  value={nombre}
                  required
                  onChange={(e) => setNombre(e.target.value)}
                  className={styles.input + " h-20 text-2xl font-bold"}
                  placeholder="Ej: Alquiler Local"
                />
              </div>
              <div className="space-y-4 relative">
                <label className={styles.tech}>RESPONSABLE_DEL_PAGO</label>
                <input
                  type="text"
                  value={responsable}
                  required
                  onChange={(e) => setResponsable(e.target.value)}
                  onFocus={() => setIsSuggestionsVisible(true)}
                  onBlur={() =>
                    setTimeout(() => setIsSuggestionsVisible(false), 200)
                  }
                  className={styles.input + " h-20 text-lg uppercase"}
                  placeholder="NOMBRE A QUIEN CORRESPONDE"
                  autoComplete="off"
                />
                <AnimatePresence>
                  {isSuggestionsVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
                    >
                      {responsablesList
                        .filter(
                          (r) =>
                            !responsable ||
                            r.toLowerCase().includes(responsable.toLowerCase()),
                        )
                        .map((name, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={() => {
                              setResponsable(name);
                              setIsSuggestionsVisible(false);
                            }}
                            className="w-full text-left px-6 py-4 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors border-b border-gray-200 last:border-0 font-sans uppercase font-bold tracking-wide"
                          >
                            {name}
                          </button>
                        ))}
                      {responsablesList.filter(
                        (r) =>
                          !responsable ||
                          r.toLowerCase().includes(responsable.toLowerCase()),
                      ).length === 0 && (
                        <div className="p-4 text-xs text-gray-500 text-center uppercase tracking-widest font-sans font-bold">
                          NUEVO REGISTRO
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="space-y-4">
                <label className={styles.tech}>MONTO_MENSUAL (ARS)</label>
                <input
                  type="number"
                  step="0.01"
                  value={monto}
                  required
                  onChange={(e) => setMonto(e.target.value)}
                  className={styles.input + " h-20 text-3xl font-black"}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-4">
                <label className={styles.tech}>FECHA_DE_VENCIMIENTO</label>
                <input
                  type="date"
                  value={vencimiento}
                  required
                  onChange={(e) => setVencimiento(e.target.value)}
                  className={styles.input + " h-20"}
                />
              </div>
              <div className="space-y-4">
                <label className={styles.tech}>MODALIDAD_DEFAULT</label>
                <select
                  value={medio}
                  onChange={(e) => setMedio(e.target.value)}
                  className={
                    styles.input +
                    " h-20 bg-zinc-900 font-sans font-black text-xs tracking-widest uppercase cursor-pointer"
                  }
                >
                  {Object.keys(medioLabels).map((key) => (
                    <option key={key} value={key}>
                      {medioLabels[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setView("list");
                  setEditingId(null);
                }}
                className="flex-1 border border-gray-200 text-gray-900 font-sans font-black py-4 uppercase text-xs tracking-widest hover:bg-white transition-all"
              >
                CANCELAR_OPERACIÓN
              </button>
              <button
                type="submit"
                className={`flex-[2] ${styles.btnBw} h-24 text-sm tracking-[0.5em]`}
              >
                {editingId ? "ACTUALIZAR_REGISTRO" : "REGISTRAR_GASTO"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MonthlyExpenseTracker;
