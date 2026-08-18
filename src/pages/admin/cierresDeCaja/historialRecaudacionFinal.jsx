import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiSearch,
  FiPackage,
  FiTrendingUp,
  FiShoppingBag,
  FiGlobe,
  FiHome,
  FiClock,
  FiStar,
  FiChevronRight,
  FiLoader,
  FiCalendar,
  FiChevronsDown,
  FiChevronsUp,
  FiSmartphone,
  FiActivity,
  FiUser,
} from "react-icons/fi";
const API_URL = import.meta.env.VITE_API_URL;
const API_URL_RECAUDACION = `${API_URL}/recaudacionFinal`;
/* --- UTILIDADES --- */
const formatCurrency = (amount) => {
  return (Number(amount) || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
};
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};
/* --- ESTILOS MONOCHROME (INTER) --- */
const styles = {
  label:
    "font-['Inter'] text-[10px] md:text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2 block",
  title: "font-['Inter'] font-bold uppercase tracking-tight text-gray-900",
  techValue: "font-['Inter'] font-bold text-gray-900 tracking-tight",
  glassCard: "bg-white border border-gray-100 shadow-2xl",
  tabActive:
    "bg-white text-gray-900 font-['Inter'] font-bold text-[10px] tracking-widest px-4 md:px-8 py-4 md:py-3 flex-1 md:flex-none transition-all duration-300",
  tabInactive:
    "text-gray-700 hover:text-gray-900 font-['Inter'] font-bold text-[10px] tracking-widest px-4 md:px-8 py-4 md:py-3 border border-gray-50 flex-1 md:flex-none transition-all duration-300",
};
/* --- 1. COMPONENTE: RASTREADOR AVANZADO --- */
const ProductTrackerAdvanced = ({ recaudaciones }) => {
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const productMatches = useMemo(() => {
    if (!query || query.length < 2) return [];
    const matches = new Set();
    recaudaciones.forEach((cierre) => {
      (cierre.productosVendidos || []).forEach((p) => {
        if (p.nombreProducto?.toLowerCase().includes(query.toLowerCase()))
          matches.add(p.nombreProducto);
      });
    });
    return Array.from(matches).slice(0, 5);
  }, [query, recaudaciones]);
  const productStats = useMemo(() => {
    if (!selectedProduct) return null;
    let totalUnits = 0,
      totalRevenue = 0,
      totalProfit = 0,
      history = [],
      ecommUnits = 0,
      localUnits = 0;
    recaudaciones.forEach((cierre) => {
      (cierre.productosVendidos || []).forEach((p) => {
        if (p.nombreProducto === selectedProduct) {
          const canal = p.canal || "LOCAL";
          const costo =
            (parseFloat(p.precioCompra) || 0) *
            (parseInt(p.cantidadComprada) || 1);
          const ganancia = (parseFloat(p.monto) || 0) - costo;
          history.push({
            ...p,
            fecha: cierre.createdAt,
            idCierre: cierre.id,
            canal,
            ganancia,
          });
          totalUnits += p.cantidadComprada;
          totalRevenue += p.monto;
          totalProfit += ganancia;
          if (canal === "ECOMMERCE") ecommUnits += p.cantidadComprada;
          else localUnits += p.cantidadComprada;
        }
      });
    });
    return {
      name: selectedProduct,
      totalUnits,
      totalRevenue,
      totalProfit,
      ecommUnits,
      localUnits,
      history: history.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    };
  }, [selectedProduct, recaudaciones]);
  return (
    <div className="mb-8 md:mb-16 p-5 md:p-10 bg-[#F8FAFC] border border-gray-50 shadow-2xl relative overflow-hidden rounded-none">
      {" "}
      <h3
        className={`${styles.label} text-gray-900 flex items-center gap-3 mb-6 md:mb-10`}
      >
        {" "}
        <FiSearch size={18} /> RASTREADOR_SISTEMA{" "}
      </h3>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
        {" "}
        <div className="lg:col-span-4 space-y-4">
          {" "}
          <input
            type="text"
            placeholder="BUSCAR EQUIPO..."
            className="w-full bg-[#F4F7FE] border border-gray-100 py-4 px-6 text-xs font-bold tracking-widest focus:border-white outline-none text-gray-900 uppercase rounded-none transition-all placeholder:text-gray-400"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedProduct(null);
            }}
          />{" "}
          {productMatches.length > 0 && !selectedProduct && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
              {" "}
              {productMatches.map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedProduct(name)}
                  className="w-full flex justify-between items-center p-4 bg-white/20 border border-gray-50 hover:bg-white hover:text-gray-900 transition-all text-[11px] font-bold text-gray-400 uppercase"
                >
                  {" "}
                  <span>{name}</span>
                  <FiChevronRight />{" "}
                </button>
              ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
        <div className="lg:col-span-8">
          {" "}
          {productStats ? (
            <div className="animate-in zoom-in-95 space-y-6">
              {" "}
              <div className="bg-[#F4F7FE] p-6 md:p-8 border-l-2 border-white">
                {" "}
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 gap-4">
                  {" "}
                  <div>
                    <p className={styles.label}>ID_REGISTRO</p>
                    <h4 className={`${styles.title} text-xl md:text-3xl`}>
                      {productStats.name}
                    </h4>
                  </div>{" "}
                  <div className="flex gap-6 md:gap-10 w-full md:w-auto justify-between md:justify-end border-t border-gray-50 pt-4 md:border-0 md:pt-0">
                    {" "}
                    <div className="text-right">
                      {" "}
                      <p className={styles.label}>Recaudación</p>{" "}
                      <p className="text-lg md:text-2xl font-bold text-gray-900">
                        {formatCurrency(productStats.totalRevenue)}
                      </p>{" "}
                    </div>{" "}
                    <div className="text-right">
                      {" "}
                      <p className={styles.label}>Ganancia</p>{" "}
                      <p className="text-lg md:text-2xl font-bold text-gray-900 decoration-white underline underline-offset-4">
                        {formatCurrency(productStats.totalProfit)}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {" "}
                  <div className="bg-[#F8FAFC] p-3 md:p-4 border border-gray-50 text-center">
                    <p className={styles.label}>Total</p>
                    <p className="text-sm md:text-xl font-bold text-gray-900">
                      {productStats.totalUnits} U
                    </p>
                  </div>{" "}
                  <div className="bg-[#F8FAFC] p-3 md:p-4 border border-gray-50 text-center">
                    <p className={styles.label}>E-comm</p>
                    <p className="text-sm md:text-xl font-bold text-gray-900 opacity-40">
                      {productStats.ecommUnits} U
                    </p>
                  </div>{" "}
                  <div className="bg-white text-gray-900 p-3 md:p-4 text-center">
                    <p className="text-[10px] font-bold uppercase mb-1">
                      Local
                    </p>
                    <p className="text-sm md:text-xl font-bold">
                      {productStats.localUnits} U
                    </p>
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-1">
                {" "}
                {productStats.history.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white/20 border border-gray-50"
                  >
                    {" "}
                    <div className="flex items-center gap-4">
                      {" "}
                      <FiClock className="text-gray-500" />{" "}
                      <div>
                        {" "}
                        <p className="text-[10px] md:text-[11px] font-bold text-gray-900">
                          {formatDateTime(v.fecha)}
                        </p>{" "}
                        <p className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">
                          {v.canal}
                        </p>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="text-right">
                      {" "}
                      <p className="text-xs md:text-sm font-bold text-gray-900">
                        {formatCurrency(v.monto)}
                      </p>{" "}
                      <p className="text-[8px] text-gray-500 font-bold">
                        CANT: {v.cantidadComprada}
                      </p>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </div>
          ) : (
            <div className="h-48 md:h-[300px] flex flex-col items-center justify-center border border-gray-50 text-gray-400 bg-black/40">
              {" "}
              <FiActivity size={30} className="mb-4 opacity-10" />{" "}
              <span className="text-[9px] tracking-widest font-bold uppercase text-gray-500">
                Awaiting_Data_Selection
              </span>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
/* --- 2. COMPONENTE: RANKING TOP 10 --- */
const TopProductosView = ({ datos }) => {
  const topVendidos = useMemo(() => {
    const ranking = {};
    datos.forEach((reg) => {
      (reg.productosVendidos || []).forEach((p) => {
        const n = p.nombreProducto || "S/N";
        if (ranking[n]) {
          ranking[n].cantidad += p.cantidadComprada;
          ranking[n].total += p.monto;
        } else
          ranking[n] = {
            nombre: n,
            cantidad: p.cantidadComprada,
            total: p.monto,
          };
      });
    });
    return Object.values(ranking)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }, [datos]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-in slide-in-from-bottom-6 duration-700">
      {" "}
      <div className="space-y-1">
        {" "}
        <h3
          className={`${styles.label} text-gray-900 flex items-center gap-3 mb-4 md:mb-6`}
        >
          {" "}
          <FiTrendingUp /> RANKING_RENDIMIENTO{" "}
        </h3>{" "}
        {topVendidos.map((prod, i) => (
          <div
            key={i}
            className="relative flex items-center justify-between p-4 md:p-5 bg-white border border-gray-50 transition-all hover:bg-[#F8FAFC] group"
          >
            {" "}
            <div className="flex items-center gap-4 md:gap-6">
              {" "}
              <span className="text-xl md:text-3xl font-bold text-gray-900 transition-colors">
                {(i + 1).toString().padStart(2, "0")}
              </span>{" "}
              <div>
                {" "}
                <p className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-tight">
                  {prod.nombre}
                </p>{" "}
                <p className="text-[9px] text-gray-700 font-bold">
                  VOL: {formatCurrency(prod.total)}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="text-right">
              {" "}
              <p className="text-xl md:text-2xl font-bold text-gray-900 leading-none">
                {prod.cantidad}
              </p>{" "}
              <p className="text-[8px] text-gray-500 font-bold uppercase">
                Units
              </p>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      <div className="bg-white p-6 md:p-10 flex flex-col items-center justify-center text-center order-first lg:order-last">
        {" "}
        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0A58CA] text-gray-900 font-medium text-sm rounded-xl shadow-sm hover:bg-[#084298] transition-all flex items-center justify-center mb-6 shadow-2xl">
          <FiStar size={32} />
        </div>{" "}
        <h4 className="font-['Inter'] font-bold text-gray-900 text-xl md:text-2xl mb-2 uppercase tracking-tight">
          Market_Leader
        </h4>{" "}
        <p className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mb-6 md:mb-10">
          Peak Performance Analysis
        </p>{" "}
        <div className="p-6 md:p-8 bg-[#F8FAFC] w-full rounded-xl">
          {" "}
          <p className="text-lg md:text-2xl font-bold text-gray-900 uppercase tracking-tight">
            {topVendidos[0]?.nombre || "NO_DATA"}
          </p>{" "}
          <div className="h-[2px] bg-[#F4F7FE] my-4 md:my-6" />{" "}
          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
            Efficiency_Index_A1
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
/* --- 2.5 COMPONENTE: ROW DE PRODUCTO EXPANDIBLE --- */
const ProductRow = ({ product }) => {
  const [expanded, setExpanded] = useState(false);
  const costo =
    (parseFloat(product.precioCompra) || 0) *
    (parseInt(product.cantidadComprada) || 1);
  const ganancia = (parseFloat(product.monto) || 0) - costo;
  return (
    <div className="border-b border-gray-50 last:border-0">
      {" "}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`flex justify-between items-center py-4 px-4 cursor-pointer transition-all ${expanded ? "bg-gray-100" : "active:bg-[#F8FAFC]"}`}
      >
        {" "}
        <div className="flex items-center gap-3 max-w-[70%]">
          {" "}
          <span
            className={`text-gray-500 transition-transform duration-300 ${expanded ? "rotate-180 text-gray-900" : ""}`}
          >
            {" "}
            <FiChevronsDown size={16} />{" "}
          </span>{" "}
          <span className="text-[11px] font-bold text-gray-800 uppercase truncate">
            {" "}
            <span className="text-gray-900 mr-2">
              [{product.cantidadComprada}]
            </span>{" "}
            {product.nombreProducto}{" "}
          </span>{" "}
        </div>{" "}
        <span className="text-gray-900 font-bold text-xs whitespace-nowrap">
          {formatCurrency(product.monto)}
        </span>{" "}
      </div>{" "}
      <AnimatePresence>
        {" "}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#F8FAFC] p-5 space-y-4 border-t border-gray-50 shadow-inner"
          >
            {" "}
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              {" "}
              <span className={styles.label + " mb-0"}>Rentabilidad</span>{" "}
              <span className="text-gray-900 font-bold text-xs decoration-white underline">
                {formatCurrency(ganancia)}
              </span>{" "}
            </div>{" "}
            <div className="grid grid-cols-2 gap-6">
              {" "}
              <div className="space-y-2">
                {" "}
                <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">
                  Tracking
                </p>{" "}
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                  <FiClock size={10} /> {product.hora || "00:00"} HS
                </div>{" "}
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                  <FiUser size={10} />{" "}
                  <span className="truncate">
                    {product.cliente || "PUBLIC"}
                  </span>
                </div>{" "}
              </div>{" "}
              <div className="text-right space-y-2">
                {" "}
                <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">
                  Canal
                </p>{" "}
                <span
                  className={`inline-block px-2 py-0.5 font-bold text-[8px] text-gray-900 uppercase bg-white`}
                >
                  {" "}
                  {product.canal || "LOCAL"}{" "}
                </span>{" "}
                <p className="text-gray-900 font-bold text-[10px] uppercase">
                  {product.medioPago}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
/* --- 3. COMPONENTE: ITEM DE CIERRE --- */
const CierreItem = ({ cierre }) => {
  const [open, setOpen] = useState(false);
  const filters = useMemo(
    () => ({
      tienda: (cierre.productosVendidos || []).filter(
        (p) => p.canal === "LOCAL" || !p.canal,
      ),
      ecomm: (cierre.productosVendidos || []).filter(
        (p) => p.canal === "ECOMMERCE",
      ),
      rev: (cierre.productosVendidos || []).filter(
        (p) => p.canal === "REVENDEDOR",
      ),
      ganancia: (cierre.productosVendidos || []).reduce(
        (acc, p) =>
          acc +
          ((parseFloat(p.monto) || 0) -
            (parseFloat(p.precioCompra) || 0) *
              (parseInt(p.cantidadComprada) || 1)),
        0,
      ),
    }),
    [cierre],
  );
  return (
    <div className="mb-2 bg-white border border-gray-50 overflow-hidden transition-all">
      {" "}
      <div
        className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {" "}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {" "}
          <div
            className={`p-3 md:p-4 transition-all ${open ? "bg-white text-gray-900" : "bg-white text-gray-600"}`}
          >
            {" "}
            <FiCalendar size={20} />{" "}
          </div>{" "}
          <div className="flex-1">
            {" "}
            <p className="text-[8px] md:text-[9px] text-gray-500 uppercase font-bold tracking-widest">
              LOG_ENTRY_#{cierre.id}
            </p>{" "}
            <p className="text-xs md:text-sm font-bold text-gray-900">
              {formatDateTime(cierre.createdAt)}
            </p>{" "}
          </div>{" "}
          <div className="md:hidden text-right">
            {" "}
            <p className="text-[14px] font-bold text-gray-900">
              {formatCurrency(cierre.totalFinal)}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-10 w-full md:w-auto border-t border-gray-50 md:border-0 pt-4 md:pt-0">
          {" "}
          <div className="hidden md:block text-right">
            {" "}
            <p className={styles.label}>Net_Profit</p>{" "}
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(filters.ganancia)}
            </p>{" "}
          </div>{" "}
          <div className="hidden md:block text-right">
            {" "}
            <p className={styles.label}>Gross_Total</p>{" "}
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(cierre.totalFinal)}
            </p>{" "}
          </div>{" "}
          <button
            className={`hidden md:flex p-4 transition-all ${open ? "bg-white text-gray-900" : "text-gray-500"}`}
          >
            {" "}
            {open ? (
              <FiChevronsUp size={20} />
            ) : (
              <FiChevronsDown size={20} />
            )}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <AnimatePresence>
        {" "}
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-[#F4F7FE] border-t border-gray-50"
          >
            {" "}
            <div className="p-5 md:p-8 space-y-8">
              {" "}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {" "}
                <div className="bg-[#F8FAFC] p-4 border border-gray-50">
                  {" "}
                  <p className="text-[8px] text-gray-700 uppercase font-bold mb-1">
                    Profit_Margin
                  </p>{" "}
                  <p className="text-sm md:text-lg font-bold text-gray-900">
                    {formatCurrency(filters.ganancia)}
                  </p>{" "}
                </div>{" "}
                <div className="bg-[#F8FAFC] p-4 border border-gray-50">
                  {" "}
                  <p className="text-[8px] text-gray-700 uppercase font-bold mb-1">
                    Units_Sold
                  </p>{" "}
                  <p className="text-sm md:text-lg font-bold text-gray-900">
                    {cierre.productosVendidos?.length || 0} PCS
                  </p>{" "}
                </div>{" "}
                <div className="bg-white p-4 col-span-2 lg:col-span-2">
                  {" "}
                  <p className="text-[8px] text-gray-400 uppercase font-bold mb-1">
                    System_Hash
                  </p>{" "}
                  <p className="text-[10px] font-bold text-gray-900 truncate">
                    SRV_DATA_NODE_00{cierre.id}X_STFE
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {" "}
                {[
                  {
                    title: "Ecommerce",
                    items: filters.ecomm,
                    icon: <FiSmartphone />,
                  },
                  { title: "Store", items: filters.tienda, icon: <FiHome /> },
                  { title: "Resellers", items: filters.rev, icon: <FiUser /> },
                ].map((col, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-50 shadow-xl"
                  >
                    {" "}
                    <div
                      className={`p-4 border-b border-gray-50 bg-[#F8FAFC] flex items-center justify-between text-gray-900`}
                    >
                      {" "}
                      <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        {col.icon} {col.title}
                      </span>{" "}
                      <span className="bg-white text-gray-900 px-2 py-0.5 text-[9px] font-bold">
                        {col.items.length}
                      </span>{" "}
                    </div>{" "}
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {" "}
                      {col.items.length > 0 ? (
                        col.items.map((p, i) => (
                          <ProductRow key={i} product={p} />
                        ))
                      ) : (
                        <div className="p-8 text-center text-[9px] text-gray-400 uppercase font-bold italic">
                          No_Movement
                        </div>
                      )}{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
              {cierre.detalles_billetes && (
                <div className="p-6 border border-gray-50 bg-[#F8FAFC]">
                  {" "}
                  <h5
                    className={`${styles.label} text-gray-900 mb-6 flex items-center gap-2`}
                  >
                    <FiPackage /> Cash_Position
                  </h5>{" "}
                  <div className="grid grid-cols-3 md:grid-cols-8 gap-2">
                    {" "}
                    {Object.entries(cierre.detalles_billetes)
                      .sort((a, b) => b[0] - a[0])
                      .map(([den, cant]) => (
                        <div
                          key={den}
                          className={`flex flex-col items-center p-3 border transition-all ${cant > 0 ? "border-white bg-white text-gray-900" : "border-gray-50 text-gray-400"}`}
                        >
                          {" "}
                          <span className="text-[9px] font-bold mb-1">
                            ${den}
                          </span>{" "}
                          <span className="font-bold text-lg">
                            {cant}
                          </span>{" "}
                        </div>
                      ))}{" "}
                  </div>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
/* --- COMPONENTE PRINCIPAL --- */
const HistorialRecaudacionFinal = () => {
  const [recaudaciones, setRecaudaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState("historial");
  useEffect(() => {
    axios
      .get(API_URL_RECAUDACION)
      .then((res) => {
        if (res.data)
          setRecaudaciones(
            res.data.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            ),
          );
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);
  const totalGlobal = useMemo(
    () => recaudaciones.reduce((s, c) => s + (Number(c.totalFinal) || 0), 0),
    [recaudaciones],
  );
  if (cargando)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F4F7FE]">
        {" "}
        <FiLoader className="animate-spin text-gray-900 mb-8" size={50} />{" "}
        <p className="text-gray-700 font-bold tracking-[1em] text-[10px] uppercase">
          Syncing_Protocol...
        </p>{" "}
      </div>
    );
  return (
    <div className="min-h-screen bg-[#F4F7FE] text-gray-900 font-['Inter'] selection:bg-white selection:text-gray-900">
      {" "}
      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        {" "}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-8">
          {" "}
          <div className="w-full md:w-auto">
            {" "}
            <h2 className="text-3xl md:text-6xl font-bold tracking-tight uppercase leading-none">
              {" "}
              REVENUE_<span className="text-gray-600">AUDIT</span>{" "}
            </h2>{" "}
            <div className="h-[4px] w-20 bg-white mt-4" />{" "}
            <p className="text-[9px] md:text-[10px] text-gray-500 font-bold mt-6 tracking-widest uppercase">
              Accounting_Interface /* Node_Santa_Fe
            </p>{" "}
          </div>{" "}
          */
          <div className="bg-white p-6 md:p-10 w-full md:min-w-[400px] shadow-2xl relative overflow-hidden group">
            {" "}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-gray-900">
              <FiTrendingUp size={60} />
            </div>{" "}
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-2">
              Accumulated_Total
            </p>{" "}
            <p className="text-3xl md:text-5xl font-bold text-gray-900 leading-none tracking-tight">
              {" "}
              ${totalGlobal.toLocaleString("es-AR").replace(",00", "")}{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <ProductTrackerAdvanced recaudaciones={recaudaciones} />{" "}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md py-4 -mx-4 px-4 md:static md:bg-transparent md:p-0 md:m-0">
          {" "}
          <div className="flex bg-[#F8FAFC] p-1 md:bg-transparent md:p-0 md:gap-4 mb-10 border border-gray-50 md:border-none">
            {" "}
            <button
              onClick={() => setTab("historial")}
              className={
                tab === "historial" ? styles.tabActive : styles.tabInactive
              }
            >
              REPORTS
            </button>{" "}
            <button
              onClick={() => setTab("ranking")}
              className={
                tab === "ranking" ? styles.tabActive : styles.tabInactive
              }
            >
              METRICS
            </button>{" "}
          </div>{" "}
        </div>{" "}
        <div className="pb-32">
          {" "}
          {tab === "historial" && (
            <div className="space-y-1 animate-in slide-in-from-bottom-6 duration-700">
              {" "}
              {recaudaciones.map((c) => (
                <CierreItem key={c.id} cierre={c} />
              ))}{" "}
            </div>
          )}{" "}
          {tab === "ranking" && <TopProductosView datos={recaudaciones} />}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default HistorialRecaudacionFinal;
