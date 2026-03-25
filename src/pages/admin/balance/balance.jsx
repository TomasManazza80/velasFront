import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentsSection from './seccionPagos';
import TotalsSection from './seccionTotales';
import EgressForm from './seccionEgresos';
import PersonalBalanceModule from './balancePersonal';
import MonthlyExpenseTracker from './gastosMensuales';
import SeccionGanancias from './seccionGanancias';
import axios from 'axios';

import {
    ChartBarIcon,
    MinusCircleIcon,
    UserIcon,
    CalendarDaysIcon,
    PlusIcon,
    XMarkIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/solid';
import { FiTrendingUp, FiBriefcase } from 'react-icons/fi';

// =================================================================
// CONFIGURACIÓN ESTILOS BLANCO Y NEGRO (INTER)
// =================================================================
const customStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&display=swap');

.bw-title { 
    font-family: 'Inter', sans-serif; 
    font-weight: 900; 
    text-transform: uppercase; 
    letter-spacing: -0.05em; 
}

.bw-body { 
    font-family: 'Inter', sans-serif; 
    font-weight: 400; 
}

.bw-tech { 
    font-family: 'Inter', sans-serif;
    font-weight: 600;
}

.glass-container {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
}

.bw-glow {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.bw-line {
    width: 60px;
    height: 4px;
    background: #ffffff;
    margin-top: 0.5rem;
}

.bw-input {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 0.75rem;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s ease;
}

.bw-input:focus {
    outline: none;
    border-color: #ffffff;
}

.btn-bw {
    font-family: 'Inter', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

/* Evitar scroll horizontal en mobile globalmente */
body {
    overflow-x: hidden;
}

/* Área segura para móviles (Notches / Home indicators) */
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 1rem); }
`;

const mockBalanceData = {
    payments: {
        efectivo: 125000, debito: 85000, tarjeta_credito: 55000, transferencia: 60000,
        credito_1: 45000, credito_2: 20000, credito_3: 15000, credito_4: 10000,
        credito_5: 5000, credito_6: 3000,
    },
    egresos: 30000,
    total_ventas: 423000,
};

const BalanceModule = () => {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('balance');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [productsDetail, setProductsDetail] = useState([]);
    const [allEntries, setAllEntries] = useState([]);

    // --- MANEJO AJUSTE ARQUEO DE CAJA ---
    const [isEditingBills, setIsEditingBills] = useState(false);
    const [editedBillTotals, setEditedBillTotals] = useState({});
    const [isAdjusting, setIsAdjusting] = useState(false);

    const [showManualForm, setShowManualForm] = useState(false);
    const [manualEntry, setManualEntry] = useState({
        producto: '', monto: '', cantidad: 1, precioCompra: 0,
        marca: '', categoria: '', proveedor: '',
        metodo_pago: 'transferencia',
        detalles_mixto: { efectivo: '', transferencia: '', debito: '' },
        fecha: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchBalanceData();
    }, []);

    const fetchBalanceData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/balanceMensual/ObtenBalanceMensual`);
            const data = response.data || [];
            setAllEntries(data);

            const payments = {
                efectivo: 0, debito: 0, tarjeta_credito: 0, transferencia: 0,
                credito_1: 0, credito_2: 0, credito_3: 0, credito_4: 0,
                credito_5: 0, credito_6: 0, mercadopago: 0
            };

            let totalVentas = 0;
            const billTotals = {
                20000: 0, 10000: 0, 5000: 0, 2000: 0, 1000: 0, 500: 0, 200: 0, 100: 0
            };

            data.forEach(entry => {
                const monto = parseFloat(entry.monto) || 0;
                const metodo = entry.metodo_pago;

                if (metodo === 'mixto' && entry.detalles_pago?.mixto) {
                    const mixtoData = entry.detalles_pago.mixto;
                    if (mixtoData.efectivo) payments.efectivo += parseFloat(mixtoData.efectivo) || 0;
                    if (mixtoData.transferencia) payments.transferencia += parseFloat(mixtoData.transferencia) || 0;
                    if (mixtoData.debito) payments.debito += parseFloat(mixtoData.debito) || 0;

                    if (!payments.mixto) payments.mixto = 0;
                    payments.mixto += monto;
                } else if (payments.hasOwnProperty(metodo)) {
                    payments[metodo] += monto;
                }

                totalVentas += monto;

                if (metodo === 'efectivo' && entry.detalles_pago?.billetes) {
                    Object.entries(entry.detalles_pago.billetes).forEach(([den, cant]) => {
                        if (billTotals.hasOwnProperty(den)) {
                            billTotals[den] += parseInt(cant) || 0;
                        }
                    });
                }

                if (metodo === 'efectivo' && entry.detalles_pago?.vuelto) {
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
                billTotals
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
            const response = await fetch(`${API_URL}/balanceMensual/CreaBalanceMensual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...manualEntry,
                    monto: parseFloat(manualEntry.monto),
                    cantidad: parseInt(manualEntry.cantidad),
                    detalles_pago: manualEntry.metodo_pago === 'mixto' ? { mixto: manualEntry.detalles_mixto } : null
                }),
            });
            if (response.ok) {
                alert("OPERACIÓN_EXITOSA: BALANCE ACTUALIZADO");
                setManualEntry({
                    producto: '', monto: '', cantidad: 1, precioCompra: 0,
                    marca: '', categoria: '', proveedor: '',
                    metodo_pago: 'transferencia',
                    detalles_mixto: { efectivo: '', transferencia: '', debito: '' },
                    fecha: new Date().toISOString().split('T')[0]
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
                    totalDiffMonto += (diff * parseInt(den));
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

            const transaccionId = Date.now().toString(36) + Math.random().toString(36).substr(2);

            const response = await fetch(`${API_URL}/balanceMensual/CreaBalanceMensual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    producto: "AJUSTE MANUAL ARQUEO DE CAJA",
                    monto: totalDiffMonto,
                    cantidad: 1,
                    precioCompra: 0,
                    marca: "SISTEMA",
                    categoria: "AJUSTE",
                    proveedor: "ADMIN",
                    metodo_pago: 'efectivo',
                    detalles_pago: {
                        efectivo: '',
                        billetes: Object.keys(billetesParaSumar).length > 0 ? billetesParaSumar : null,
                        vuelto: Object.keys(billetesParaRestar).length > 0 ? billetesParaRestar : null
                    },
                    fecha: new Date().toISOString().split('T')[0],
                    id_transaccion: transaccionId,
                    cliente: "Arqueo Interno",
                    origenDeVenta: "Administracion"
                }),
            });

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
        const filteredProducts = allEntries.filter(p => p.metodo_pago === paymentType).map(p => ({
            ...p,
            producto: p.tarjeta_digitos ? `${p.producto} (Tarjeta ****${p.tarjeta_digitos})` : p.producto
        }));
        setProductsDetail(filteredProducts);
    };

    const tabsMenu = [
        { id: 'balance', labelDesktop: 'Balance Diario', labelMobile: 'Balance', icon: ChartBarIcon },
        { id: 'egresos', labelDesktop: 'Cargar Egresos', labelMobile: 'Egresos', icon: MinusCircleIcon },
        { id: 'personal', labelDesktop: 'Personal', labelMobile: 'Personal', icon: UserIcon },
        { id: 'ganancias', labelDesktop: 'Ganancias', labelMobile: 'Ganancias', icon: FiTrendingUp },
        { id: 'monthlyExpenses', labelDesktop: 'Mensuales', labelMobile: 'Mensual', icon: CalendarDaysIcon },
    ];

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="bw-tech text-white animate-pulse uppercase tracking-[0.5em] text-xs md:text-base text-center px-4">
                Inicializando Sistema...
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 pb-32 md:pb-8 md:mt-[-100px] min-h-screen bg-black text-white bw-body antialiased relative">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            {/* Header Style */}
            <div className="mb-6 md:mb-10 pt-4 md:pt-0">
                <h1 className="text-2xl md:text-5xl bw-title text-white">
                    SISTEMA <span className="text-white bw-glow">BALANCE</span>
                </h1>
                <div className="bw-line"></div>
                <p className="mt-3 bw-tech text-[10px] text-zinc-500 uppercase tracking-[0.4em] break-words">
                    Nodo Santa Fe // Desarrollo Empty
                </p>
            </div>

            {/* 1. NAVEGACIÓN DESKTOP */}
            <div className="hidden md:flex overflow-x-auto border-b border-white/5 mb-0 custom-scrollbar">
                {tabsMenu.map(tab => (
                    <button
                        key={tab.id}
                        className={`px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center border-b-2 bw-title ${activeTab === tab.id
                            ? 'bg-white text-black border-white bw-glow'
                            : 'bg-transparent text-gray-500 border-white/5 hover:text-white hover:bg-white/5'
                            }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon className="w-4 h-4 mr-2" /> {tab.labelDesktop}
                    </button>
                ))}
            </div>

            {/* 2. NAVEGACIÓN MOBILE */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] glass-container border-t border-white/10 flex justify-around items-center h-[72px] pb-safe px-1">
                {tabsMenu.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center justify-center w-full h-full active:scale-95 transition-all duration-200 ${activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <tab.icon className={`w-6 h-6 mb-1 ${activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`} />
                        <span className="text-[9px] bw-title tracking-wider">{tab.labelMobile}</span>
                    </button>
                ))}
            </nav>

            {/* Área de Contenido */}
            <div className="glass-container p-3 md:p-10 rounded-xl md:rounded-b-xl md:rounded-t-none min-h-[500px] relative">

                {activeTab === 'balance' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 md:space-y-10">

                        {/* CABECERA DE SECCIÓN + BOTÓN CARGA MANUAL */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="bw-title text-xl text-white">Resumen Operativo</h2>
                                <span className="bw-tech text-[9px] text-zinc-500 uppercase">Panel de Control en Vivo</span>
                            </div>

                            <button
                                onClick={() => setShowManualForm(!showManualForm)}
                                className={`btn-bw w-full md:w-auto min-h-[50px] md:min-h-0 py-3 px-8 text-xs flex items-center justify-center space-x-2 border rounded-lg md:rounded-none active:scale-95 md:active:scale-100 shadow-lg ${showManualForm
                                    ? 'bg-zinc-900 border-white text-white'
                                    : 'bg-white border-white text-black bw-glow hover:bg-gray-200'
                                    }`}
                            >
                                {showManualForm ? <XMarkIcon className="w-5 h-5 md:w-4 md:h-4" /> : <PlusIcon className="w-5 h-5 md:w-4 md:h-4" />}
                                <span>{showManualForm ? 'CANCELAR' : 'CARGA MANUAL'}</span>
                            </button>
                        </div>

                        {/* DESGLOSE DE BILLETES (RESUMEN DE CAJA) */}
                        {balance.billTotals && Object.values(balance.billTotals).some(c => c > 0) && (
                            <div className="bg-white/5 border border-white/20 p-4 md:p-6 rounded-xl">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                    <h3 className="bw-title text-white text-sm tracking-widest flex items-center gap-3">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        ARQUEO DE CAJA ESTIMADO
                                    </h3>

                                    <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4 bg-black/40 px-4 py-3 md:py-2 border border-white/5 rounded-2xl md:rounded-full">
                                        <span className="text-[10px] md:text-[9px] font-black text-zinc-500 uppercase tracking-widest">Reseteo Automático</span>
                                        <button
                                            onClick={() => {
                                                const current = localStorage.getItem('fedecell_reseteo_billetes_auto') === 'true';
                                                localStorage.setItem('fedecell_reseteo_billetes_auto', !current);
                                                window.dispatchEvent(new Event('storage'));
                                                setBalance(prev => ({ ...prev }));
                                            }}
                                            className={`relative w-12 h-6 md:w-10 md:h-5 rounded-full transition-all duration-300 ${localStorage.getItem('fedecell_reseteo_billetes_auto') === 'true' ? 'bg-white' : 'bg-zinc-800'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 md:w-3 md:h-3 rounded-full transition-all duration-300 ${localStorage.getItem('fedecell_reseteo_billetes_auto') === 'true' ? 'bg-black left-7 md:left-6' : 'bg-white left-1'}`}></div>
                                        </button>
                                        <span className={`text-[10px] md:text-[9px] font-black uppercase tracking-widest ${localStorage.getItem('fedecell_reseteo_billetes_auto') === 'true' ? 'text-white' : 'text-zinc-600'}`}>
                                            {localStorage.getItem('fedecell_reseteo_billetes_auto') === 'true' ? 'ON' : 'OFF'}
                                        </span>
                                    </div>
                                    {isEditingBills ? (
                                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                            <button
                                                onClick={() => setIsEditingBills(false)}
                                                className="flex-1 md:flex-none px-4 py-2 border border-zinc-600 text-zinc-400 bw-tech text-[10px] hover:bg-zinc-800 transition-colors uppercase"
                                                disabled={isAdjusting}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleAjusteArqueo}
                                                className="flex-1 md:flex-none px-4 py-2 bg-white text-black font-black bw-tech text-[10px] hover:bg-gray-200 transition-colors uppercase"
                                                disabled={isAdjusting}
                                            >
                                                {isAdjusting ? 'G...' : 'GUARDAR AJUSTE'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditedBillTotals({ ...balance.billTotals });
                                                setIsEditingBills(true);
                                            }}
                                            className="w-full md:w-auto px-4 py-2 border border-white/50 text-white hover:bg-white/10 bw-tech text-[10px] rounded-lg md:rounded-full transition-colors mt-4 md:mt-0 uppercase tracking-widest"
                                        >
                                            AJUSTAR ARQUEO
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-4">
                                    {Object.entries(isEditingBills ? editedBillTotals : balance.billTotals)
                                        .sort((a, b) => b[0] - a[0])
                                        .map(([den, cant]) => (
                                            <div key={den} className={`flex flex-col items-center justify-center p-2 md:p-3 min-h-[60px] md:min-h-0 border rounded-lg ${cant > 0 || isEditingBills ? 'border-white/30 bg-white/10' : 'border-white/5 opacity-30'}`}>
                                                <span className="text-[10px] text-zinc-400 mb-1">${Number(den).toLocaleString()}</span>
                                                {isEditingBills ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full bg-black/50 border border-white/50 text-center bw-tech text-base md:text-lg font-black text-white p-1 outline-none"
                                                        value={cant}
                                                        onChange={(e) => setEditedBillTotals({ ...editedBillTotals, [den]: parseInt(e.target.value) || 0 })}
                                                    />
                                                ) : (
                                                    <span className="bw-tech text-lg md:text-lg font-black text-white">{cant}</span>
                                                )}
                                                <span className="text-[8px] text-white/50 mt-1 uppercase">Billetes</span>
                                            </div>
                                        ))}
                                </div>
                            </div>)}

                        {/* FORMULARIO DESPLEGABLE */}
                        <AnimatePresence>
                            {showManualForm && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white/5 p-4 md:p-6 border border-white/10 rounded-xl md:rounded-none">

                                        <div className="md:col-span-3">
                                            <label className="bw-tech text-[9px] md:text-[8px] text-zinc-400 uppercase mb-2 md:mb-1 block">Descripción Producto</label>
                                            <input
                                                name="producto" value={manualEntry.producto} onChange={(e) => setManualEntry({ ...manualEntry, producto: e.target.value })}
                                                type="text" placeholder="ID / DESCRIPCIÓN" className="bw-input w-full min-h-[44px] md:min-h-0 text-[14px] md:text-[11px]" required
                                            />
                                        </div>
                                        <div>
                                            <label className="bw-tech text-[9px] md:text-[8px] text-zinc-400 uppercase mb-2 md:mb-1 block">Monto ARS</label>
                                            <input
                                                name="monto" value={manualEntry.monto} onChange={(e) => setManualEntry({ ...manualEntry, monto: e.target.value })}
                                                type="number" placeholder="0.00" className="bw-input w-full min-h-[44px] md:min-h-0 text-[14px] md:text-[11px]" required
                                            />
                                        </div>
                                        <div>
                                            <label className="bw-tech text-[9px] md:text-[8px] text-zinc-400 uppercase mb-2 md:mb-1 block">Método</label>
                                            <select
                                                name="metodo_pago" value={manualEntry.metodo_pago}
                                                onChange={(e) => setManualEntry({ ...manualEntry, metodo_pago: e.target.value })}
                                                className="bw-input w-full min-h-[44px] md:min-h-0 text-[14px] md:text-[11px] cursor-pointer"
                                            >
                                                <option value="transferencia">TRANSFERENCIA</option>
                                                <option value="efectivo">EFECTIVO</option>
                                                <option value="debito">DÉBITO</option>
                                                <option value="mixto">MIXTO (2 PAGOS)</option>
                                            </select>
                                        </div>

                                        {/* CAMPOS DINÁMICOS PARA PAGO MIXTO */}
                                        {manualEntry.metodo_pago === 'mixto' && (
                                            <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-white/30 bg-white/5 mt-2 rounded-xl md:rounded">
                                                <div>
                                                    <label className="bw-tech text-[9px] md:text-[8px] text-white uppercase mb-2 md:mb-1 block">EFECTIVO</label>
                                                    <input
                                                        type="number"
                                                        placeholder="$"
                                                        value={manualEntry.detalles_mixto?.efectivo || ''}
                                                        onChange={e => setManualEntry({ ...manualEntry, detalles_mixto: { ...manualEntry.detalles_mixto, efectivo: e.target.value } })}
                                                        className="bw-input w-full min-h-[44px] md:min-h-0 text-[14px] md:text-[11px]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="bw-tech text-[9px] md:text-[8px] text-white uppercase mb-2 md:mb-1 block">TRANSFERENCIA</label>
                                                    <input
                                                        type="number"
                                                        placeholder="$"
                                                        value={manualEntry.detalles_mixto?.transferencia || ''}
                                                        onChange={e => setManualEntry({ ...manualEntry, detalles_mixto: { ...manualEntry.detalles_mixto, transferencia: e.target.value } })}
                                                        className="bw-input w-full min-h-[44px] md:min-h-0 text-[14px] md:text-[11px]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="bw-tech text-[9px] md:text-[8px] text-white uppercase mb-2 md:mb-1 block">DÉBITO</label>
                                                    <input
                                                        type="number"
                                                        placeholder="$"
                                                        value={manualEntry.detalles_mixto?.debito || ''}
                                                        onChange={e => setManualEntry({ ...manualEntry, detalles_mixto: { ...manualEntry.detalles_mixto, debito: e.target.value } })}
                                                        className="bw-input w-full min-h-[44px] md:min-h-0 text-[14px] md:text-[11px]"
                                                    />
                                                </div>
                                                <p className="md:col-span-3 text-[10px] md:text-[9px] text-center text-gray-300 font-bold tracking-widest mt-2">
                                                    TOTAL ASIGNADO: ${((parseFloat(manualEntry.detalles_mixto?.efectivo || 0) + parseFloat(manualEntry.detalles_mixto?.transferencia || 0) + parseFloat(manualEntry.detalles_mixto?.debito || 0)) || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        )}

                                        <div className="md:col-span-5 flex justify-end pt-4 md:pt-2 mt-2 md:mt-0">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="bg-white text-black bw-title w-full md:w-auto min-h-[48px] md:min-h-0 px-10 py-3 text-[12px] md:text-[10px] hover:bg-gray-200 active:scale-95 md:active:scale-100 transition-all flex items-center justify-center space-x-2 rounded-lg md:rounded-none"
                                            >
                                                <PaperAirplaneIcon className="w-4 h-4 md:w-3 md:h-3" />
                                                <span>{isSubmitting ? 'SINCRONIZANDO...' : 'EJECUTAR TRANSACCIÓN'}</span>
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
                {activeTab === 'egresos' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><EgressForm onSubmit={() => { }} /></motion.div>}
                {activeTab === 'personal' && <PersonalBalanceModule />}
                {activeTab === 'ganancias' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><SeccionGanancias entries={allEntries} /></motion.div>}
                {activeTab === 'monthlyExpenses' && <MonthlyExpenseTracker />}

            </div>

            <div className="mt-8 md:mt-12 text-center relative z-10">
                <p className="bw-tech text-[9px] text-zinc-600 uppercase tracking-widest break-words px-4">
                    Desarrollo Empty // CEO Tomás Manazza // {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default BalanceModule;