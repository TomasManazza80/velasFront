import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import {
  FileText,
  Download,
  Package,
  Wrench,
  Calendar,
  Filter,
  Printer,
  Share2,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_API_URL;
const Facturacion = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  /* YYYY-MM */
  const [loading, setLoading] = useState(false);
  const [facturacionData, setFacturacionData] = useState({
    ventas: [],
    reparaciones: [],
  });
  /* --- ESTILOS BLANCO Y NEGRO (INTER) --- */
  const STYLES = {
    title: "font-['Inter'] font-bold uppercase tracking-tight text-gray-900",
    label:
      "font-['Inter'] text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block",
    tech: "font-['Inter'] tracking-widest uppercase",
    input:
      "bg-[#F4F7FE] border border-gray-100 text-gray-900 text-xs font-['Inter'] focus:border-white outline-none transition-all p-3 w-full",
    glass: "bg-white/[0.02] backdrop-blur-xl border border-gray-100 shadow-2xl",
    btnAction:
      "bg-[#0A58CA] text-white font-medium text-sm rounded-xl shadow-sm hover:bg-[#084298] transition-all px-4 py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
    glassCard:
      "bg-black/40 border border-gray-50 p-6 hover:border-white/30 transition-all",
  };
  /* --- CARGA DE DATOS --- */
  useEffect(() => {
    if (selectedMonth) fetchData();
  }, [selectedMonth]);
  const fetchData = async () => {
    setLoading(true);
    try {
      /* Buscamos Recaudación (Ventas cerradas) y Encargos */
      const [resRecaudacion, resEncargos] = await Promise.all([
        axios.get(`${API_URL}/recaudacionFinal`),
        axios.get(`${API_URL}/encargos`),
      ]);
      const allCierres = resRecaudacion.data || [];
      const allEncargos = resEncargos.data || [];
      /* Filtrar Ventas por Mes Seleccionado */
      const ventasFiltradas = [];
      allCierres.forEach((cierre) => {
        const fechaCierre = new Date(cierre.createdAt);
        if (fechaCierre.toISOString().slice(0, 7) === selectedMonth) {
          if (
            cierre.productosVendidos &&
            Array.isArray(cierre.productosVendidos)
          ) {
            cierre.productosVendidos.forEach((prod) => {
              ventasFiltradas.push({
                ...prod,
                fechaOriginal: cierre.createdAt,
                tipo: "VENTA",
                idRef: cierre.id,
              });
            });
          }
        }
      });
      /* Filtrar Encargos por Mes (Solo Entregadas/Pagadas) */
      const encargosFiltrados = allEncargos
        .filter((enc) => {
          if (!enc.updatedAt && !enc.createdAt) return false;
          const fechaEnc = new Date(enc.updatedAt || enc.createdAt);
          const esDelMes = fechaEnc.toISOString().slice(0, 7) === selectedMonth;
          const estaPagada =
            enc.estado === "Finalizado" || enc.estado === "Entregado";
          return esDelMes && estaPagada;
        })
        .map((enc) => ({
          nombreProducto: `Encargo: ${enc.descripcionTrabajo} (${enc.especificaciones || "Sin especificaciones"})`,
          cantidadComprada: enc.cantidad || 1,
          monto: parseFloat(enc.montoTotal) || 0,
          precioCompra: parseFloat(enc.precioCompra) || 0,
          fechaOriginal: enc.updatedAt || enc.createdAt,
          tipo: "SERVICIO",
          idRef: enc.id,
          cliente: enc.nombreCliente,
        }));
      setFacturacionData({
        ventas: ventasFiltradas,
        reparaciones: encargosFiltrados,
      });
    } catch (error) {
      console.error("Error cargando facturación:", error);
      Swal.fire("Error", "No se pudo cargar el historial fiscal.", "error");
    } finally {
      setLoading(false);
    }
  };
  /* --- CÁLCULOS --- */
  const reporte = useMemo(() => {
    const allItems = [
      ...facturacionData.ventas,
      ...facturacionData.reparaciones,
    ];
    allItems.sort(
      (a, b) => new Date(a.fechaOriginal) - new Date(b.fechaOriginal),
    );
    const totalIngresos = allItems.reduce(
      (acc, item) => acc + (parseFloat(item.monto) || 0),
      0,
    );
    const totalCostos = allItems.reduce((acc, item) => {
      const costoUnit = parseFloat(item.precioCompra) || 0;
      const cant = parseInt(item.cantidadComprada) || 1;
      return acc + costoUnit * cant;
    }, 0);
    return {
      items: allItems,
      totalIngresos,
      totalCostos,
      gananciaBruta: totalIngresos - totalCostos,
      cantidadOperaciones: allItems.length,
    };
  }, [facturacionData]);
  /* --- GENERACIÓN PDF --- */
  const generarDocumentoFiscal = () => {
    const doc = new jsPDF();
    /* Configuración General */
    doc.setFont("helvetica");
    doc.setFontSize(8);
    /* --- ENCABEZADO --- */
    doc.setFillColor(0, 0, 0);
    /* Negro */
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    /* Blanco */
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("LU PETRUCCELLI", 15, 20);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("REPORTE MENSUAL DE FACTURACIÓN Y GANANCIAS", 15, 28);
    doc.text("USO EXCLUSIVO CONTABLE / FISCAL", 15, 33);
    /* Info Periodo (Derecha Header) */
    doc.text(`PERIODO: ${selectedMonth}`, 150, 20);
    doc.text(`EMISIÓN: ${new Date().toLocaleDateString()}`, 150, 25);
    doc.text("MONEDA: ARS (PESOS ARGENTINOS)", 150, 30);
    /* --- RESUMEN EJECUTIVO --- */
    let yPos = 50;
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, yPos, 180, 25);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE OPERACIONES", 20, yPos + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("INGRESOS BRUTOS:", 20, yPos + 18);
    doc.text(
      `$${reporte.totalIngresos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
      80,
      yPos + 18,
    );
    doc.text("COSTOS OPERATIVOS (CMV):", 20, yPos + 23);
    doc.text(
      `$${reporte.totalCostos.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
      80,
      yPos + 23,
    );
    doc.setFont("helvetica", "bold");
    doc.text("RESULTADO NETO (GANANCIA):", 110, yPos + 20);
    doc.setTextColor(0, 0, 0);
    /* Negro en lugar de verde */
    doc.setFontSize(14);
    doc.text(
      `$${reporte.gananciaBruta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
      165,
      yPos + 20,
    );
    /* --- TABLA DETALLE --- */
    yPos += 35;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE TRANSACCIONES (LIBRO VENTAS)", 15, yPos);
    yPos += 5;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos, 180, 8, "F");
    doc.setFontSize(7);
    doc.text("FECHA", 17, yPos + 5);
    doc.text("TIPO", 40, yPos + 5);
    doc.text("CONCEPTO / PRODUCTO", 60, yPos + 5);
    doc.text("CANT.", 130, yPos + 5);
    doc.text("IMPORTE", 150, yPos + 5);
    doc.text("COSTO", 175, yPos + 5);
    yPos += 10;
    doc.setFont("helvetica", "normal");
    reporte.items.forEach((item, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos, 180, 8, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("FECHA", 17, yPos + 5);
        doc.text("TIPO", 40, yPos + 5);
        doc.text("CONCEPTO / PRODUCTO", 60, yPos + 5);
        doc.text("CANT.", 130, yPos + 5);
        doc.text("IMPORTE", 150, yPos + 5);
        doc.text("COSTO", 175, yPos + 5);
        doc.setFont("helvetica", "normal");
        yPos += 10;
      }
      const fecha = new Date(item.fechaOriginal).toLocaleDateString("es-AR");
      const descripcion = (item.nombreProducto || "").substring(0, 45);
      const monto = parseFloat(item.monto) || 0;
      const costo =
        item.tipo === "SERVICIO"
          ? parseFloat(item.precioCompra) || 0
          : (parseFloat(item.precioCompra) || 0) *
            (parseInt(item.cantidadComprada) || 1);
      doc.text(fecha, 17, yPos);
      doc.text(item.tipo, 40, yPos);
      doc.text(descripcion, 60, yPos);
      doc.text((item.cantidadComprada || 1).toString(), 135, yPos, {
        align: "center",
      });
      doc.text(`$${monto.toFixed(2)}`, 165, yPos, { align: "right" });
      doc.text(`$${costo.toFixed(2)}`, 190, yPos, { align: "right" });
      yPos += 5;
      doc.setDrawColor(240, 240, 240);
      doc.line(15, yPos - 3, 195, yPos - 3);
    });
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por Sistema LuPetruccello.com - ${new Date().toLocaleString()}`,
        105,
        290,
        { align: "center" },
      );
    }
    doc.save(`Reporte_Facturacion_${selectedMonth}.pdf`);
    Swal.fire(
      "PDF Generado",
      "El reporte se ha descargado correctamente.",
      "success",
    );
  };
  return (
    <div className="p-4 md:p-10 bg-[#F4F7FE] min-h-screen text-gray-900 font-['Inter'] selection:bg-[#F4F7FE] selection:text-gray-900 animate-in fade-in duration-700">
      {" "}
      {/* Header */}{" "}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-gray-50 pb-10">
        {" "}
        <div>
          {" "}
          <h1 className={`${STYLES.title} text-3xl md:text-5xl leading-none`}>
            SISTEMA <span className="text-gray-900">FACTURACIÓN</span>
          </h1>{" "}
          <p
            className={`${STYLES.tech} text-[10px] text-gray-600 mt-4 tracking-widest`}
          >
            CUMPLIMIENTO FISCAL /* GESTIÓN DE PERIODOS
          </p>{" "}
        </div>{" "}
        */
        <div className="bg-[#F8FAFC] px-6 py-3 border border-white/20 text-[10px] text-gray-900 font-['Inter'] uppercase font-bold tracking-widest flex items-center gap-3">
          {" "}
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> Módulo
          Contable Activo{" "}
        </div>{" "}
      </header>{" "}
      {/* Controles Principales */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {" "}
        {/* Selector de Fecha */}{" "}
        <div className="md:col-span-4 lg:col-span-3">
          {" "}
          <div
            className={`${STYLES.glass} p-6 h-full flex flex-col justify-center`}
          >
            {" "}
            <label className={STYLES.label}>
              SELECCIONAR PERIODO (MES)
            </label>{" "}
            <div className="relative">
              {" "}
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className={STYLES.input}
              />{" "}
              <Calendar
                className="absolute right-3 top-3 text-gray-500 pointer-events-none"
                size={16}
              />{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* KPI Cards del Mes */}{" "}
        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
          {" "}
          <div className={STYLES.glassCard}>
            {" "}
            <div className="flex justify-between items-start mb-4">
              {" "}
              <span className={STYLES.label}>INGRESOS TOTALES</span>{" "}
              <DollarSign className="text-gray-900" size={18} />{" "}
            </div>{" "}
            <p className="text-2xl font-bold font-['Inter']">
              ${reporte.totalIngresos.toLocaleString("es-AR")}
            </p>{" "}
          </div>{" "}
          <div className={STYLES.glassCard}>
            {" "}
            <div className="flex justify-between items-start mb-4">
              {" "}
              <span className={STYLES.label}>COSTOS OPERATIVOS</span>{" "}
              <TrendingDown className="text-gray-500" size={18} />{" "}
            </div>{" "}
            <p className="text-2xl font-bold font-['Inter'] text-gray-400">
              ${reporte.totalCostos.toLocaleString("es-AR")}
            </p>{" "}
          </div>{" "}
          <div className={`${STYLES.glassCard} relative overflow-hidden`}>
            {" "}
            <div className="absolute inset-0 bg-[#F8FAFC] z-0" />{" "}
            <div className="relative z-10">
              {" "}
              <div className="flex justify-between items-start mb-4">
                {" "}
                <span className={`${STYLES.label} text-gray-900`}>
                  RESULTADO NETO
                </span>{" "}
                <TrendingUp className="text-gray-900" size={18} />{" "}
              </div>{" "}
              <p className="text-3xl font-bold font-['Inter'] text-gray-900">
                {" "}
                {reporte.gananciaBruta >= 0 ? "+" : ""}$
                {reporte.gananciaBruta.toLocaleString("es-AR")}{" "}
              </p>{" "}
              <span className="text-[9px] uppercase tracking-widest text-gray-400 mt-1 block">
                {" "}
                Margen:{" "}
                {reporte.totalIngresos > 0
                  ? (
                      (reporte.gananciaBruta / reporte.totalIngresos) *
                      100
                    ).toFixed(1)
                  : 0}
                %{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Tabla Preview */}{" "}
      <div className={`${STYLES.glass} mb-8 overflow-hidden flex flex-col`}>
        {" "}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#F8FAFC]">
          {" "}
          <h3 className={`${STYLES.title} text-sm flex items-center gap-3`}>
            {" "}
            <FileText size={16} className="text-gray-900" /> Vista Previa
            Registros{" "}
          </h3>{" "}
          <span className="text-[10px] text-gray-500 font-bold uppercase self-start md:self-center">
            {reporte.items.length} MOVIMIENTOS ENCONTRADOS
          </span>{" "}
        </div>{" "}
        <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
          {" "}
          {loading ? (
            <div className="p-20 text-center text-gray-500 animate-pulse text-xs tracking-widest uppercase">
              Cargando datos del periodo...
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              {" "}
              <thead className="sticky top-0 bg-[#F4F7FE] z-10">
                {" "}
                <tr className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                  {" "}
                  <th className="p-4 border-b border-gray-100">Fecha</th>{" "}
                  <th className="p-4 border-b border-gray-100">Tipo</th>{" "}
                  <th className="p-4 border-b border-gray-100">Detalle</th>{" "}
                  <th className="p-4 border-b border-gray-100 text-right">
                    Ingreso
                  </th>{" "}
                  <th className="p-4 border-b border-gray-100 text-right">
                    Costo Calc.
                  </th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody className="divide-y divide-white/5 font-['Inter'] text-[11px]">
                {" "}
                {reporte.items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-600">
                      No hay registros en este periodo
                    </td>
                  </tr>
                ) : (
                  reporte.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      {" "}
                      <td className="p-4 text-gray-400">
                        {new Date(item.fechaOriginal).toLocaleDateString()}
                      </td>{" "}
                      <td className="p-4 text-gray-500">
                        {" "}
                        <span
                          className={`px-2 py-1 rounded-md text-[9px] font-bold ${item.tipo === "VENTA" ? "bg-[#0A58CA] text-white" : "bg-gray-100 text-gray-700"}`}
                        >
                          {" "}
                          {item.tipo}{" "}
                        </span>{" "}
                      </td>{" "}
                      <td className="p-4 text-gray-900 uppercase max-w-[200px] truncate">
                        {item.nombreProducto}
                      </td>{" "}
                      <td className="p-4 text-right text-gray-900">
                        ${parseFloat(item.monto).toLocaleString()}
                      </td>{" "}
                      <td className="p-4 text-right text-gray-400">
                        {" "}
                        -$
                        {(item.tipo === "SERVICIO"
                          ? parseFloat(item.precioCompra) || 0
                          : (parseFloat(item.precioCompra) || 0) *
                            (parseInt(item.cantidadComprada) || 1)
                        ).toLocaleString()}{" "}
                      </td>{" "}
                    </tr>
                  ))
                )}{" "}
              </tbody>{" "}
            </table>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* Botón Acción */}{" "}
      <div className="flex justify-end">
        {" "}
        <button
          onClick={generarDocumentoFiscal}
          disabled={reporte.items.length === 0}
          className={STYLES.btnAction + " flex items-center gap-4"}
        >
          {" "}
          <Printer size={18} /> IMPRIMIR REPORTE MENSUAL (AFIP){" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
};
export default Facturacion;
