import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Iconos
import { FiPlus, FiCheck, FiRefreshCcw, FiClock, FiLayers, FiImage, FiInfo, FiPackage, FiDollarSign, FiList, FiTrash2, FiChevronDown } from 'react-icons/fi';

// Importación de módulos externos (Lógica intacta)
import ProductReturnTracker from '../productos/devolucionProductos';
import HistorialDevoluciones from './historial de devoluciones';
import IngresoMercaderia from './cargaMercaderiaMasiva';
import SearchableSelect from '../../../components/SearchableSelect';
import { IKContext, IKUpload } from 'imagekitio-react';

// --- Datos de Referencia ---
const getTodayDate = () => new Date().toISOString().split('T')[0];
const API_URL = import.meta.env.VITE_API_URL;

const authenticator = async () => {
    try {
        const response = await fetch(`${API_URL}/api/auth/imagekit`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        const { signature, expire, token } = data;
        return { signature, expire, token };
    } catch (error) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
};

const initialProductState = {
    nombre: '',
    marca: '',
    categoria: '',
    alerta: '5',
    proveedor: '',
    fechaActualizacionPrecio: getTodayDate(),
    ultimaFechaCargoStock: getTodayDate(),
    descripcion: '',
    imagenes: [],
    variantes: []
};

const initialVariantState = {
    color: '',
    almacenamiento: '',
    stock: '',
    costoDeCompra: '',
    precioAlPublico: '',
    precioMayorista: '',
    precioRevendedor: ''
};

const PREDEFINED_COLORS = [
    { name: 'Negro', code: '#1C1C1E' },
    { name: 'Blanco', code: '#F5F5F7' },
    { name: 'Rojo', code: '#E11C2A' },
    { name: 'Azul', code: '#0071E3' },
    { name: 'Verde', code: '#505652' },
    { name: 'Gris', code: '#8E8E93' },
    { name: 'Dorado', code: '#F9E5C9' },
    { name: 'Plateado', code: '#E3E4E5' },
    { name: 'Violeta', code: '#E5DDEA' },
    { name: 'Grafito', code: '#424245' },
    { name: 'Sierra Azul', code: '#9BB5CE' },
    { name: 'Medianoche', code: '#192028' },
    { name: 'Estelar', code: '#FAF7F4' },
    { name: 'Titanio', code: '#BEBDB8' },
    { name: 'Deep Purple', code: '#594F63' }
];

// --- COMPONENTE: CARGA DE PRODUCTOS ---
const CargaDeProductosContent = () => {
    const [nuevoProducto, setNuevoProducto] = useState(initialProductState);
    const [variantInput, setVariantInput] = useState(initialVariantState);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [proveedores, setProveedores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [newCategoryInput, setNewCategoryInput] = useState("");
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isDeletingCategory, setIsDeletingCategory] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        fetchProvidersList();
        fetchCategoriesList();
    }, []);

    const fetchProvidersList = async () => {
        try {
            const res = await axios.get(`${API_URL}/providers`);
            if (Array.isArray(res.data)) {
                setProveedores(res.data.map(p => p.nombre));
            }
        } catch (error) {
            console.error("ERROR_FETCH_PROVIDERS", error);
        }
    };

    const fetchCategoriesList = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/categories`);
            if (Array.isArray(res.data)) {
                setCategorias(res.data);
            }
        } catch (error) {
            console.error("ERROR_FETCH_CATEGORIES", error);
            // No bloqueamos la UI si falla, el usuario puede agregar una nueva
        }
    };

    const handleAddCategory = async () => {
        const trimmedCategory = newCategoryInput.trim();
        if (!trimmedCategory) return;
        setIsAddingCategory(true);
        try {
            const response = await axios.post(`${API_URL}/api/categories`, { nombre: trimmedCategory });
            await fetchCategoriesList(); // Re-sincroniza la lista completa
            setNuevoProducto(prev => ({ ...prev, categoria: response.data.categoryName }));
            setNewCategoryInput("");
        } catch (error) {
            console.error("ERROR_ADD_CATEGORY", error);
            if (error.response && error.response.status === 409) {
                const existingCategory = error.response.data.category;
                setNuevoProducto(prev => ({ ...prev, categoria: existingCategory.categoryName }));
                setNewCategoryInput("");
                alert("SISTEMA: La categoría ya existe, se ha seleccionado.");
            } else {
                alert("SISTEMA: Error al agregar la categoría.");
            }
        } finally {
            setIsAddingCategory(false);
        }
    };

    const handleDeleteCategory = async () => {
        const categoryName = nuevoProducto.categoria;
        if (!categoryName) {
            alert("SISTEMA: Por favor, seleccione una categoría para eliminar.");
            return;
        }

        const categoryToDelete = categorias.find(cat => cat.categoryName === categoryName);
        if (!categoryToDelete) {
            alert("SISTEMA: La categoría seleccionada no es válida o ya fue eliminada.");
            return;
        }

        if (window.confirm(`¿Está seguro que desea eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`)) {
            setIsDeletingCategory(true);
            try {
                await axios.delete(`${API_URL}/api/categories/${categoryToDelete.categoryId}`);
                // Activamos animación de éxito
                setDeleteSuccess(true);
                setNuevoProducto(prev => ({ ...prev, categoria: '' }));
                await fetchCategoriesList();
                // Reseteamos el estado después de 2 segundos
                setTimeout(() => setDeleteSuccess(false), 2000);
            } catch (error) {
                console.error("ERROR_DELETE_CATEGORY", error);
                alert(error.response?.data?.message || "SISTEMA: Error al eliminar la categoría. Es posible que esté en uso por algún producto.");
            } finally {
                setIsDeletingCategory(false);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoProducto(prev => ({ ...prev, [name]: value }));
    };

    const onError = err => {
        console.error("Error", err);
        alert("SISTEMA: Error al subir imágenes a la nube.");
        setLoading(false);
        setUploadProgress(0);
    };

    const onSuccess = res => {
        setNuevoProducto(prev => ({ ...prev, imagenes: [...prev.imagenes, res.url] }));
        setLoading(false);
        setUploadProgress(0);
    };

    const handleRemoveImage = (indexToRemove) => {
        setNuevoProducto(prev => ({
            ...prev,
            imagenes: prev.imagenes.filter((_, index) => index !== indexToRemove)
        }));
    };

    const onUploadStart = (evt) => {
        setFileError('');
        const file = evt.target.files[0];
        if (file && !file.type.startsWith('image/')) {
            setFileError("SISTEMA: El archivo seleccionado no es una imagen válida (JPG, PNG, WEBP, etc.).");
            setLoading(false);
            return;
        }
        setLoading(true);
        setUploadProgress(50);
    };

    const preventInvalidNumbers = (e) => {
        if (['-', '+', 'e', 'E'].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleGuardarProducto = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...nuevoProducto,
                    origenDeVenta: 'admin'
                })
            });

            if (response.ok) {
                alert(`SISTEMA: Producto "${nuevoProducto.nombre || 'Sin nombre'}" indexado con éxito.`);
                setNuevoProducto(initialProductState);
                setErrorMsg('');
            } else {
                const errorData = await response.json().catch(() => ({}));
                setErrorMsg(errorData.message || "ERROR: No se pudo crear el producto.");
            }
        } catch (error) {
            console.error(error);
            setErrorMsg("ERROR: Fallo de conexión o del servidor.");
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE VARIANTES ---
    const handleVariantChange = (e) => {
        const { name, value } = e.target;
        setVariantInput(prev => ({ ...prev, [name]: value }));
    };

    const addVariant = () => {
        setNuevoProducto(prev => {
            const variantToAdd = {
                ...variantInput,
                color: variantInput.color || 'Unico',
                almacenamiento: variantInput.almacenamiento || 'Unico',
                stock: Number(variantInput.stock),
                costoDeCompra: Number(variantInput.costoDeCompra),
                precioAlPublico: Number(variantInput.precioAlPublico),
                precioMayorista: Number(variantInput.precioMayorista),
                precioRevendedor: Number(variantInput.precioRevendedor)
            };
            const updatedVariantes = [...prev.variantes, variantToAdd];
            return { ...prev, variantes: updatedVariantes };
        });
        setVariantInput(initialVariantState);
    };

    const removeVariant = (index) => {
        setNuevoProducto(prev => {
            const updatedVariantes = prev.variantes.filter((_, i) => i !== index);
            return { ...prev, variantes: updatedVariantes };
        });
    };

    // --- ESTILOS BLANCO Y NEGRO (INTER) ---
    const inputStyle = "w-full bg-black border border-zinc-800 rounded-none py-3 px-4 text-white font-['Inter'] font-medium focus:border-white focus:ring-1 focus:ring-white outline-none transition-all placeholder:text-zinc-600 text-sm";
    const labelStyle = "block text-[11px] font-bold text-white uppercase tracking-wider mb-2 font-['Inter']";
    const sectionTitle = "text-[10px] font-black text-white mb-8 uppercase tracking-[0.4em] flex items-center border-l-2 border-white pl-4 font-['Inter']";

    return (
        <div className="bg-black border border-zinc-800 shadow-2xl">
            {/* Cabecera Interna */}
            <div className="bg-black p-4 md:p-6 border-b border-zinc-800">
                <h2 className="text-lg md:text-xl font-['Inter'] font-[900] text-white uppercase tracking-tighter flex items-center">
                    <FiPlus className="mr-3 text-white" /> Registro de Nuevo Producto
                </h2>
            </div>

            <div className="p-4 md:p-12">
                <form onSubmit={(e) => { e.preventDefault(); handleGuardarProducto(); }} className="space-y-12">

                    {/* I. Identificación */}
                    <section>
                        <h3 className={sectionTitle}>01. Identificación Técnica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-3">
                                <label className={labelStyle}>Nombre del Producto</label>
                                <input type="text" name="nombre" value={nuevoProducto.nombre} onChange={handleInputChange} className={inputStyle} placeholder="EJ: IPHONE 15 PRO MAX" />
                            </div>
                            <div>
                                <label className={labelStyle}>Marca / Fabricante</label>
                                <input type="text" name="marca" value={nuevoProducto.marca} onChange={handleInputChange} className={inputStyle} placeholder="EJ: APPLE" />
                            </div>
                            <div>
                                <label className={labelStyle}>Categoría</label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <select name="categoria" value={nuevoProducto.categoria} onChange={handleInputChange} className={inputStyle}>
                                            <option value="" className="bg-black">SELECCIONAR...</option>
                                            {categorias.map(cat => <option key={cat.categoryId} value={cat.categoryName} className="bg-black">{cat.categoryName}</option>)}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleDeleteCategory}
                                            disabled={isDeletingCategory || (!nuevoProducto.categoria && !deleteSuccess) || deleteSuccess}
                                            className={`p-3 font-bold uppercase transition-all duration-300 flex items-center justify-center ${deleteSuccess
                                                ? 'bg-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                                                : 'bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-800'
                                                }`}
                                            title="Eliminar categoría seleccionada"
                                        >
                                            {isDeletingCategory ? '...' : deleteSuccess ? <FiCheck size={20} className="animate-bounce" /> : <FiTrash2 />}
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newCategoryInput}
                                            onChange={(e) => setNewCategoryInput(e.target.value)}
                                            className={`${inputStyle} text-xs h-10`}
                                            placeholder="O crear nueva categoría..."
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            disabled={isAddingCategory || !newCategoryInput.trim()}
                                            className="p-3 bg-zinc-900 hover:bg-white text-white hover:text-black font-bold uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-zinc-800"
                                        >
                                            {isAddingCategory ? '...' : <FiPlus />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* II. Variantes */}
                    <section className="bg-black p-6 border border-zinc-800">
                        <h3 className={`${sectionTitle} border-l-0 pl-0 mb-6 text-white`}>02. Configuración de Variantes</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
                            <div>
                                <label className={labelStyle}>Color</label>
                                <div className="relative">
                                    <div
                                        className={`${inputStyle} flex items-center justify-between cursor-pointer`}
                                        onClick={() => setShowColorPicker(!showColorPicker)}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-3 h-3 rounded-full border border-zinc-600 flex-shrink-0" style={{ backgroundColor: variantInput.color || 'transparent' }}></div>
                                            <span className={`truncate ${variantInput.color ? 'text-white' : 'text-zinc-500'}`}>{variantInput.color || 'SELECCIONAR'}</span>
                                        </div>
                                        <FiChevronDown className={`text-zinc-500 transition-transform ${showColorPicker ? 'rotate-180' : ''}`} />
                                    </div>
                                    {showColorPicker && (
                                        <div className="absolute top-full left-0 w-[200%] z-50 bg-black border border-zinc-800 p-3 shadow-2xl grid grid-cols-5 gap-2 mt-1">
                                            {PREDEFINED_COLORS.map((c) => (
                                                <button key={c.code} type="button" onClick={() => { setVariantInput(prev => ({ ...prev, color: c.code })); setShowColorPicker(false); }} className="flex flex-col items-center gap-1 p-1 hover:bg-zinc-900 rounded transition-colors group" title={c.name}>
                                                    <div className="w-6 h-6 rounded-full border border-zinc-700 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: c.code }} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Capacidad</label>
                                <input type="text" name="almacenamiento" placeholder="Ej: 128GB" value={variantInput.almacenamiento} onChange={handleVariantChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Stock</label>
                                <input type="number" name="stock" placeholder="0" value={variantInput.stock} onChange={handleVariantChange} onKeyDown={preventInvalidNumbers} min="0" className={`${inputStyle} focus:border-white`} />
                            </div>
                            <div>
                                <label className={labelStyle}>Costo</label>
                                <input type="number" name="costoDeCompra" placeholder="0.00" value={variantInput.costoDeCompra} onChange={handleVariantChange} onKeyDown={preventInvalidNumbers} min="0" className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>$ Público</label>
                                <input type="number" name="precioAlPublico" placeholder="0.00" value={variantInput.precioAlPublico} onChange={handleVariantChange} onKeyDown={preventInvalidNumbers} min="0" className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>$ Mayorista</label>
                                <input type="number" name="precioMayorista" placeholder="0.00" value={variantInput.precioMayorista} onChange={handleVariantChange} onKeyDown={preventInvalidNumbers} min="0" className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>$ Revendedor</label>
                                <input type="number" name="precioRevendedor" placeholder="0.00" value={variantInput.precioRevendedor} onChange={handleVariantChange} onKeyDown={preventInvalidNumbers} min="0" className={inputStyle} />
                            </div>
                        </div>
                        <button type="button" onClick={addVariant} className="w-full py-3 bg-zinc-900 hover:bg-white hover:text-black text-white font-['Inter'] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-6 border border-zinc-800">
                            <FiList /> Añadir Variante al Lote
                        </button>

                        {/* Lista de Variantes Agregadas */}
                        {nuevoProducto.variantes.length > 0 && (
                            <div className="space-y-2">
                                {nuevoProducto.variantes.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between bg-black p-3 border border-zinc-800 border-l-2 border-l-white">
                                        <div className="flex gap-4 text-[10px] font-['Inter'] text-zinc-400 uppercase">
                                            <span className="text-white font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-zinc-600" style={{ backgroundColor: v.color }}></div> {v.color} {v.almacenamiento}</span>
                                            <span>Stock: {v.stock}</span>
                                            <span>Costo: ${v.costoDeCompra}</span>
                                            <span>Público: ${v.precioAlPublico}</span>
                                            <span>Revendedor: ${v.precioRevendedor}</span>
                                        </div>
                                        <button type="button" onClick={() => removeVariant(i)} className="text-zinc-600 hover:text-white transition-colors">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* III. Stock y Logística */}
                    <section>
                        <h3 className={sectionTitle}>03. Gestión de Existencias</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <label className={labelStyle}>Unidades Totales</label>
                                <input
                                    type="number"
                                    value={nuevoProducto.variantes.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)}
                                    readOnly
                                    className={`${inputStyle} font-['Inter'] text-white text-lg opacity-50 cursor-not-allowed`}
                                />
                                <span className="text-[9px] text-zinc-500 uppercase block mt-1">* Calculado por variantes</span>
                            </div>
                            <div>
                                <label className={labelStyle}>Alerta de Stock Mínimo</label>
                                <input type="number" name="alerta" value={nuevoProducto.alerta} onChange={handleInputChange} onKeyDown={preventInvalidNumbers} min="0" className={inputStyle} />
                            </div>
                            <div className="z-20">
                                <SearchableSelect
                                    label="Proveedor / Origen"
                                    options={proveedores}
                                    value={nuevoProducto.proveedor}
                                    onChange={val => setNuevoProducto({ ...nuevoProducto, proveedor: val })}
                                    styles={{ label: labelStyle, input: inputStyle }}
                                    placeholder="BUSCAR PROVEEDOR..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* IV. Detalles Adicionales */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>Fecha Actualización</label>
                                    <input type="date" name="fechaActualizacionPrecio" value={nuevoProducto.fechaActualizacionPrecio} onChange={handleInputChange} className={`${inputStyle} text-xs`} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Fecha Último Cargo</label>
                                    <input type="date" name="ultimaFechaCargoStock" value={nuevoProducto.ultimaFechaCargoStock} onChange={handleInputChange} className={`${inputStyle} text-xs`} />
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Descripción del Producto</label>
                                <textarea name="descripcion" value={nuevoProducto.descripcion} onChange={handleInputChange} rows="3" className={`${inputStyle} resize-none normal-case`} placeholder="Detalles, IMEI, especificaciones..." />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className={labelStyle}>Activos Multimedia (Máx 10)</label>
                            <div className="flex-grow border border-dashed border-zinc-800 flex flex-col items-center justify-center p-8 bg-black hover:bg-zinc-900 transition-all cursor-pointer relative group">
                                {loading ? (
                                    <div className="flex flex-col items-center">
                                        <FiRefreshCcw size={40} className="text-white animate-spin mb-4" />
                                        <div className="w-16 h-1 bg-zinc-800 mb-2 overflow-hidden">
                                            <div className="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                        <span className="font-['Inter'] font-black text-[9px] uppercase tracking-widest text-white">Subiendo {uploadProgress}%</span>
                                    </div>
                                ) : (
                                    <>
                                        <FiImage size={40} className="text-zinc-700 group-hover:text-white transition-colors mb-4" />
                                        <span className="font-['Inter'] font-black text-[9px] uppercase tracking-widest text-zinc-500">Subir Archivos</span>
                                    </>
                                )}
                                <IKContext
                                    publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
                                    urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
                                    authenticator={authenticator}
                                >
                                    <IKUpload
                                        fileName="product_img"
                                        useUniqueFileName={true}
                                        folder="/products"
                                        multiple={true}
                                        onError={onError}
                                        onSuccess={onSuccess}
                                        onUploadStart={onUploadStart}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        disabled={loading}
                                    />
                                </IKContext>
                                {fileError && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 text-white text-[10px] font-black p-2 uppercase tracking-widest animate-pulse z-50">
                                        {fileError}
                                    </div>
                                )}
                                {nuevoProducto.imagenes.length > 0 && !loading && (
                                    <div className="mt-6 w-full grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {nuevoProducto.imagenes.map((url, index) => (
                                            <div key={index} className="relative aspect-square group/img border border-zinc-800 bg-black overflow-hidden">
                                                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover opacity-70 group-hover/img:opacity-100 transition-opacity" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveImage(index);
                                                    }}
                                                    className="absolute top-1 right-1 p-1.5 bg-black border border-zinc-700 text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-zinc-800 shadow-lg"
                                                    title="Eliminar imagen"
                                                >
                                                    <FiTrash2 size={12} />
                                                </button>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-0.5 px-2">
                                                    <p className="text-[7px] text-zinc-400 font-bold uppercase truncate">IMG_{index + 1}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Footer de Acciones */}
                    {errorMsg && (
                        <div className="bg-zinc-900 border border-zinc-700 text-white p-4 font-['Inter'] text-xs uppercase tracking-widest text-center mb-6">
                            {errorMsg}
                        </div>
                    )}
                    <div className="flex justify-end items-center space-x-8 pt-10 border-t border-zinc-800">
                        <button type="button" onClick={() => setNuevoProducto(initialProductState)} className="font-['Inter'] font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                            Limpiar Formulario
                        </button>
                        <button type="submit" disabled={loading} className="px-12 py-4 font-['Inter'] font-black text-[11px] uppercase tracking-[0.2em] bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.05)] flex items-center">
                            {loading ? "PROCESANDO..." : <><FiCheck className="mr-3" size={18} /> Guardar Producto</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const CargaDeProductos = () => {
    const [activeTab, setActiveTab] = useState('carga');

    const getTabClasses = (tabName) =>
        `px-8 py-5 text-[10px] font-['Inter'] font-black uppercase tracking-[0.3em] transition-all duration-300 flex items-center border-b-2 ${activeTab === tabName
            ? 'text-black bg-white border-white'
            : 'text-zinc-600 border-transparent hover:text-white bg-black'
        }`;

    return (
        <div className="bg-black min-h-screen p-6 md:p-12 font-['Inter'] selection:bg-white selection:text-black">
            {/* Header Principal */}
            <header className="mb-12">
                <h1 className="text-3xl md:text-5xl font-['Inter'] font-[900] text-white uppercase tracking-tighter leading-none">
                    INVENTARIO<span className="text-white">_</span>
                </h1>
                <p className="font-['Inter'] text-[9px] font-bold text-zinc-500 mt-4 uppercase tracking-[0.6em]">Core Control System / Fedecell</p>
            </header>

            {/* Navegación */}
            <div className="flex border-b border-zinc-900 mb-10 overflow-x-auto no-scrollbar">
                <button className={getTabClasses('carga')} onClick={() => setActiveTab('carga')}>
                    <FiPlus className="mr-2" /> Carga Manual
                </button>
                <button className={getTabClasses('masiva')} onClick={() => setActiveTab('masiva')}>
                    <FiLayers className="mr-2" /> Importación Masiva
                </button>
                <button className={getTabClasses('devolucion')} onClick={() => setActiveTab('devolucion')}>
                    <FiRefreshCcw className="mr-2" /> Devoluciones
                </button>

            </div>

            {/* Contenido */}
            <div className="transition-opacity duration-500">
                {activeTab === 'carga' && <CargaDeProductosContent />}
                {activeTab === 'masiva' && <IngresoMercaderia />}
                {activeTab === 'devolucion' && <ProductReturnTracker />}
                {activeTab === 'historial' && <HistorialDevoluciones />}
            </div>
        </div>
    );
};

export default CargaDeProductos;