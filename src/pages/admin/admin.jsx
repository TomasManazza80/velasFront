import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiDollarSign, FiPackage, FiShoppingCart } from 'react-icons/fi';

// --- Definiciones de Estilo (Tema CLARO) ---
const BG_LIGHT = "bg-gray-50"; // Fondo principal (Casi blanco)
const CARD_LIGHT = "bg-white"; // Fondo de tarjetas y secciones (Blanco puro)
const TEXT_DARK = "text-gray-800"; // Texto principal (Oscuro)
const TEXT_MUTED = "text-gray-500"; // Texto secundario/descriptivo (Gris)
const BORDER_LIGHT = "border-gray-200"; // Bordes (Gris claro)
const INPUT_LIGHT = "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500";
// ------------------------------------------

const API_URL = import.meta.env.VITE_API_URL;

const Admin = () => {
  // Estados y configuraciones
  const [showForm, setShowForm] = useState(false);
  const [recaudaciones, setRecaudaciones] = useState([]);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [todosMisProductos, setTodosMisProductos] = useState([]);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [recaudado, setRecaudado] = useState(0);
  const [seccionActiva, setSeccionActiva] = useState('productos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mostrarFormVentaManual, setMostrarFormVentaManual] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [recaudacionesExpandidas, setRecaudacionesExpandidas] = useState({});

  // Datos del nuevo producto (LÓGICA MANTENIDA)
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: '',
    marca: '',
    categoria: '',
    cantidad: '',
    talle: '', // Usado para Precio por Mayor
    imagenes: [],
    descripcion: '' 
  });

  // Opciones para formularios
  // --- CAMBIO DE CATEGORÍAS AQUÍ ---
  const categorias = [
    'Velas', 
    'Velas Premium', 
    'Aromatizadores', 
    'Floreros', 
    'Collares', 
    'Pulseras', 
    'Espejos', 
    'Yeso', 
    'Otros'
  ];
  // ---------------------------------

  // Cloudinary config
  const cloudinary = new Cloudinary({ cloud: { cloudName: 'dxvkqumpu' } });

  // --- Funciones Lógicas (MANTENIDAS INTACTAS) ---

  const obtenerRecaudaciones = async () => {
    try {
      const response = await axios.get(`${API_URL}/recaudation/recaudations`);
      if (response.data && Array.isArray(response.data)) {
        setRecaudaciones(response.data);
      } else {
        setRecaudaciones([]);
      }
    } catch (error) {
      console.error('Error al obtener recaudaciones:', error);
      setError('Error al cargar las recaudaciones');
      setRecaudaciones([]);
    }
  };
  
  // Handlers para productos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({ ...prev, [name]: value }));
  };
  
  // Lógica de validación
  const validarProducto = () => {
    if (!nuevoProducto.nombre) {
      setError('El nombre del producto es requerido');
      return false;
    }
    if (!nuevoProducto.precio || nuevoProducto.precio <= 0) {
      setError('El precio debe ser mayor a 0');
      return false;
    }
    if (!nuevoProducto.categoria) {
      setError('Debes seleccionar una categoría');
      return false;
    }
    if (!nuevoProducto.cantidad || nuevoProducto.cantidad <= 0) {
      setError('La cantidad en stock debe ser mayor a 0');
      return false;
    }
    return true;
  };

  // Lógica de reset
  const resetearFormulario = () => {
    setNuevoProducto({
      nombre: '',
      precio: '',
      marca: '',
      categoria: '',
      cantidad: '',
      talle: '',
      imagenes: [],
      descripcion: ''
    });
    setError(null);
    setUploadProgress(0);
  };

  // Función de subida a Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ecommerce');
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dxvkqumpu/image/upload`, 
        formData
      );
      return response.data.secure_url;
    } catch (err) {
      console.error('Error subiendo imagen:', file.name, err);
      setError(`Error al subir ${file.name}`);
      return null;
    }
  };

  // Función de manejo de selección de archivos
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 10) {
      setError('Máximo 10 imágenes permitidas');
      return;
    }

    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const isTypeValid = validTypes.includes(file.type);
      const isSizeValid = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isTypeValid) {
        setError(`El archivo ${file.name} no es un tipo de imagen válido (JPEG, PNG, GIF)`);
        return false;
      }
      
      if (!isSizeValid) {
        setError(`El archivo ${file.name} excede el tamaño máximo de 10MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setLoading(true);
    setError(null);
    setUploadProgress(0);
    setNuevoProducto(prev => ({ ...prev, imagenes: [] })); 

    try {
      const uploadedImages = [];
      const totalFiles = validFiles.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = validFiles[i];
        const url = await uploadImageToCloudinary(file);
        if (url) {
          uploadedImages.push(url);
          setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
          setNuevoProducto(prev => ({
            ...prev,
            imagenes: uploadedImages
          }));
        }
      }
      
    } catch (err) {
      setError('Error al subir algunas imágenes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para remover imágenes
  const handleRemoveImage = (indexToRemove) => {
    setNuevoProducto(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Lógica de agregación final
  const handleAgregarProducto = async () => {
    if (!validarProducto()) return;

    if (nuevoProducto.imagenes.length === 0) {
      setError('Debes subir al menos una imagen del producto');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/products`, nuevoProducto);
      
      setTodosMisProductos([...todosMisProductos, response.data]);
      resetearFormulario();
      setSeccionActiva('productos');
      
    } catch (err) {
      setError(`Error al crear producto: ${err.response?.data?.message || err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // El resto de funciones (CRUD, Recaudación, Venta Manual) se mantienen intactas.
  
  const eliminarRecaudacion = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta recaudación? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/recaudation/recaudation/${id}`);
      setRecaudaciones(recaudaciones.filter(rec => rec.id !== id));
    } catch (error) {
      console.error('Error al eliminar recaudación:', error);
      setError(`Error al eliminar recaudación: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarRecaudacion = async () => {
    if (!window.confirm('¿Estás seguro de cerrar la recaudación? Esta acción registrará el total actual.')) {
      return;
    }
    try {
      setLoading(true);
      
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const fechaActual = new Date();
      const nombreMes = `${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;

      if (recaudaciones.some(r => r.mes === nombreMes)) {
        alert(`Ya existe recaudación para ${nombreMes}`);
        return;
      }

      const { data: productosVendidos } = await axios.get(`${API_URL}/boughtProduct/AllboughtProducts`);
      
      const montoTotal = productosVendidos.reduce((total, producto) => {
        const precio = parseFloat(producto.precio) || 0;
        const cantidad = parseInt(producto.cantidad) || 0;
        return total + (precio * cantidad);
      }, 0);

      const body = {
        mes: nombreMes,
        productosVendidos: productosVendidos,
        montoRecaudado: parseFloat(montoTotal.toFixed(2)) 
      };

      const { data: nuevaRecaudacion } = await axios.post(
        `${API_URL}/recaudation/recaudation`, 
        body
      );

      setRecaudaciones([...recaudaciones, nuevaRecaudacion]);
      
      const productosAEliminar = [...productosVendidos];
      
      while (productosAEliminar.length > 0) {
        const producto = productosAEliminar[0]; 
        await handleEliminarProductoVendido(producto.ProductId); 
        productosAEliminar.shift(); 
      }
      
      setRecaudado(0); 
      
    } catch (error) {
      console.error('Error completo:', {
        message: error.message,
        response: error.response?.data,
        request: error.request
      });
      
      setError(error.response?.data?.message || 
               `Error al cerrar recaudación: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandirRecaudacion = (id) => {
    setRecaudacionesExpandidas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const [ventaManual, setVentaManual] = useState({
    nombre: '',
    precio: '',
    marca: '',
    categoria: '',
    cantidad: 1,
    talle: '',
    imagenes: [],
    fechaVenta: new Date().toISOString().split('T')[0]
  });
  
  const handleVentaManualChange = (e) => {
    const { name, value } = e.target;
    setVentaManual(prev => ({ ...prev, [name]: value }));
  };

  // Filtrar productos
  const productosFiltrados = todosMisProductos.filter(producto =>
    producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    producto.marca.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  // Efectos para cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [productosRes, ventasRes] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/boughtProduct/AllboughtProducts`)
        ]);
        setTodosMisProductos(productosRes.data);
        setProductosVendidos(ventasRes.data);
        
        // Calcular recaudación total
        const total = ventasRes.data.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        setRecaudado(total);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);
  
  useEffect(() => {
    if (seccionActiva === 'reporte') {
      obtenerRecaudaciones();
    }
  }, [seccionActiva]);
  
  // El resto de CRUD para productos (Edición y Eliminación)
  const handleEditarProducto = async (productoActualizado) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/products/${productoActualizado.ProductId}`, 
        productoActualizado
      );
      setTodosMisProductos(todosMisProductos.map(p => 
        p.ProductId === productoActualizado.ProductId ? response.data : p
      ));
      setProductoAEditar(null);
    } catch (err) {
      setError('Error al editar producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarProducto = async (ProductId) => {
  if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
  
  try {
    setLoading(true);
    await axios.delete(`${API_URL}/products/${ProductId}`);
    setTodosMisProductos(todosMisProductos.filter(p => p.ProductId !== ProductId));
    
  } catch (err) {
    alert(`Error al eliminar producto: ${err.response?.data?.message || err.message}`);
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};

  const descontarStock = async (productId, cantidad) => {
    await axios.put(`${API_URL}/products/update-quantity/${productId}`, {
      quantityToDiscount: cantidad
    });
  };

  const handleEliminarProductoVendido = async (id) => {
    try {
      setProductosVendidos(prev => {
        const totalPrevio = prev.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const productoEliminado = prev.find(p => p.ProductId === id);
        
        let nuevoTotal = totalPrevio;
        if (productoEliminado) {
          nuevoTotal = totalPrevio - (productoEliminado.precio * productoEliminado.cantidad);
        }
        
        setRecaudado(nuevoTotal);

        return prev.filter(p => p.ProductId !== id);
      });
      
      await axios.delete(`${API_URL}/boughtProduct/${id}`);

    } catch (err) {
      console.error('Error:', err);
    }
  };

  const registrarVentaManual = async () => {
    if (!ventaManual.nombre || !ventaManual.precio || ventaManual.precio <= 0 || 
        !ventaManual.cantidad || ventaManual.cantidad <= 0) {
      setError('Nombre, precio y cantidad son campos requeridos y deben ser mayores a 0');
      return;
    }

    if (!ventaManual.fechaVenta) {
      setError('La fecha de venta es requerida');
      return;
    }

    const fechaSeleccionada = new Date(ventaManual.fechaVenta);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    
    if (fechaSeleccionada > hoy) {
      setError('La fecha de venta no puede ser futura');
      return;
    }

    const producto = todosMisProductos.find(p => p.nombre === ventaManual.nombre);
    if (producto && ventaManual.cantidad > producto.cantidad) {
      setError(`No hay suficiente stock. Disponible: ${producto.cantidad}`);
      return;
    }

    try {
      setLoading(true);
      
      const productoVendido = {
        nombre: ventaManual.nombre,
        precio: parseFloat(ventaManual.precio),
        marca: ventaManual.marca || producto?.marca || 'Varios',
        categoria: ventaManual.categoria || producto?.categoria || 'Varios',
        cantidad: parseInt(ventaManual.cantidad),
        talle: ventaManual.talle || producto?.talle || 'Único',
        imagenes: ventaManual.imagenes || producto?.imagenes || [],
        fechaCompra: new Date(ventaManual.fechaVenta).toISOString()
      };

      await axios.post(`${API_URL}/boughtProduct/boughtProduct`, productoVendido);
      
      if (producto) {
        await descontarStock(producto.ProductId, ventaManual.cantidad);
      }
      
      const response = await axios.get(`${API_URL}/boughtProduct/AllboughtProducts`);
      setProductosVendidos(response.data);
      
      const total = response.data.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      setRecaudado(total);
      
      setMostrarFormVentaManual(false);
      setVentaManual({
        nombre: '',
        precio: '',
        marca: '',
        categoria: '',
        cantidad: 1,
        talle: '',
        imagenes: [],
        fechaVenta: new Date().toISOString().split('T')[0]
      });
      setProductoSeleccionado(null);
      setBusquedaProducto('');
      setError(null);
      
    } catch (err) {
      console.error('Error al registrar venta manual:', err);
      setError(`Error al registrar venta: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Componente de Edición (Estilos actualizados)
  const EditarProducto = ({ producto, onGuardarCambios, onCancelar }) => {
    const [formData, setFormData] = useState({ ...producto });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onGuardarCambios({
        ...formData,
        talle: formData.talle,
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`rounded-lg shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto ${CARD_LIGHT} ${TEXT_DARK}`}>
          <h3 className="text-xl font-semibold mb-4">Editar Producto</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {['nombre', 'precio', 'marca', 'categoria', 'cantidad', 'precio por mayor', 'descripcion'].map((field) => (
              <div key={field}>
                <label className={`block text-sm font-medium mb-1 capitalize ${TEXT_MUTED}`}>
                  {field.replace('_', ' ')}
                </label>
                {field === 'categoria' ? (
                  <select
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${INPUT_LIGHT}`}
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : field === 'precio por mayor' ? (
                  <input
                    type="number"
                    name="talle"
                    value={formData['talle']}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${INPUT_LIGHT}`}
                    placeholder="0.00"
                  />
                ) : field === 'descripcion' ? (
                  <textarea
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${INPUT_LIGHT}`}
                    rows="3"
                  />
                ) : (
                  <input
                    type={field === 'precio' || field === 'cantidad' ? 'number' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${INPUT_LIGHT}`}
                    min={field === 'precio' || field === 'cantidad' ? '0' : undefined}
                    step={field === 'precio' ? '0.01' : undefined}
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancelar}
                className="px-4 py-2 border rounded-md text-gray-700 border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Componente de Formulario para Venta Manual (Estilos actualizados)
  const FormularioVentaManual = ({ onClose, onSubmit }) => {
    const [busquedaLocal, setBusquedaLocal] = useState(busquedaProducto); 
    const inputRef = React.useRef(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    const handleBusquedaChange = (e) => {
      const value = e.target.value;
      setBusquedaLocal(value);
      setBusquedaProducto(value);
    };

    const handleSeleccionProducto = (producto) => {
      setProductoSeleccionado(producto);
      setVentaManual({
        nombre: producto.nombre,
        precio: producto.precio,
        marca: producto.marca,
        categoria: producto.categoria,
        cantidad: 1,
        talle: producto.talle,
        imagenes: producto.imagenes,
        fechaVenta: new Date().toISOString().split('T')[0]
      });
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-lg shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto ${CARD_LIGHT} ${TEXT_DARK}`}>
          <h3 className="text-xl font-semibold mb-4">Registrar Venta Manual</h3>
          
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
            <div>
              <label htmlFor="buscarProducto" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                Buscar Producto
              </label>
              <input
                ref={inputRef}
                type="text"
                id="buscarProducto"
                value={busquedaLocal}
                onChange={handleBusquedaChange}
                className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none ${INPUT_LIGHT}`}
                placeholder="Buscar por nombre o marca"
              />
            </div>

            <div className={`max-h-60 overflow-y-auto ${BORDER_LIGHT} border rounded-md`}>
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map((producto) => (
                  <div
                    key={producto.ProductId}
                    onClick={() => handleSeleccionProducto(producto)}
                    className={`p-3 hover:bg-gray-100 cursor-pointer ${productoSeleccionado?.ProductId === producto.ProductId ? 'bg-gray-200' : ''}`}
                  >
                    <div className="flex items-center">
                      {producto.imagenes?.length > 0 && (
                        <img 
                          src={producto.imagenes[0]} 
                          alt={producto.nombre}
                          className="h-10 w-10 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <p className="font-medium">{producto.nombre}</p>
                        <p className={`text-sm ${TEXT_MUTED}`}>${producto.precio} | Stock: {producto.cantidad}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-3 text-center ${TEXT_MUTED}`}>No se encontraron productos</div>
              )}
            </div>

            {productoSeleccionado && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="precio" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                      Precio
                    </label>
                    <input
                      type="number"
                      name="precio"
                      value={ventaManual.precio}
                      onChange={handleVentaManualChange}
                      min="0"
                      step="0.01"
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none ${INPUT_LIGHT}`}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="cantidad" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                      Cantidad
                    </label>
                    <input
                      type="number"
                      name="cantidad"
                      value={ventaManual.cantidad}
                      onChange={handleVentaManualChange}
                      min="1"
                      max={productoSeleccionado.cantidad}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none ${INPUT_LIGHT}`}
                      required
                    />
                    <p className={`text-xs ${TEXT_MUTED} mt-1`}>
                      Stock disponible: {productoSeleccionado.cantidad}
                    </p>
                  </div>
                </div>
                <div className="col-span-2">
                  <label htmlFor="fechaVenta" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                    Fecha de Venta
                  </label>
                  <input
                    type="date"
                    name="fechaVenta"
                    value={ventaManual.fechaVenta}
                    onChange={handleVentaManualChange}
                    className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none ${INPUT_LIGHT}`}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border rounded-md text-gray-700 border-gray-300 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Registrar Venta
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    );
  };
  

  // Renderizado
  return (
    <div className={`min-h-screen p-6 ${BG_LIGHT}`}>
      <div className="max-w-7xl mx-auto">
        <br />
        <br />
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${TEXT_DARK}`}>Panel de Administración</h1>
          <p className={`${TEXT_MUTED}`}>Gestiona tu inventario y ventas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg shadow-sm border ${CARD_LIGHT} ${BORDER_LIGHT}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
                <FiPackage size={24} />
              </div>
              <div>
                <p className={`text-sm font-medium ${TEXT_MUTED}`}>Productos</p>
                <p className={`text-2xl font-semibold ${TEXT_DARK}`}>{todosMisProductos.length}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg shadow-sm border ${CARD_LIGHT} ${BORDER_LIGHT}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500 text-white mr-4">
                <FiShoppingCart size={24} />
              </div>
              <div>
                <p className={`text-sm font-medium ${TEXT_MUTED}`}>Ventas</p>
                <p className={`text-2xl font-semibold ${TEXT_DARK}`}>{productosVendidos.length}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-lg shadow-sm border ${CARD_LIGHT} ${BORDER_LIGHT}`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-500 text-white mr-4">
                <FiDollarSign size={24} />
              </div>
              <div>
                <p className={`text-sm font-medium ${TEXT_MUTED}`}>Recaudación</p>
                <p className={`text-2xl font-semibold ${TEXT_DARK}`}>${recaudado.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="mb-8">
          <nav className={`flex space-x-4 border-b ${BORDER_LIGHT}`}>
            {[
              { id: 'productos', label: 'Productos', icon: <FiPackage className="mr-2" /> },
              { id: 'ventas', label: 'Ventas', icon: <FiShoppingCart className="mr-2" /> },
              { id: 'cargar', label: 'Agregar Producto', icon: <FiPlus className="mr-2" />},
              { id: 'reporte', label: 'Reporte de Ganancias', icon: <FiPlus className="mr-2" /> },

             
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSeccionActiva(tab.id)}
                className={`py-3 px-4 font-medium text-sm flex items-center ${
                  seccionActiva === tab.id 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : `${TEXT_MUTED} hover:text-gray-800`
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido */}
        {loading && seccionActiva !== 'cargar' && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiX className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Productos */}
        {seccionActiva === 'productos' && (
          <div className={`shadow-sm rounded-lg border ${CARD_LIGHT} ${BORDER_LIGHT} overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${BORDER_LIGHT}`}>
              <h2 className={`text-lg font-medium ${TEXT_DARK}`}>Lista de Productos</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {todosMisProductos.length === 0 ? (
                <div className={`p-6 text-center ${TEXT_MUTED}`}>No hay productos registrados</div>
              ) : (
                todosMisProductos.map((producto) => (
                  <div key={producto.ProductId} className="p-6 flex flex-col md:flex-row md:items-center hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      {producto.imagenes?.length > 0 ? (
                        <img 
                          src={producto.imagenes[0]} 
                          alt={producto.nombre}
                          className="h-20 w-20 object-cover rounded"
                        />
                      ) : (
                        <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className={`text-lg font-medium ${TEXT_DARK}`}>{producto.nombre}</h3>
                      <div className={`mt-1 text-sm ${TEXT_MUTED} grid grid-cols-2 md:grid-cols-4 gap-2`}>
                        <div><span className="font-medium">Precio:</span> ${producto.precio}</div>
                        <div><span className="font-medium">Marca:</span> {producto.marca}</div>
                        <div><span className="font-medium">Categoría:</span> {producto.categoria}</div>
                        <div><span className="font-medium">Stock:</span> <span className={producto.cantidad <= 5 ? 'text-red-600' : 'text-green-600'}>{producto.cantidad}</span></div>
                        <div><span className="font-medium">P. Mayor:</span> {producto.talle}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex space-x-3">
                      <button
                        onClick={() => setProductoAEditar(producto)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiEdit2 className="mr-2" /> Editar
                      </button>
                      <button
                        onClick={() => handleEliminarProducto(producto.ProductId)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FiTrash2 className="mr-2" /> Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {seccionActiva === 'reporte' && (
          <div className={`shadow-sm rounded-lg border ${CARD_LIGHT} ${BORDER_LIGHT} overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${BORDER_LIGHT} flex justify-between items-center`}>
              <div>
                <h2 className={`text-lg font-medium ${TEXT_DARK}`}>Recaudaciones Mensuales</h2>
                <p className={`text-sm ${TEXT_MUTED}`}>Total de registros: {recaudaciones.length}</p>
              </div>
              <button
                onClick={handleCerrarRecaudacion}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cerrar Recaudación
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {recaudaciones.length === 0 ? (
                <div className={`p-6 text-center ${TEXT_MUTED}`}>No hay recaudaciones registradas</div>
              ) : (
                recaudaciones.map((recaudacion) => (
                  <div key={recaudacion.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-medium ${TEXT_DARK}`}>{recaudacion.mes}</h3>
                        <div className={`mt-2 text-sm ${TEXT_MUTED}`}>
                          <p><span className="font-medium">Monto Recaudado:</span> <span className="text-green-600">${recaudacion.montoRecaudado}</span></p>
                          <p><span className="font-medium">Productos Vendidos:</span> {recaudacion.productosVendidos.length}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className={`text-sm ${TEXT_MUTED}`}>
                          <p>Fecha: {new Date(recaudacion.createdAt).toLocaleDateString('es-AR')}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleExpandirRecaudacion(recaudacion.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {recaudacionesExpandidas[recaudacion.id] ? 'Ocultar productos' : 'Ver productos'}
                          </button>
                          <button
                            onClick={() => eliminarRecaudacion(recaudacion.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            disabled={loading}
                          >
                            {loading ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mostrar productos vendidos si están expandidos */}
                    {recaudacionesExpandidas[recaudacion.id] && recaudacion.productosVendidos.length > 0 && (
                      <div className={`mt-4 border-t ${BORDER_LIGHT} pt-4`}>
                        <h4 className={`text-md font-medium ${TEXT_DARK} mb-2`}>Productos vendidos:</h4>
                        <div className="space-y-3">
                          {recaudacion.productosVendidos.map((producto, index) => (
                            <div key={index} className="pl-4 border-l-2 border-gray-300">
                              <p className={`text-sm font-medium ${TEXT_DARK}`}>{producto.nombre}</p>
                              <p className={`text-xs ${TEXT_MUTED}`}>
                                Cantidad: {producto.cantidad} - Total: <span className="text-green-600">${(producto.precio * producto.cantidad).toFixed(2)}</span> - Fecha: {new Date(producto.fechaCompra).toLocaleDateString('es-AR')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}


        {/* Sección de Ventas */}
          {seccionActiva === 'ventas' && (
            <div className={`shadow-sm rounded-lg border ${CARD_LIGHT} ${BORDER_LIGHT} overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${BORDER_LIGHT} flex justify-between items-center`}>
                <h2 className={`text-lg font-medium ${TEXT_DARK}`}>Productos Vendidos</h2>
                <button
                  onClick={() => setMostrarFormVentaManual(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FiPlus className="mr-2" /> Venta Manual
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {productosVendidos.length === 0 ? (
                  <div className={`p-6 text-center ${TEXT_MUTED}`}>No hay ventas registradas</div>
                ) : (
                  productosVendidos.map((producto) => (
                    <div key={producto.ProductId} className="p-6 flex flex-col md:flex-row md:items-center hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                        {producto.imagenes?.length > 0 ? (
                          <img 
                            src={producto.imagenes[0]} 
                            alt={producto.nombre}
                            className="h-20 w-20 object-cover rounded"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className={`text-lg font-medium ${TEXT_DARK}`}>{producto.nombre}</h3>
                        <div className={`mt-1 text-sm ${TEXT_MUTED} grid grid-cols-2 md:grid-cols-4 gap-2`}>
                          <div><span className="font-medium">Precio:</span> ${producto.precio}</div>
                          <div><span className="font-medium">Cantidad:</span> {producto.cantidad}</div>
                          <div><span className="font-medium">Total:</span> <span className="text-green-600">${(producto.precio * producto.cantidad).toFixed(2)}</span></div>
                          <div>
                            <span className="font-medium">Fecha:</span>{' '}
                            {new Date(producto.fechaCompra).toLocaleDateString('es-AR')}
                          </div>
                          <div><span className="font-medium">Marca:</span> {producto.marca || 'N/A'}</div>
                          <div><span className="font-medium">Categoría:</span> {producto.categoria || 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex space-x-3">
                        <button
                          onClick={() => handleEliminarProductoVendido(producto.ProductId)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiX className="mr-2" /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        {/* Sección para agregar productos (Estilos actualizados) */}
        {seccionActiva === 'cargar' && (
          <div className={`shadow-sm rounded-lg border ${CARD_LIGHT} ${BORDER_LIGHT} overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${BORDER_LIGHT}`}>
              <h2 className={`text-lg font-medium ${TEXT_DARK}`}>Agregar Nuevo Producto</h2>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nombre" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={nuevoProducto.nombre}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none ${INPUT_LIGHT}`}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="precio" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                      Precio
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="precio"
                        id="precio"
                        value={nuevoProducto.precio}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm rounded-md py-2 px-3 ${INPUT_LIGHT}`}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="talle" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                      Precio por mayor 
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="talle"
                        id="talle"
                        value={nuevoProducto.talle}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm rounded-md py-2 px-3 ${INPUT_LIGHT}`}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="marca" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                      Marca
                    </label>
                    <input
                      type="text"
                      name="marca"
                      id="marca"
                      value={nuevoProducto.marca}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none ${INPUT_LIGHT}`}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="categoria" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                      Categoría
                    </label>
                    <select
                      name="categoria"
                      id="categoria"
                      value={nuevoProducto.categoria}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none ${INPUT_LIGHT}`}
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cantidad" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                      Cantidad en Stock
                    </label>
                    <input
                      type="number"
                      name="cantidad"
                      id="cantidad"
                      value={nuevoProducto.cantidad}
                      onChange={handleInputChange}
                      min="0"
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none ${INPUT_LIGHT}`}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="descripcion" className={`block text-sm font-medium ${TEXT_MUTED}`}>
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      id="descripcion"
                      value={nuevoProducto.descripcion}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none ${INPUT_LIGHT}`}
                      rows="3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${TEXT_MUTED}`}>
                    Imágenes del Producto (Máximo 10)
                  </label>
                  <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${BORDER_LIGHT}`}>
                    <div className="space-y-1 text-center">
                      <div className={`flex text-sm ${TEXT_MUTED}`}>
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Subir archivos</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            multiple
                            accept="image/jpeg, image/png, image/gif"
                          />
                        </label>
                        <p className="pl-1 text-gray-500">o arrastrar y soltar</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF hasta 10MB cada una
                      </p>
                    </div>
                  </div>
                  
                  {/* Mostrar progreso de carga */}
                  {loading && uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className={`flex justify-between text-sm ${TEXT_MUTED} mb-1`}>
                        <span>Subiendo imágenes...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {uploadProgress === 100 && (
                      <div className="mt-2 text-sm text-green-600">
                        Imágenes cargadas exitosamente.
                      </div>
                  )}
                  
                  {/* Mostrar miniaturas de imágenes */}
                  {nuevoProducto.imagenes.length > 0 && (
                    <div className="mt-4">
                      <h3 className={`text-sm font-medium ${TEXT_MUTED} mb-2`}>
                        Imágenes seleccionadas ({nuevoProducto.imagenes.length})
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {nuevoProducto.imagenes.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Preview ${index}`}
                              className={`h-24 w-full object-cover rounded-md border ${BORDER_LIGHT}`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Eliminar imagen"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAgregarProducto}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : 'Guardar Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Edición */}
        {productoAEditar && (
          <EditarProducto
            producto={productoAEditar}
            onGuardarCambios={handleEditarProducto}
            onCancelar={() => setProductoAEditar(null)}
          />
        )}

        {/* Modal de Venta Manual */}
        {mostrarFormVentaManual && (
          <FormularioVentaManual
            onClose={() => setMostrarFormVentaManual(false)}
            onSubmit={registrarVentaManual}
          />
        )}
      </div>
    </div>
  );
};
export default Admin;