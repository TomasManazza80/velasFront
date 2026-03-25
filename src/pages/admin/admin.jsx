import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiDollarSign,
  FiPackage, FiShoppingCart, FiCalendar, FiClock, FiBarChart2, FiHome,
  FiTag, FiLayers, FiAlertTriangle, FiSearch, FiTrendingUp, FiArrowLeft, FiArrowRight, FiUploadCloud,
  FiMinusCircle, FiCornerDownRight, FiMenu, FiCreditCard, FiMessageSquare, FiUser, FiTruck, FiActivity
} from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Componentes internos
import HistorialDeVentas from '../admin/historialVentas';
import ModuloCaja from '../admin/caja.jsx';
import ConfiguracionCostos from './configuracionCostos.jsx';
import Encargos from './encargos.jsx';
import HistorialDeVentasLocal from '../admin/ventasLocalFisico.jsx';
import HistorialRecaudacionFinal from '../admin/cierresDeCaja/historialRecaudacionFinal.jsx';
import CierreCajaDiario from '../admin/cierresDeCaja/cierreCajaDiario.jsx';
import BalanceModule from './balance/balance.jsx';
import PersonalBalance from './balance/personalBalance.jsx';
import CargaDeProductos from './productos/cargaDeProductos.jsx';
import Facturacion from './facturacion/facturacion.jsx';
import InventarioProductos from './productos/inventarioProductos.jsx';
import ModuloProveedores from './proveedores/proveedores.jsx';
import ModuloClientes from './clientes/clientes.jsx';
import ModuloRevendedores from './revendedores/revendedoresAdmin.jsx';
import EnviosProductos from './envios/enviosProductos.jsx';
import VentasEcommerceOnline from './ventas/ventasEcommerceOnline.jsx';
import CargaContenidoWeb from './cargaDeContenido/cargaDeContenido.jsx';
import Gastos from './gastos.jsx';
import WhatsappQrSection from './whatsapp/whatsappQrSection.jsx';
import ReporteGanancias from './reporteGanancias.jsx';
import ConfiguracionMayorista from './configuracionMayorista.jsx';
import ModuloEmpleados from './empleados/moduloEmpleados.jsx';

const API_URL = import.meta.env.VITE_API_URL;

// --- CONFIGURACIÓN DE ANIMACIÓN ---
const springTransition = { type: "spring", stiffness: 300, damping: 30 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: springTransition }
};

const sectionVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } }
};

const sidebarGroupVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { staggerChildren: 0.1, ...springTransition }
  }
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

const MinimalistStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&display=swap');

