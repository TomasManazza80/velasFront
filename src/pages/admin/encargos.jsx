import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlusCircle,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiX,
  FiSave,
  FiLoader,
  FiMessageCircle,
  FiChevronDown,
  FiChevronUp,
  FiPrinter,
  FiPackage,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import jsPDF from "jspdf";
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_URL}/encargos`;
const INSTANCIAS = [
  "Todos",
  "Pendiente",
  "En Proceso",
  "Finalizado",
  "Entregado",
];
const styles = {
  title: "font-bold text-2xl text-gray-900",
  tech: "text-xs font-semibold text-gray-500 uppercase tracking-wider",
  label: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block mt-1",
  input: "w-full bg-white border border-gray-200 p-2.5 px-4 text-gray-900 text-sm font-medium outline-none rounded-full transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600",
  btnBlack: "w-full md:w-auto bg-blue-600 text-white font-medium text-sm rounded-full px-5 py-2 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm",
  btnPrimary: "w-full md:w-auto bg-blue-600 text-white font-medium text-sm rounded-full px-5 py-2 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm",
};
const StatusDropdown = ({ item, isUpdating, handleInstanceJump }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ESTADO_COLOR = {
    Pendiente: "border-gray-200 text-gray-900 bg-zinc-100 font-black",
    "En Proceso": "border-gray-500 text-gray-900 bg-zinc-200 font-black",
    Finalizado: "border-gray-200 text-white bg-black font-black",
    Entregado: "border-gray-100 text-gray-500 bg-transparent font-black",
  };
  const estadoStyle =
    ESTADO_COLOR[item.estado] || "border-zinc-800 text-gray-500 bg-transparent";
  const possibleStatuses = [
    "Pendiente",
    "En Proceso",
    "Finalizado",
    "Entregado",
  ];
  return (
    <div className="relative">
      {" "}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isUpdating === item.id}
        className={`w-full text-center px-3 py-1 border text-[8px] font-['Inter'] font-black uppercase tracking-widest rounded-sm transition-all flex items-center justify-between ${estadoStyle}`}
      >
        {" "}
        <span>{item.estado}</span> <FiChevronDown className="ml-2" />{" "}
      </button>{" "}
      <AnimatePresence>
        {" "}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 right-0 mt-1 w-40 bg-white border border-gray-100 shadow-lg rounded-sm"
          >
            {" "}
            {possibleStatuses.map((status) => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.estado !== status) {
                    handleInstanceJump(item.id, status);
                  }
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-[9px] font-bold uppercase transition-colors ${item.estado === status ? "text-gray-900 font-black bg-zinc-100" : "text-gray-900/80 hover:bg-[#F8FAFC]"}`}
              >
                {status}
              </button>
            ))}{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
const EncargoCard = ({
  item,
  isUpdating,
  handleInstanceJump,
  handleEditClick,
  handleNotifyClient,
  isNotifying,
  handlePrint,
  handleDelete,
}) => (
  <motion.div
    layout
    key={item.id}
    className={`p-5 md:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm ${isUpdating === item.id ? "opacity-50" : "hover:shadow-md hover:border-gray-300"} transition-all flex flex-col`}
  >
    {" "}
    <div className="flex justify-between items-start mb-4 md:mb-5">
      {" "}
      <span className={styles.tech}>ORD_{item.numeroOrden}</span>{" "}
      <div className="text-right hidden md:block">
        {" "}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          RESPONSABLE:
        </p>{" "}
        <p className="text-xs font-bold text-gray-900 uppercase">
          {item.responsable}
        </p>{" "}
      </div>{" "}
    </div>{" "}
    <div className="mb-2">
      {" "}
      <StatusDropdown
        item={item}
        isUpdating={isUpdating}
        handleInstanceJump={handleInstanceJump}
      />{" "}
    </div>{" "}
    <h3 className="font-semibold text-base md:text-lg text-gray-900 uppercase mb-1 line-clamp-2 md:line-clamp-1 leading-tight">
      {item.descripcionTrabajo}
    </h3>{" "}
    {item.cantidad > 1 && (
      <p className="text-xs text-gray-700 font-medium mb-2">
        CANTIDAD: {item.cantidad}
      </p>
    )}{" "}
    <div className="mb-5 hidden md:flex flex-col">
      {" "}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
        CLIENTE:
      </p>{" "}
      <p className="text-xs text-gray-900 font-semibold uppercase truncate tracking-wide">
        {item.nombreCliente}
      </p>{" "}
    </div>{" "}
    {item.estado === "Finalizado" && (
      <button
        onClick={() => handleNotifyClient(item)}
        disabled={isNotifying === item.id}
        className="w-full mb-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm rounded-full transition-all px-4 py-2 flex items-center justify-center gap-2"
      >
        {" "}
        {isNotifying === item.id ? (
          <FiLoader className="animate-spin" size={14} />
        ) : (
          <>
            {" "}
            <FiMessageCircle size={14} /> NOTIFICAR LISTO{" "}
          </>
        )}{" "}
      </button>
    )}{" "}
    {item.fechaPactada && item.estado !== "Entregado" && (
      <div className="mb-4 p-3 bg-blue-50/30 border border-blue-100 rounded-xl flex items-center gap-2">
        {" "}
        <FiCalendar className="text-blue-600" size={16} />{" "}
        <p className="text-xs text-gray-700 uppercase font-medium">
          ENTREGA PACTADA: {new Date(item.fechaPactada).toLocaleDateString()}
        </p>{" "}
      </div>
    )}{" "}
    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
      {" "}
      <div className="flex flex-col">
        {" "}
        <span className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
          {" "}
          ${parseFloat(item.montoTotal).toLocaleString()}{" "}
        </span>{" "}
        {item.senado > 0 && (
          <span className="text-xs text-gray-700 font-medium">
            SEÑADO: ${parseFloat(item.senado).toLocaleString()}
          </span>
        )}{" "}
      </div>{" "}
      <div className="flex gap-2">
        {" "}
        <button
          onClick={() => handlePrint(item)}
          title="Imprimir Comprobante"
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors rounded-full"
        >
          <FiPrinter size={18} />
        </button>{" "}
        <button
          onClick={() => handleEditClick(item)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors rounded-full"
        >
          <FiEdit3 size={18} />
        </button>{" "}
        <button
          onClick={() => handleDelete(item.id, item.numeroOrden)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-full"
        >
          <FiTrash2 size={18} />
        </button>{" "}
      </div>{" "}
    </div>{" "}
  </motion.div>
);
const Encargos = () => {
  const [items, setItems] = useState([]);
  const [view, setView] = useState("list");
  const [tab, setTab] = useState("Pendiente");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [isNotifying, setIsNotifying] = useState(null);
  /* Estados para el autocompletado de clientes */
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [isClientSuggestionsVisible, setIsClientSuggestionsVisible] =
    useState(false);
  const [formData, setFormData] = useState({
    fechaIngreso: new Date().toISOString().split("T")[0],
    numeroOrden: "",
    responsable: "Admin",
    nombreCliente: "",
    celular: "",
    dni: "",
    descripcionTrabajo: "",
    montoTotal: "",
    especificaciones: "",
    direccion: "",
    cantidad: 1,
    fechaPactada: "",
    senado: 0,
    caracteristicasPedido: "",
    detallesPresupuesto: "",
    notasInternas: "",
    estado: "Pendiente",
  });
  /* --- FILTROS DE FECHA --- */
  const hoy = new Date().toISOString().split("T")[0];
  const hace90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const [startDate, setStartDate] = useState(hace90);
  const [endDate, setEndDate] = useState(hoy);
  const uniqueClients = useMemo(() => {
    if (!items || items.length === 0) return [];
    const clientMap = new Map();
    items.forEach((item) => {
      if (item.dni && !clientMap.has(item.dni)) {
        clientMap.set(item.dni, {
          dni: item.dni,
          nombreCliente: item.nombreCliente,
          celular: item.celular,
          direccion: item.direccion || "",
        });
      }
    });
    return Array.from(clientMap.values());
  }, [items]);
  const fetchItems = async (start = startDate, end = endDate) => {
    try {
      const res = await fetch(`${API_BASE}?startDate=${start}&endDate=${end}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("SYNC_ERROR", e);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleCreateClick = () => {
    setEditingId(null);
    setFormData({
      fechaIngreso: new Date().toISOString().split("T")[0],
      numeroOrden: "AUTOGENERADO",
      responsable: "Admin",
      nombreCliente: "",
      celular: "",
      dni: "",
      descripcionTrabajo: "",
      montoTotal: "",
      especificaciones: "",
      direccion: "",
      cantidad: 1,
      fechaPactada: "",
      senado: 0,
      caracteristicasPedido: "",
      detallesPresupuesto: "",
      notasInternas: "",
      estado: "Pendiente",
    });
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleInstanceJump = async (id, nuevaInstancia) => {
    setIsUpdating(id);
    try {
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevaInstancia }),
      });
      if (res.ok) {
        setTimeout(() => {
          fetchItems();
          setIsUpdating(null);
        }, 400);
      }
    } catch (e) {
      setIsUpdating(null);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          montoTotal: parseFloat(formData.montoTotal) || 0,
          senado: parseFloat(formData.senado) || 0,
          cantidad: parseInt(formData.cantidad) || 1,
        }),
      });
      if (res.ok) {
        setView("list");
        setEditingId(null);
        fetchItems();
      }
    } catch (e) {
      console.error("SAVE_ERROR", e);
    }
  };
  const handleNotifyClient = async (item) => {
    setIsNotifying(item.id);
    try {
      const res = await fetch(`${API_BASE}/${item.id}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        alert("Notificación enviada con éxito");
      } else {
        alert(`ERROR: ${data.error || "Intente nuevamente"}`);
      }
    } catch (e) {
      console.error("NOTIFY_ERROR", e);
      alert("Error de comunicación con el servidor");
    } finally {
      setIsNotifying(null);
    }
  };
  const handleDelete = async (id, numeroOrden) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar el encargo ORD_${numeroOrden}? Esta acción no se puede deshacer.`,
      )
    )
      return;
    try {
      setIsUpdating(id);
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((r) => r.id !== id));
        alert("Encargo eliminado con éxito");
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error de comunicación con el servidor");
    } finally {
      setIsUpdating(null);
    }
  };
  const handlePrint = (item) => {
    const doc = new jsPDF({ unit: "mm", format: [80, 200] });
    const centerX = 40;
    let y = 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("GESTIÓN DE ENCARGOS", centerX, y, { align: "center" });
    y += 5;
    doc.setFontSize(8);
    doc.text("Trabajos a Pedido", centerX, y, { align: "center" });
    y += 8;
    doc.setFontSize(10);
    doc.text(`Cliente: ${item.nombreCliente || "...................."}`, 5, y);
    y += 6;
    doc.text(`DNI: ${item.dni || "...................."}`, 5, y);
    y += 6;
    doc.text(`Fecha: ${item.fechaIngreso}`, 5, y);
    doc.text(`Orden: #${item.numeroOrden}`, 75, y, { align: "right" });
    y += 6;
    if (item.fechaPactada) {
      doc.setFont("helvetica", "bold");
      doc.text(`ENTREGA PACTADA: ${item.fechaPactada}`, 5, y);
      y += 6;
    }
    doc.text(
      "-------------------------------------------------------------",
      centerX,
      y,
      { align: "center" },
    );
    y += 5;
    doc.setFontSize(11);
    doc.text(`DETALLE DEL TRABAJO:`, 5, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const splitTrabajo = doc.splitTextToSize(
      `${item.cantidad}x ${item.descripcionTrabajo}`,
      70,
    );
    doc.text(splitTrabajo, 5, y);
    y += splitTrabajo.length * 5 + 5;
    if (item.especificaciones) {
      doc.setFont("helvetica", "bold");
      doc.text(`ESPECIFICACIONES:`, 5, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      const splitSpecs = doc.splitTextToSize(item.especificaciones, 70);
      doc.text(splitSpecs, 5, y);
      y += splitSpecs.length * 4 + 5;
    }
    doc.setFont("helvetica", "bold");
    doc.text(
      "-------------------------------------------------------------",
      centerX,
      y,
      { align: "center" },
    );
    y += 7;
    doc.setFontSize(12);
    doc.text(`TOTAL: $${parseFloat(item.montoTotal).toLocaleString()}`, 5, y);
    y += 6;
    if (item.senado > 0) {
      doc.text(`SEÑA: $${parseFloat(item.senado).toLocaleString()}`, 5, y);
      y += 6;
      doc.setFontSize(14);
      doc.text(
        `SALDO: $${(parseFloat(item.montoTotal) - parseFloat(item.senado)).toLocaleString()}`,
        5,
        y,
      );
      y += 8;
    }
    doc.setFontSize(10);
    doc.text("¡GRACIAS POR TU PEDIDO!", centerX, y, { align: "center" });
    const fileName = `Encargo_${item.numeroOrden}.pdf`;
    doc.save(fileName);
  };
  const handleDniChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, dni: value });
    if (value.length > 2) {
      const filtered = uniqueClients.filter(
        (client) =>
          client.dni.toLowerCase().includes(value.toLowerCase()) ||
          client.nombreCliente.toLowerCase().includes(value.toLowerCase()),
      );
      setClientSuggestions(filtered);
      setIsClientSuggestionsVisible(true);
    } else {
      setClientSuggestions([]);
      setIsClientSuggestionsVisible(false);
    }
  };
  const handleClientSelect = (client) => {
    setFormData({
      ...formData,
      dni: client.dni,
      nombreCliente: client.nombreCliente,
      celular: client.celular,
      direccion: client.direccion,
    });
    setIsClientSuggestionsVisible(false);
  };
  const filtrados = useMemo(() => {
    return items.filter((i) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        i.nombreCliente?.toLowerCase().includes(term) ||
        i.numeroOrden?.toLowerCase().includes(term) ||
        i.descripcionTrabajo?.toLowerCase().includes(term) ||
        i.responsable?.toLowerCase().includes(term) ||
        i.dni?.toLowerCase().includes(term);
      if (tab === "Todos") return matchesSearch;
      return i.estado === tab && matchesSearch;
    });
  }, [items, tab, searchTerm]);
  return (
    <div className="bg-[#FAFAFA] mt-[-100px] min-h-screen p-4 md:p-12 text-gray-900 font-sans selection:bg-blue-600 selection:text-white">
      {" "}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-6 md:pb-8 mb-6 md:mb-10 max-w-7xl mx-auto gap-5 md:gap-6">
        {" "}
        <div className="w-full text-center md:text-left">
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Encargos{" "}
            <span className="text-gray-900 block md:inline mt-1 md:mt-0">
              y Trabajos
            </span>
          </h1>{" "}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
            Gestión Operativa de Pedidos
          </p>{" "}
        </div>{" "}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {" "}
          <div className="flex flex-wrap items-end gap-2">
            {" "}
            <div className="flex flex-col">
              {" "}
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Desde
              </span>{" "}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all rounded-full"
              />{" "}
            </div>{" "}
            <div className="flex flex-col">
              {" "}
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Hasta
              </span>{" "}
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all rounded-full"
              />{" "}
            </div>{" "}
            <button
              onClick={() => fetchItems(startDate, endDate)}
              className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full px-4 py-2 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 h-[38px]"
            >
              {" "}
              FILTRAR{" "}
            </button>{" "}
          </div>{" "}
          <div className="relative w-full md:w-auto h-[38px] self-end">
            {" "}
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />{" "}
            <input
              type="text"
              placeholder="ORDEN, CLIENTE, DNI, TRABAJO..."
              className="w-full h-full bg-white border border-gray-200 pl-10 pr-4 py-2 text-sm font-medium outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 uppercase md:w-64 transition-all rounded-full text-gray-900"
              onChange={(e) => setSearchTerm(e.target.value)}
            />{" "}
          </div>{" "}
          <button onClick={handleCreateClick} className={`${styles.btnPrimary} self-end h-[38px]`}>
            {" "}
            <FiPlusCircle className="md:mr-1" size={18} /> NUEVO ENCARGO{" "}
          </button>{" "}
        </div>{" "}
      </header>{" "}
      <main className="max-w-7xl mx-auto">
        {" "}
        <AnimatePresence mode="wait">
          {" "}
          {view === "list" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {" "}
              <div className="flex gap-4 md:gap-6 mb-6 md:mb-10 border-b border-gray-200 relative overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden snap-x pb-2 w-full">
                {" "}
                {INSTANCIAS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setTab(e)}
                    className={`relative text-xs md:text-sm font-semibold uppercase tracking-wider pb-3 md:pb-4 transition-all whitespace-nowrap snap-start ${tab === e ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {" "}
                    {e}{" "}
                    {tab === e && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600"
                      />
                    )}{" "}
                  </button>
                ))}{" "}
              </div>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {" "}
                {filtrados.map((item) => (
                  <EncargoCard
                    key={item.id}
                    item={item}
                    isUpdating={isUpdating}
                    handleInstanceJump={handleInstanceJump}
                    handleEditClick={handleEditClick}
                    handleNotifyClient={handleNotifyClient}
                    isNotifying={isNotifying}
                    handlePrint={handlePrint}
                    handleDelete={handleDelete}
                  />
                ))}{" "}
              </div>{" "}
              {filtrados.length === 0 && (
                <div className="text-center py-20 border border-dashed border-gray-100 rounded-sm">
                  {" "}
                  <p className="font-['Inter'] text-gray-400 text-xs uppercase tracking-widest">
                    No hay encargos en esta sección
                  </p>{" "}
                </div>
              )}{" "}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 md:p-12 border border-gray-100 max-w-6xl mx-auto shadow-sm rounded-2xl"
            >
              {" "}
              <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
                {" "}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-gray-100 pb-6 md:pb-8 gap-4 relative">
                  {" "}
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 w-full">
                    {" "}
                    <h2 className={`${styles.title} text-2xl md:text-3xl`}>
                      {" "}
                      {editingId ? "Editar Encargo" : "Nuevo Registro"}{" "}
                    </h2>{" "}
                    <span className="bg-[#F8FAFC] text-gray-700 font-medium text-xs rounded-xl border border-gray-200 shadow-sm transition-all px-3 py-1 font-['Inter'] self-start">
                      {" "}
                      ORD_
                      {editingId ? formData.numeroOrden : "AUTOGENERADO"}{" "}
                    </span>{" "}
                  </div>{" "}
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className="p-2 text-gray-400 hover:text-[#0A58CA] bg-[#F8FAFC] hover:bg-[#F4F7FE] rounded-xl transition-all"
                  >
                    {" "}
                    <FiX size={24} />{" "}
                  </button>{" "}
                </div>{" "}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                  {" "}
                  <div className="space-y-6">
                    {" "}
                    <h4 className="text-sm font-semibold border-l-4 border-[#0A58CA] pl-4 uppercase font-['Inter'] text-gray-900">
                      01 Administración
                    </h4>{" "}
                    <div>
                      <label className={styles.label}>Responsable</label>
                      <input
                        className={styles.input}
                        type="text"
                        value={formData.responsable}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            responsable: e.target.value,
                          })
                        }
                      />
                    </div>{" "}
                    <div>
                      <label className={styles.label}>Fecha Ingreso</label>
                      <input
                        className={styles.input}
                        type="date"
                        value={formData.fechaIngreso}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fechaIngreso: e.target.value,
                          })
                        }
                      />
                    </div>{" "}
                    <div>
                      <label className={styles.label}>
                        Fecha Pactada Entrega
                      </label>
                      <input
                        className={styles.input}
                        type="date"
                        value={formData.fechaPactada}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fechaPactada: e.target.value,
                          })
                        }
                      />
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-6">
                    {" "}
                    <h4 className="text-sm font-semibold border-l-4 border-[#0A58CA] pl-4 uppercase font-['Inter'] text-gray-900">
                      02 Cliente
                    </h4>{" "}
                    <div className="relative">
                      {" "}
                      <label className={styles.label}>DNI / Nombre</label>{" "}
                      <input
                        className={styles.input}
                        type="text"
                        value={formData.dni}
                        onChange={handleDniChange}
                        onFocus={() =>
                          formData.dni && setIsClientSuggestionsVisible(true)
                        }
                        onBlur={() =>
                          setTimeout(
                            () => setIsClientSuggestionsVisible(false),
                            150,
                          )
                        }
                      />{" "}
                      <AnimatePresence>
                        {" "}
                        {isClientSuggestionsVisible &&
                          clientSuggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute z-30 w-full mt-1 bg-white border border-gray-100 shadow-sm rounded-xl max-h-48 overflow-y-auto"
                            >
                              {" "}
                              {clientSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onMouseDown={() =>
                                    handleClientSelect(suggestion)
                                  }
                                  className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-[#F8FAFC] transition-colors border-b border-gray-50 last:border-0"
                                >
                                  {" "}
                                  <p className="font-semibold uppercase">
                                    {suggestion.nombreCliente}
                                  </p>{" "}
                                  <p className="text-gray-500 font-medium text-xs">
                                    {suggestion.dni}
                                  </p>{" "}
                                </button>
                              ))}{" "}
                            </motion.div>
                          )}{" "}
                      </AnimatePresence>{" "}
                    </div>{" "}
                    <div>
                      <label className={styles.label}>Nombre Cliente</label>
                      <input
                        className={styles.input}
                        type="text"
                        value={formData.nombreCliente}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nombreCliente: e.target.value,
                          })
                        }
                      />
                    </div>{" "}
                    <div>
                      <label className={styles.label}>WhatsApp / Celular</label>
                      <input
                        className={styles.input}
                        type="tel"
                        value={formData.celular}
                        onChange={(e) =>
                          setFormData({ ...formData, celular: e.target.value })
                        }
                      />
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-6">
                    {" "}
                    <h4 className="text-sm font-semibold border-l-4 border-[#0A58CA] pl-4 uppercase font-['Inter'] text-gray-900">
                      03 Trabajo
                    </h4>{" "}
                    <div>
                      <label className={styles.label}>
                        Descripción del Trabajo
                      </label>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="Ej: 100 velas vainilla"
                        value={formData.descripcionTrabajo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descripcionTrabajo: e.target.value,
                          })
                        }
                      />
                    </div>{" "}
                    <div>
                      <label className={styles.label}>Cantidad</label>
                      <input
                        className={styles.input}
                        type="number"
                        value={formData.cantidad}
                        onChange={(e) =>
                          setFormData({ ...formData, cantidad: e.target.value })
                        }
                      />
                    </div>{" "}
                    <div>
                      <label className={styles.label}>Especificaciones</label>
                      <textarea
                        className={`${styles.input} h-24 resize-none`}
                        value={formData.especificaciones}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            especificaciones: e.target.value,
                          })
                        }
                      />
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                  {" "}
                  <div className="bg-[#F8FAFC] p-6 md:p-8 border border-gray-100 rounded-2xl space-y-6">
                    {" "}
                    <h4 className="text-sm font-semibold border-l-4 border-[#0A58CA] pl-4 uppercase font-['Inter'] text-gray-900 flex items-center gap-2">
                      <FiDollarSign /> Finanzas
                    </h4>{" "}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {" "}
                      <div>
                        {" "}
                        <label className={styles.label}>
                          Monto Total ($)
                        </label>{" "}
                        <input
                          className="w-full bg-white border border-gray-200 p-2.5 px-4 text-gray-900 font-['Inter'] font-bold text-xl outline-none rounded-xl focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA] transition-all"
                          type="number"
                          value={formData.montoTotal}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              montoTotal: e.target.value,
                            })
                          }
                        />{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <label className={styles.label}>
                          Seña / Adelanto ($)
                        </label>{" "}
                        <input
                          className="w-full bg-white border border-gray-200 p-2.5 px-4 text-gray-900 font-['Inter'] font-bold text-xl outline-none rounded-xl focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA] transition-all"
                          type="number"
                          value={formData.senado}
                          onChange={(e) =>
                            setFormData({ ...formData, senado: e.target.value })
                          }
                        />{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="pt-4 border-t border-gray-50">
                      {" "}
                      <p className="font-['Inter'] text-xs font-medium text-gray-700 uppercase">
                        Saldo Pendiente
                      </p>{" "}
                      <p className="text-2xl font-bold font-['Inter'] text-gray-900">
                        $
                        {(
                          parseFloat(formData.montoTotal || 0) -
                          parseFloat(formData.senado || 0)
                        ).toLocaleString()}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="space-y-6">
                    {" "}
                    <h4 className="text-sm font-semibold border-l-4 border-[#0A58CA] pl-4 uppercase font-['Inter'] text-gray-900">
                      Notas Internas
                    </h4>{" "}
                    <textarea
                      className={`${styles.input} h-full min-h-[150px] resize-none`}
                      placeholder="Detalles de proveedores, materiales sobrantes, etc..."
                      value={formData.notasInternas}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notasInternas: e.target.value,
                        })
                      }
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="pt-10 flex flex-col md:flex-row justify-end gap-5">
                  {" "}
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm rounded-xl transition-all"
                  >
                    Cancelar
                  </button>{" "}
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-[#0A58CA] text-white font-medium text-sm rounded-xl shadow-sm hover:bg-[#084298] transition-all flex items-center justify-center gap-3"
                  >
                    {" "}
                    <FiSave size={18} />{" "}
                    {editingId ? "ACTUALIZAR ENCARGO" : "REGISTRAR PEDIDO"}{" "}
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </motion.div>
          )}{" "}
        </AnimatePresence>{" "}
      </main>{" "}
    </div>
  );
};
export default Encargos;
