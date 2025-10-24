import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiDollarSign, FiPackage, FiShoppingCart } from 'react-icons/fi';

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

  // Datos del nuevo producto (MODIFICADO: Se agregó 'marca')
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    categoria: '',
    cantidad: '',
    talle: '',
    marca: '', // NUEVO CAMPO: Marca
    imagenes: []
  });

const eliminarRecaudacion = async (id) => {
  if (!window.confirm('¿Estás seguro de eliminar esta recaudación? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    setLoading(true);
    await axios.delete(`${API_URL}/recaudation/recaudation/${id}`);
    
    // Actualizar el estado eliminando la recaudación
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
    
    // 1. Obtener fecha actual formateada
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fechaActual = new Date();
    const nombreMes = `${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;

    // 2. Verificar recaudación existente
    if (recaudaciones.some(r => r.mes === nombreMes)) {
      alert(`Ya existe recaudación para ${nombreMes}`);
      return;
    }

    // 3. Obtener productos vendidos
    const { data: productosVendidos } = await axios.get(`${API_URL}/boughtProduct/AllboughtProducts`);
    
    // 4. Calcular total CORRECTAMENTE
    const montoTotal = productosVendidos.reduce((total, producto) => {
      const precio = parseFloat(producto.precio) || 0;
      const cantidad = parseInt(producto.cantidad) || 0;
      return total + (precio * cantidad);
    }, 0);

    // 5. Preparar body con tipos correctos
    const body = {
      mes: nombreMes,
      productosVendidos: productosVendidos,
      montoRecaudado: parseFloat(montoTotal.toFixed(2)) // Asegurar número con 2 decimales
    };

    console.log("Datos validados:", body);

    // 6. Enviar al backend
    const { data: nuevaRecaudacion } = await axios.post(
      `${API_URL}/recaudation/recaudation`, 
      body
    );

    // 7. Actualizar estado
    setRecaudaciones([...recaudaciones, nuevaRecaudacion]);
    
    // 8. Limpiar ventas usando handleEliminarProductoVendido en un bucle
    // Hacemos una copia del array para no modificar el estado mientras iteramos
    const productosAEliminar = [...productosVendidos];
    
    // Eliminamos uno por uno usando tu función existente
    while (productosAEliminar.length > 0) {
      const producto = productosAEliminar[0]; // Tomamos el primero
      await handleEliminarProductoVendido(producto.ProductId);
      productosAEliminar.shift(); // Lo removemos del array temporal
    }
    
    // No necesitamos setProductosVendidos([]) porque handleEliminarProductoVendido ya lo hace
    setRecaudado(0); // Reiniciamos el contador de recaudación
    
 
    
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

  // Datos para venta manual (MODIFICADO: Se agregó 'marca')
const [ventaManual, setVentaManual] = useState({
  nombre: '',
  precio: '',
  descripcionrca: '',
  categoria: '',
  cantidad: 1,
  talle: '',
  marca: '', // NUEVO CAMPO: Marca
  imagenes: [],
  fechaVenta: new Date().toISOString().split('T')[0] // Fecha actual por defecto
});
const obtenerRecaudaciones = async () => {
  try {
    const response = await axios.get(`${API_URL}/recaudation/recaudations`);
    console.log('Datos recibidos:', response.data); // Agrega este console.log
    if (response.data && Array.isArray(response.data)) {
      setRecaudaciones(response.data);
    } else {
      console.log('La respuesta no es un array:', response.data);
      setRecaudaciones([]);
    }
  } catch (error) {
    console.error('Error al obtener recaudaciones:', error);
    setError('Error al cargar las recaudaciones');
    setRecaudaciones([]);
  }
};

  // Opciones para formularios
  const categorias = ['Velas', 'Velas Premium', 'Aromatizadores', 'Floreros', 'Collares', 'Pulseras', 'Espejos', 'Yeso', 'Otros'  ];


  // Cloudinary config
  const cloudinary = new Cloudinary({ cloud: { cloudName: 'dxvkqumpu' } });

  // Filtrar productos
  const productosFiltrados = todosMisProductos.filter(producto =>
    producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(busquedaProducto.toLowerCase())
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

  // Handlers para productos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({ ...prev, [name]: value }));
  };

  const handleVentaManualChange = (e) => {
  const { name, value } = e.target;
  setVentaManual(prev => ({ ...prev, [name]: value }));
};

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validar cantidad de archivos
    if (files.length > 10) {
      setError('Máximo 10 imágenes permitidas');
      return;
    }

    // Validar tamaño y tipo de archivos
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

    try {
      // Subir imágenes una por una y acumular resultados
      const uploadedImages = [];
      const totalFiles = validFiles.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = validFiles[i];
        const url = await uploadImageToCloudinary(file);
        if (url) {
          uploadedImages.push(url);
          
          // Actualizar progreso
          setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
          
          // Actualizar estado parcialmente para mostrar progreso
          setNuevoProducto(prev => ({
            ...prev,
            imagenes: [...prev.imagenes, url]
          }));
        }
      }
      
    } catch (err) {
      setError('Error al subir algunas imágenes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

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

  const handleRemoveImage = (indexToRemove) => {
    setNuevoProducto(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleAgregarProducto = async () => {
    if (!validarProducto()) return;

    // Validar al menos una imagen
    if (nuevoProducto.imagenes.length === 0) {
      setError('Debes subir al menos una imagen del producto');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/products`, nuevoProducto);
      setTodosMisProductos([...todosMisProductos, response.data]);
      resetearFormulario();
    } catch (err) {
      setError('Error al crear producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

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
    
    // Mostrar mensaje de éxito
   
  } catch (err) {
    // Mostrar mensaje de error específico
    alert(`Error al eliminar producto: ${err.response?.data?.message || err.message}`);
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};

  const confirmarVenta = async (producto) => {
    try {
      setLoading(true);
      
      // Primero descontamos el stock si el producto existe en el inventario
      if (todosMisProductos.some(p => p.ProductId === producto.ProductId)) {
        await descontarStock(producto.ProductId, producto.cantidad);
      }
      
      // Luego registramos la venta
      const productoVendido = {
        nombre: producto.nombre,
        precio: producto.precio,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        cantidad: producto.cantidad,
        talle: producto.talle,
        marca: producto.marca, // Añadido marca
        imagenes: producto.imagenes,
        fechaCompra: producto.fechaCompra || new Date()
      };

      await axios.post(`${API_URL}/boughtProduct`, productoVendido);
      
      // Actualizamos la lista de productos vendidos
      const response = await axios.get(`${API_URL}/boughtProduct/AllboughtProducts`);
      setProductosVendidos(response.data);
      
      // Actualizar recaudación
      const total = response.data.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      setRecaudado(total);
      
      // Finalmente eliminamos el producto de la lista de pendientes si es necesario
      await handleEliminarProductoVendido(producto.ProductId);
      
    } catch (err) {
      setError('Error al confirmar venta');
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
      await axios.delete(`${API_URL}/boughtProduct/${id}`);
      setProductosVendidos(prev => prev.filter(p => p.ProductId !== id));
      
      // Actualizar recaudación
      const total = productosVendidos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      setRecaudado(total);
    } catch (err) {
      console.error('Error:', err);
    }
  };

const registrarVentaManual = async () => {
  // Validaciones básicas
  if (!ventaManual.nombre || !ventaManual.precio || ventaManual.precio <= 0 || 
      !ventaManual.cantidad || ventaManual.cantidad <= 0) {
    setError('Nombre, precio y cantidad son campos requeridos y deben ser mayores a 0');
    return;
  }

  // Validación de fecha
  if (!ventaManual.fechaVenta) {
    setError('La fecha de venta es requerida');
    return;
  }

  // Validar que la fecha no sea futura
  const fechaSeleccionada = new Date(ventaManual.fechaVenta);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día
  
  if (fechaSeleccionada > hoy) {
    setError('La fecha de venta no puede ser futura');
    return;
  }

  // Validar stock
  const producto = todosMisProductos.find(p => p.nombre === ventaManual.nombre);
  if (producto && ventaManual.cantidad > producto.cantidad) {
    setError(`No hay suficiente stock. Disponible: ${producto.cantidad}`);
    return;
  }

  try {
    setLoading(true);
    
    // Preparar objeto para enviar al backend (MODIFICADO: Se agregó 'marca')
    const productoVendido = {
      nombre: ventaManual.nombre,
      precio: parseFloat(ventaManual.precio),
      descripcion: ventaManual.descripcion || producto?.descripcion || 'Varios',
      categoria: ventaManual.categoria || producto?.categoria || 'Varios',
      cantidad: parseInt(ventaManual.cantidad),
      talle: ventaManual.talle || producto?.talle || 'Único',
      marca: ventaManual.marca || producto?.marca || 'N/A', // NUEVO CAMPO: Marca
      imagenes: ventaManual.imagenes || producto?.imagenes || [],
      fechaCompra: new Date(ventaManual.fechaVenta).toISOString() // Formato ISO para el backend
    };

    console.log('Enviando producto vendido:', productoVendido); // Para depuración

    // Registrar la venta
    await axios.post(`${API_URL}/boughtProduct/boughtProduct`, productoVendido);
    
    // Si el producto existe en el inventario, descontar stock
    if (producto) {
      await descontarStock(producto.ProductId, ventaManual.cantidad);
    }
    
    // Actualizar lista de productos vendidos
    const response = await axios.get(`${API_URL}/boughtProduct/AllboughtProducts`);
    setProductosVendidos(response.data);
    
    // Actualizar recaudación
    const total = response.data.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    setRecaudado(total);
    
    // Cerrar formulario y resetear (MODIFICADO: Se agregó 'marca' al reset)
    setMostrarFormVentaManual(false);
    setVentaManual({
      nombre: '',
      precio: '',
      descripcion: '',
      categoria: '',
      cantidad: 1,
      talle: '',
      marca: '', // NUEVO CAMPO: Marca
      imagenes: [],
      fechaVenta: new Date().toISOString().split('T')[0] // Resetear con fecha actual
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

  // Funciones auxiliares
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

  const resetearFormulario = () => {
    setNuevoProducto({
      nombre: '',
      precio: '',
      descripcion: '',
      categoria: '',
      cantidad: '',
      talle: '',
      marca: '', // NUEVO CAMPO: Marca
      imagenes: []
    });
    setError(null);
  };

  // Componente de Edición CORREGIDO (MODIFICADO: Se agregó 'marca' al formulario)
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
        // Aseguramos que talle (precio por mayor) y cantidad sean números si es necesario
        talle: formData.talle,
        precio: parseFloat(formData.precio),
        cantidad: parseInt(formData.cantidad, 10),
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4">Editar Producto</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campos de texto y número simples (nombre, marca, precio, cantidad) */}
            {[
              { label: 'Nombre', name: 'nombre', type: 'text' },
              { label: 'Marca', name: 'marca', type: 'text' }, // NUEVO CAMPO: Marca
              { label: 'Precio', name: 'precio', type: 'number', step: '0.01' },
              { label: 'Cantidad', name: 'cantidad', type: 'number', min: '0' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  min={field.min}
                  step={field.step}
                  required={field.name === 'nombre' || field.name === 'precio' || field.name === 'cantidad'}
                />
              </div>
            ))}

            {/* Campo CATEGORÍA (select) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                Categoría
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Campo DESCRIPCIÓN (textarea para edición más fácil) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                Descripción
              </label>
              <textarea
                name="descripcion" // ¡Nombre correcto: descripcion!
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>

            {/* Campo PRECIO POR MAYOR (mapeado a 'talle') */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                Precio por mayor
              </label>
              <input
                type="number" // Es un precio, debe ser tipo number
                name="talle" // Nombre correcto: talle
                value={formData.talle}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Ej: 50 (x10 unidades)"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancelar}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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

  // Componente de Formulario para Venta Manual
const FormularioVentaManual = ({ onClose, onSubmit }) => {
  const [busquedaLocal, setBusquedaLocal] = useState(busquedaProducto); // Inicializamos con el valor global
  const inputRef = React.useRef(null);

  // Enfocamos el input al montar
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBusquedaChange = (e) => {
    const value = e.target.value;
    setBusquedaLocal(value);
    setBusquedaProducto(value); // Actualizamos ambos estados juntos
  };

 // MODIFICADO: Se pasa 'marca' al estado ventaManual
 const handleSeleccionProducto = (producto) => {
    setProductoSeleccionado(producto);
    setVentaManual({
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      cantidad: 1,
      talle: producto.talle,
      marca: producto.marca, // NUEVO CAMPO: Marca
      imagenes: producto.imagenes,
      fechaVenta: new Date().toISOString().split('T')[0] // Fecha actual por defecto
    });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Registrar Venta Manual</h3>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
          <div>
            <label htmlFor="buscarProducto" className="block text-sm font-medium text-gray-700">
              Buscar Producto
            </label>
            <input
              ref={inputRef}
              type="text"
              id="buscarProducto"
              value={busquedaLocal}
              onChange={handleBusquedaChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar por nombre o marca"
            />
          </div>

          

          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => (
                <div
                  key={producto.ProductId}
                  onClick={() => handleSeleccionProducto(producto)}
                  className={`p-3 hover:bg-gray-100 cursor-pointer ${productoSeleccionado?.ProductId === producto.ProductId ? 'bg-blue-50' : ''}`}
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
                      <p className="text-sm text-gray-500">
                        {producto.marca ? `Marca: ${producto.marca} | ` : ''} 
                        ${producto.precio} | Stock: {producto.cantidad}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">No se encontraron productos</div>
            )}
          </div>

          {productoSeleccionado && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                    Precio
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={ventaManual.precio}
                    onChange={handleVentaManualChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    name="cantidad"
                    value={ventaManual.cantidad}
                    onChange={handleVentaManualChange}
                    min="1"
                    max={productoSeleccionado.cantidad}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Stock disponible: {productoSeleccionado.cantidad}
                  </p>
                </div>
              </div>
<div className="col-span-2">
                <label htmlFor="fechaVenta" className="block text-sm font-medium text-gray-700">
                  Fecha de Venta
                </label>
                <input
                  type="date"
                  name="fechaVenta"
                  value={ventaManual.fechaVenta}
                  onChange={handleVentaManualChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <br />
        <br />
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona tu inventario y ventas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FiPackage size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Productos</p>
                <p className="text-2xl font-semibold">{todosMisProductos.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FiShoppingCart size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ventas</p>
                <p className="text-2xl font-semibold">{productosVendidos.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <FiDollarSign size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Recaudación</p>
                <p className="text-2xl font-semibold">${recaudado.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="mb-8">
          <nav className="flex space-x-4 border-b border-gray-200">
            {[
              { id: 'productos', label: 'Productos', icon: <FiPackage className="mr-2" /> },
              { id: 'ventas', label: 'Ventas', icon: <FiShoppingCart className="mr-2" /> },
              { id: 'cargar', label: 'Agregar Producto', icon: <FiPlus className="mr-2" />},
              { id: 'reporte', label: 'Reporte de Ganancias', icon: <FiPlus className="mr-2" /> },

             
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSeccionActiva(tab.id)}
                className={`py-3 px-4 font-medium text-sm flex items-center ${seccionActiva === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
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
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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

        {/* Sección de Productos (MODIFICADO: Se muestra 'marca') */}
        {seccionActiva === 'productos' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Lista de Productos</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {todosMisProductos.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No hay productos registrados</div>
              ) : (
                todosMisProductos.map((producto) => (
                  <div key={producto.ProductId} className="p-6 flex flex-col md:flex-row md:items-center">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      {producto.imagenes?.length > 0 ? (
                        <img 
                          src={producto.imagenes[0]} 
                          alt={producto.nombre}
                          className="h-20 w-20 object-cover rounded"
                        />
                      ) : (
                        <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium text-gray-900">{producto.nombre}</h3>
                      <div className="mt-1 text-sm text-gray-500 grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div><span className="font-medium">Precio:</span> ${producto.precio}</div>
                        <div><span className="font-medium">Descripción:</span> {producto.descripcion}</div>
                        <div><span className="font-medium">Categoría:</span> {producto.categoria}</div>
                        <div><span className="font-medium">Marca:</span> {producto.marca || 'N/A'}</div> {/* NUEVO CAMPO */}
                        <div><span className="font-medium">Stock:</span> {producto.cantidad}</div>
                        <div><span className="font-medium">Precio por mayor:</span> {producto.talle}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex space-x-3">
                      <button
                        onClick={() => setProductoAEditar(producto)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiEdit2 className="mr-2" /> Editar
                      </button>
                      <button
                        onClick={() => handleEliminarProducto(producto.ProductId)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FiTrash2 className="mr-2 " /> Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

{seccionActiva === 'reporte' && (
  <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Recaudaciones Mensuales</h2>
        <p className="text-sm text-gray-500">Total de registros: {recaudaciones.length}</p>
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
        <div className="p-6 text-center text-gray-500">No hay recaudaciones registradas</div>
      ) : (
        recaudaciones.map((recaudacion) => (
          <div key={recaudacion.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{recaudacion.mes}</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p><span className="font-medium">Monto Recaudado:</span> ${recaudacion.montoRecaudado}</p>
                  <p><span className="font-medium">Productos Vendidos:</span> {recaudacion.productosVendidos.length}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="text-sm text-gray-500">
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
              <div className="mt-4 border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Productos vendidos:</h4>
                <div className="space-y-3">
                  {recaudacion.productosVendidos.map((producto, index) => (
                    <div key={index} className="pl-4 border-l-2 border-gray-200">
                      <p className="text-sm font-medium">{producto.nombre} {producto.marca ? `(${producto.marca})` : ''}</p>
                      <p className="text-xs text-gray-500">
                        Cantidad: {producto.cantidad} - Total: ${(producto.precio * producto.cantidad).toFixed(2)} - fecha: {new Date(producto.fechaCompra).toLocaleDateString('es-AR')}
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
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Productos Vendidos</h2>
                <button
                  onClick={() => setMostrarFormVentaManual(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FiPlus className="mr-2" /> Venta Manual
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {productosVendidos.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No hay ventas registradas</div>
                ) : (
                  productosVendidos.map((producto) => (
                    <div key={producto.ProductId} className="p-6 flex flex-col md:flex-row md:items-center">
                      <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                        {producto.imagenes?.length > 0 ? (
                          <img 
                            src={producto.imagenes[0]} 
                            alt={producto.nombre}
                            className="h-20 w-20 object-cover rounded"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900">{producto.nombre}</h3>
                        <div className="mt-1 text-sm text-gray-500 grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div><span className="font-medium">Precio:</span> ${producto.precio}</div>
                          <div><span className="font-medium">Cantidad:</span> {producto.cantidad}</div>
                          <div><span className="font-medium">Marca:</span> {producto.marca || 'N/A'}</div> {/* NUEVO CAMPO */}
                          <div><span className="font-medium">Total:</span> ${(producto.precio * producto.cantidad).toFixed(2)}</div>
                          <div>
                            <span className="font-medium">Fecha:</span>{' '}
                            {producto.fechaCompra}
                          </div>
                          <div><span className="font-medium">Descripción:</span> {producto.descripcion || 'N/A'}</div>
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

        {/* Sección para agregar productos (MODIFICADO: Se agregó input 'marca') */}
        {seccionActiva === 'cargar' && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Agregar Nuevo Producto</h2>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      id="nombre"
                      value={nuevoProducto.nombre}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* NUEVO CAMPO: Marca */}
                  <div>
                    <label htmlFor="marca" className="block text-sm font-medium text-gray-700">
                      Marca
                    </label>
                    <input
                      type="text"
                      name="marca"
                      id="marca"
                      value={nuevoProducto.marca}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {/* FIN NUEVO CAMPO */}

                  <div>
                    <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
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
                        className="focus:ring-blue-500 focus:border-blue-500 block w/full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
<div>
                    <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
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
                        className="focus:ring-blue-500 focus:border-blue-500 block w/full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
                      Categoría
                    </label>
                    <select
                      name="categoria"
                      id="categoria"
                      value={nuevoProducto.categoria}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
                      Cantidad en Stock
                    </label>
                    <input
                      type="number"
                      name="cantidad"
                      id="cantidad"
                      value={nuevoProducto.cantidad}
                      onChange={handleInputChange}
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      id="descripcion"
                      value={nuevoProducto.descripcion}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Imágenes del Producto (Máximo 10)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
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
                        <p className="pl-1">o arrastrar y soltar</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF hasta 10MB cada una
                      </p>
                    </div>
                  </div>
                  
                  {/* Mostrar progreso de carga */}
                  {loading && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
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
                  
                  {/* Mostrar miniaturas de imágenes */}
                  {nuevoProducto.imagenes.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Imágenes seleccionadas ({nuevoProducto.imagenes.length})
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {nuevoProducto.imagenes.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Preview ${index}`}
                              className="h-24 w-full object-cover rounded-md border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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