body { font-family: 'Inter', sans-serif; background-color: #000000; color: #ffffff; }
.fedecell-title { font-family: 'Inter', sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
.fedecell-body { font-family: 'Inter', sans-serif; font-weight: 400; }
.fedecell-tech { font-family: 'Inter', sans-serif; font-weight: 600; letter-spacing: 0.05em; }

.glass-card { 
  background: #0a0a0a; 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  transition: all 0.3s ease; 
}
.glass-card:hover { border-color: rgba(255, 255, 255, 0.3); }

.sidebar-active { 
  background: #ffffff !important; 
  color: #000000 !important; 
  font-weight: 800; 
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #ffffff; }

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(1);
  opacity: 0.6;
}

.date-picker-container {
  display: flex;
  align-items: center;
  background: #000;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 0 12px;
  transition: all 0.3s;
}
.date-picker-container:hover {
  border-color: #ffffff;
}
`;

const EditarProducto = ({ producto, onGuardarCambios, onCancelar }) => {
  const [formData, setFormData] = useState({ ...producto });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[110] p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="glass-card p-6 md:p-10 w-full max-w-xl border-white/20"
      >
        <h3 className="fedecell-title text-lg text-white mb-8 border-b border-white/10 pb-4">
          <FiEdit2 className="inline mr-2" /> EDITAR REGISTRO
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); onGuardarCambios(formData); }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="fedecell-tech text-[10px] text-zinc-500 uppercase block mb-2">Nombre del Producto</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-white focus:border-white outline-none fedecell-body transition-colors" />
            </div>
            <div>
              <label className="fedecell-tech text-[10px] text-zinc-500 uppercase block mb-2">Precio</label>
              <input type="number" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-white outline-none focus:border-white transition-colors" />
            </div>
            <div>
              <label className="fedecell-tech text-[10px] text-zinc-500 uppercase block mb-2">Stock</label>
              <input type="number" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-white outline-none focus:border-white transition-colors" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-end gap-4 pt-6">
            <button type="button" onClick={onCancelar} className="fedecell-title text-[11px] px-8 py-3 border border-white/10 hover:bg-white hover:text-black transition-all">CANCELAR</button>
            <button type="submit" className="fedecell-title text-[11px] px-8 py-3 bg-white text-black hover:bg-zinc-200 transition-all">GUARDAR</button>
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
  const [seccionActiva, setSeccionActiva] = useState(() => localStorage.getItem('adminSeccionActiva') || 'dashboard');
  const [loading, setLoading] = useState(false);
  const [ventasPendientesDeCierre, setVentasPendientesDeCierre] = useState([]);
  const [pagosCajaPendientes, setPagosCajaPendientes] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const dateInicioRef = useRef(null);
  const dateFinRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarVisible(false);
      else setSidebarVisible(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSeccionActiva', seccionActiva);
  }, [seccionActiva]);

  const obtenerDatos = async () => {
    setLoading(true);
    try {
      const [prod, vent, rec, caja] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/boughtProduct/AllboughtProducts`),
        axios.get(`${API_URL}/recaudacionFinal`),
        axios.get(`${API_URL}/pagoCaja/pagos`)
      ]);
      setTodosMisProductos(prod.data);
      setVentasPendientesDeCierre(vent.data);
      setPagosCajaPendientes(caja.data || []);
      setRecaudaciones(rec.data.map(r => {
        let fechaExplicita = (r.op2 || '').replace('Fecha: ', '');
        if (!fechaExplicita && r.createdAt) {
          fechaExplicita = new Date(r.createdAt).toLocaleDateString('es-AR');
        }
        return {
          id: r.id,
          mes: fechaExplicita || r.mes || 'S/D',
          montoRecaudado: parseFloat(r.totalFinal) || 0,
          productosVendidos: [...(r.pagosEcommerce || []), ...(r.pagosLocal || [])],
          createdAt: r.createdAt
        };
      }));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { obtenerDatos(); }, []);

  const dataGrafico = useMemo(() => {
    let filtered = [...recaudaciones].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (fechaInicio || fechaFin) {
      if (fechaInicio) filtered = filtered.filter(r => new Date(r.createdAt) >= new Date(fechaInicio + 'T00:00:00'));
      if (fechaFin) filtered = filtered.filter(r => new Date(r.createdAt) <= new Date(fechaFin + 'T23:59:59'));
      return filtered.map(r => ({ mes: r.mes, recaudado: r.montoRecaudado }));
    }
    return filtered.map(r => ({ mes: r.mes, recaudado: r.montoRecaudado })).slice(-10);
  }, [recaudaciones, fechaInicio, fechaFin]);

  const recaudacionPendienteTotal = useMemo(() => {
    const ecom = ventasPendientesDeCierre.reduce((acc, s) => acc + (parseFloat(s.precio) * parseInt(s.cantidad) * (1 - parseFloat(s.descuentoGlobalAplicado || 0) / 100)), 0);
    const local = pagosCajaPendientes.reduce((acc, p) => acc + parseFloat(p.montoTotal || 0), 0);
    return ecom + local;
  }, [ventasPendientesDeCierre, pagosCajaPendientes]);

  const desgloseCajaAbierta = useMemo(() => {
    let ecomRev = 0, ecomCost = 0, localRev = 0, localCost = 0;
    ventasPendientesDeCierre.forEach(s => {
      const precioVenta = (parseFloat(s.precio) || 0) * (parseInt(s.cantidad) || 1) * (1 - parseFloat(s.descuentoGlobalAplicado || 0) / 100);
      const costo = (parseFloat(s.precioCompra) || 0) * (parseInt(s.cantidad) || 1);
      ecomRev += precioVenta; ecomCost += costo;
    });
    pagosCajaPendientes.forEach(p => {
      localRev += parseFloat(p.montoTotal) || 0;
      (p.productos || []).forEach(prod => {
        localCost += (parseFloat(prod.precioCompra) || 0) * (parseInt(prod.cantidad) || 1);
      });
    });
    const gananciaTotal = (ecomRev + localRev) - (ecomCost + localCost);
    return {
      ecommerce: { rev: ecomRev, cost: ecomCost, profit: ecomRev - ecomCost },
      local: { rev: localRev, cost: localCost, profit: localRev - localCost },
      total: { rev: ecomRev + localRev, cost: ecomCost + localCost, profit: gananciaTotal }
    };
  }, [ventasPendientesDeCierre, pagosCajaPendientes]);

  const gananciaPendienteTotal = desgloseCajaAbierta.total.profit;

  return (
    <div className="min-h-screen bg-black text-white fedecell-body overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: MinimalistStyles }} />

      <AnimatePresence>
        {isMobile && sidebarVisible && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarVisible(false)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[50]"
          />
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setSidebarVisible(!sidebarVisible)}
        className="fixed h-[50px] top-[40px] left-[20px] z-[1001] bg-white text-black p-3 shadow-xl transition-all border border-white/10"
      >
        {sidebarVisible && !isMobile ? <FiArrowLeft size={20} /> : <FiMenu size={20} />}
      </motion.button>

      <motion.div
        initial={false}
        animate={{ x: sidebarVisible ? 0 : (isMobile ? '-100%' : -240) }}
        transition={springTransition}
        className={`fixed top-0 left-0 h-full bg-[#050505] border-r border-white/10 z-[55] overflow-y-auto pb-24 ${isMobile ? 'w-[80vw]' : 'w-60'}`}
      >
        <div className="p-8 border-b border-white/10 pt-28 flex justify-between items-center">
          <div className='mb-4'>
            <h1 className="fedecell-title text-xs tracking-[0.3em] opacity-50">ADMIN PANEL</h1>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarVisible(false)} className="text-zinc-500 hover:text-white p-2">
              <FiX size={20} />
            </button>
          )}
        </div>

        <motion.nav variants={containerVariants} initial="hidden" animate="visible" className="p-4 space-y-8">
          {[
            {
              title: 'Principal',
              items: [
                { id: 'dashboard', label: 'Dashboard', icon: <FiHome /> },
                { id: 'caja', label: 'Caja Operativa', icon: <FiDollarSign /> },
                { id: 'Encargos', label: 'Encargos / Pedidos', icon: <FiPackage /> },
                { id: 'control', label: 'Cierre Diario', icon: <FiCheck /> },
              ]
            },
            {
              title: 'Finanzas',
              items: [
                { id: 'Balance', label: 'Balance', icon: <FiBarChart2 /> },
                { id: 'ganancias', label: 'Ganancias', icon: <FiTrendingUp /> },
                { id: 'gastos', label: 'Gastos', icon: <FiDollarSign /> },
                { id: 'historialRecaudacionFinal', label: 'Historial', icon: <FiClock /> },
                { id: 'facturacion', label: 'Facturación', icon: <FiTag /> },
                { id: 'configMayorista', label: 'Config. Mayorista', icon: <FiDollarSign /> },
              ]
            },
            {
              title: 'Inventario',
              items: [
                { id: 'productos', label: 'Stock', icon: <FiPackage /> },
                { id: 'cargar', label: 'Nueva Carga', icon: <FiPlus /> },
                { id: 'cargarContenidoWeb', label: 'Contenido Web', icon: <FiEdit2 /> },
                { id: 'proveedores', label: 'Proveedores', icon: <FiTruck /> },
              ]
            },
            {
              title: 'Ventas',
              items: [
                { id: 'ventasLocal', label: 'Local', icon: <FiShoppingCart /> },
                { id: 'ventasOnline', label: 'Ecommerce', icon: <FiUploadCloud /> },
                { id: 'envios', label: 'Logística', icon: <FiTrendingUp /> },
                { id: 'clientes', label: 'Clientes', icon: <FiUser /> },
              ]
            },
            {
              title: 'Sistema',
              items: [
                { id: 'whatsapp', label: 'WhatsApp', icon: <FiMessageSquare /> },
                { id: 'empleados', label: 'Personal', icon: <FiUser /> },
              ]
            }
          ].map((group, i) => (
            <motion.div key={i} variants={sidebarGroupVariants} className="space-y-1">
              <motion.p variants={sidebarItemVariants} className="px-4 text-[9px] text-zinc-600 font-bold tracking-widest mb-3 uppercase">{group.title}</motion.p>
              {group.items.map(item => (
                <motion.button
                  key={item.id}
                  variants={sidebarItemVariants}
                  onClick={() => {
                    setSeccionActiva(item.id);
                    if (isMobile) setSidebarVisible(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 fedecell-tech text-[10px] tracking-widest transition-all rounded-none border-l-2
                  ${seccionActiva === item.id ? 'sidebar-active border-white' : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/5'}`}
                >
                  <span className="mr-3 text-base">{item.icon}</span> {item.label.toUpperCase()}
                </motion.button>
              ))}
            </motion.div>
          ))}
        </motion.nav>
      </motion.div>

      <motion.div
        animate={{ paddingLeft: (sidebarVisible && !isMobile) ? 240 : 0 }}
        transition={springTransition}
        className="pt-24 md:pt-32 md:p-12 min-h-screen w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={seccionActiva}
            variants={sectionVariants}
            initial="initial" animate="animate" exit="exit"
          >
            {seccionActiva === 'dashboard' && (
              <div className="p-6 md:p-0 mt-[-100px] space-y-12">
                <div className="flex items-center justify-between">
                  {loading && <p className="fedecell-tech text-[10px] text-white animate-pulse tracking-widest">STREAMS SYNCING...</p>}
                </div>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Stock Items', val: todosMisProductos.length, icon: <FiPackage /> },
                    { label: 'Live Sessions', val: ventasPendientesDeCierre.length + pagosCajaPendientes.length, icon: <FiClock /> },
                    { label: 'Pending Gross', val: `$${recaudacionPendienteTotal.toLocaleString()}`, icon: <FiDollarSign /> },
                    { label: 'Net Profit', val: `$${gananciaPendienteTotal.toLocaleString()}`, icon: <FiTrendingUp />, highlight: true }
                  ].map((card, i) => (
                    <motion.div
                      key={i} variants={itemVariants}
                      className={`glass-card p-6 flex justify-between items-center ${card.highlight ? 'bg-white text-black' : ''}`}
                    >
                      <div>
                        <p className={`fedecell-tech text-[9px] uppercase ${card.highlight ? 'text-black/60' : 'text-zinc-500'}`}>{card.label}</p>
                        <p className={`fedecell-tech text-2xl font-black mt-2`}>{card.val}</p>
                      </div>
                      <div className={`text-2xl opacity-20`}>{card.icon}</div>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 glass-card p-6 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                      <h3 className="fedecell-title text-xs text-white flex items-center gap-3">
                        <FiTrendingUp /> REVENUE ANALYTICS
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="date-picker-container" onClick={() => dateInicioRef.current?.showPicker()}>
                          <FiCalendar className="text-white opacity-40" size={14} />
                          <input
                            ref={dateInicioRef} type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
                            className="bg-transparent border-none text-[10px] text-white pl-3 py-2 outline-none fedecell-tech"
                          />
                        </div>
                        <div className="date-picker-container" onClick={() => dateFinRef.current?.showPicker()}>
                          <FiCalendar className="text-white opacity-40" size={14} />
                          <input
                            ref={dateFinRef} type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                            className="bg-transparent border-none text-[10px] text-white pl-3 py-2 outline-none fedecell-tech"
                          />
                        </div>
                        {(fechaInicio || fechaFin) && (
                          <button onClick={() => { setFechaInicio(''); setFechaFin(''); }} className="hover:text-white text-zinc-500 transition-colors p-2">
                            <FiX size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dataGrafico}>
                          <CartesianGrid strokeDasharray="0" stroke="#ffffff08" vertical={false} />
                          <XAxis dataKey="mes" stroke="#333" tick={{ fontSize: 9, family: 'Inter', fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <YAxis stroke="#333" tick={{ fontSize: 9, family: 'Inter', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} width={60} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#fff', border: 'none', color: '#000', fontSize: 10, fontWeight: 800, fontFamily: 'Inter' }}
                            itemStyle={{ color: '#000' }} cursor={{ stroke: '#fff', strokeWidth: 1 }}
                          />
                          <Line type="stepAfter" dataKey="recaudado" stroke="#ffffff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#000', stroke: '#fff', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-card flex flex-col">
                    <div className="p-8 border-b border-white/10">
                      <h3 className="fedecell-title text-[10px] text-zinc-400 flex items-center gap-2 mb-8">
                        <FiActivity /> ACTIVE BALANCES
                      </h3>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="fedecell-tech text-[9px] text-zinc-500 uppercase">Gross Income</p>
                            <p className="fedecell-tech text-xl text-white font-bold tracking-tight">${desgloseCajaAbierta.total.rev.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="fedecell-tech text-[9px] text-zinc-500 uppercase">Estimated Costs</p>
                            <p className="fedecell-tech text-xl text-white font-bold tracking-tight">${desgloseCajaAbierta.total.cost.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="pt-8 mt-4 border-t border-white/10">
                          <div className="p-5 bg-white text-black">
                            <p className="fedecell-tech text-[10px] font-black uppercase mb-1">Current Net Profit</p>
                            <p className="fedecell-tech text-3xl font-black tracking-tighter">${desgloseCajaAbierta.total.profit.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1 max-h-48 no-scrollbar">
                      <h3 className="fedecell-title text-[10px] text-zinc-600 mb-6 uppercase">Recent History</h3>
                      {recaudaciones.slice(0, 5).map(r => (
                        <div key={r.id} className="border-b border-white/5 py-4 flex justify-between items-center group">
                          <span className="fedecell-tech text-[10px] text-zinc-400 group-hover:text-white transition-colors uppercase">{r.mes}</span>
                          <span className="fedecell-tech text-[11px] text-white font-bold">${r.montoRecaudado.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full">
              {seccionActiva === 'Balance' && <BalanceModule />}
              {seccionActiva === 'personalBalance' && <PersonalBalance />}
              {seccionActiva === 'Encargos' && <Encargos />}
              {seccionActiva === 'caja' && <ModuloCaja />}
              {seccionActiva === 'productos' && <InventarioProductos />}
              {seccionActiva === 'cargar' && <CargaDeProductos />}
              {seccionActiva === 'ventasOnline' && <VentasEcommerceOnline />}
              {seccionActiva === 'ventasLocal' && <HistorialDeVentasLocal />}
              {seccionActiva === 'historialRecaudacionFinal' && <HistorialRecaudacionFinal />}
              {seccionActiva === 'facturacion' && <Facturacion />}
              {seccionActiva === 'proveedores' && <ModuloProveedores />}
              {seccionActiva === 'clientes' && <ModuloClientes />}
              {seccionActiva === 'revendedores' && <ModuloRevendedores />}
              {seccionActiva === 'envios' && <EnviosProductos />}
              {seccionActiva === 'cargarContenidoWeb' && <CargaContenidoWeb />}
              {seccionActiva === 'gastos' && <Gastos />}
              {seccionActiva === 'whatsapp' && <WhatsappQrSection />}
              {seccionActiva === 'ganancias' && <ReporteGanancias />}
              {seccionActiva === 'control' && <CierreCajaDiario />}
              {seccionActiva === 'configMayorista' && <ConfiguracionMayorista />}
              {seccionActiva === 'empleados' && <ModuloEmpleados />}
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