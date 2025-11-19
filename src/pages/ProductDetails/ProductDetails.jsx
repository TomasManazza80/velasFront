import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Add } from "../../store/redux/cart/CartAction";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Importaciones de iconos sólidos
import { faPlus, faMinus, faTruck, faChevronLeft, faChevronRight, faTag } from "@fortawesome/free-solid-svg-icons";
// Importación del icono de marca (WhatsApp)
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons"; 


const API_URL = import.meta.env.VITE_API_URL;

function ProductDetails() {
  // ******* LÓGICA DE ESTADOS Y HOOKS *******
  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams(); // Captura el ID de la URL
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart);

  const cartItem = {
    id: product.ProductId,
    title: product.nombre,
    price: product.precio,
    image: product.imagenes ? product.imagenes[0] : "",
    quantity: quantity,
    total: parseFloat(product.precio || 0) * quantity,
  };

  // ******* LÓGICA DE FETCHING *******
  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products/${id}`);
      setProduct(data);
      // Opcional: Reiniciar la cantidad y la imagen a la primera al cargar un nuevo producto
      setQuantity(1); 
      setCurrentImageIndex(0);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products`);
      const related = data.filter(
        (p) => p.categoria === product.categoria && p.ProductId !== product.ProductId
      ).slice(0, 3);
      setRelatedProducts(related);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  // ******* LÓGICA DE INTERACCIÓN Y UTILS *******
  const increaseQuantity = () => {
    if (quantity < product.cantidad) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const nextImage = () => {
    if (product.imagenes && product.imagenes.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.imagenes.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product.imagenes && product.imagenes.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.imagenes.length - 1 : prevIndex - 1
      );
    }
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const addToCart = () => {
    const existingItem = cartItems.find((item) => item.id === product.ProductId);
    
    if (existingItem) {
      Swal.fire({
        title: "Producto ya en carrito",
        text: "Este producto ya está en tu carrito.",
        icon: "info",
        confirmButtonText: "Entendido",
        customClass: { 
          container: 'font-sans',
          popup: 'shadow-2xl rounded-xl',
          confirmButton: 'bg-black hover:bg-gray-800 text-white font-semibold',
        }
      });
      return;
    }

    dispatch(Add(cartItem));
    Swal.fire({
      title: "¡Agregado al carrito!",
      text: `${product.nombre} x${quantity} añadido.`,
      icon: "success",
      showConfirmButton: false,
      timer: 2000,
      customClass: { 
        container: 'font-sans',
        popup: 'shadow-2xl rounded-xl',
      }
    });
  };

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price || 0);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice).replace('ARS', '$');
  };

  const calculateTax = (price) => {
    const numericPrice = parseFloat(price || 0);
    const subtotal = numericPrice / 1.21;
    const tax = numericPrice - subtotal;
    return {
      subtotal: formatPrice(subtotal),
      tax: formatPrice(tax)
    };
  };

  // ******* HOOKS DE EFECTOS (SOLUCIÓN DE SCROLL Y RECARGA) *******

  /**
   * 🟢 EFECTO PRINCIPAL: Carga el producto y ajusta el scroll.
   * Depende de [id]. Cada vez que el ID de la URL cambia (al navegar),
   * el efecto se ejecuta para:
   * 1. Poner el scroll al inicio (0, 0).
   * 2. Recargar los datos del nuevo producto.
   */
  useEffect(() => {
    // 💡 SOLUCIÓN SCROLL: Fuerza el inicio de la página.
    window.scrollTo(0, 0); 
    
    // Obtiene los datos del producto
    fetchProduct();
  }, [id]); 

  /**
   * ⚪ EFECTO SECUNDARIO: Carga de productos relacionados.
   */
  useEffect(() => {
    if (product.categoria) {
      fetchRelatedProducts();
    }
  }, [product.categoria]);

  const { tax } = calculateTax(product.precio);
  // ******* FIN LÓGICA *******


  return (
    <div className=" bg-white min-h-screen font-sans antialiased">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-16">
        
        {/* Contenedor principal del producto - Estilo Card Elevado */}
        <div className=" mt-[20px] bg-white p-4 sm:p-8 lg:p-10 rounded-2xl border border-gray-100 shadow-2xl shadow-gray-100/50">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-20">
            
            {/* --- Columna Izquierda: Galería de Imágenes --- */}
            <div className="lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
              
              {/* Miniaturas (Desktop/Tablet) */}
              <div className="hidden md:flex flex-col gap-3 w-20 lg:w-24">
                {product.imagenes?.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => selectImage(index)}
                    aria-label={`Seleccionar miniatura ${index + 1}`}
                    className={`
                      w-full aspect-square border-2 rounded-xl overflow-hidden transition-all duration-200 ease-in-out
                      ${
                        currentImageIndex === index 
                          ? 'border-black shadow-lg p-0.5' 
                          : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                      }
                    `}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/E5E7EB/374151?text=IMG" }}
                    />
                  </button>
                ))}
              </div>

              {/* Imagen principal con Slider Controls */}
              <div className="flex-1 h-[400px] bg-gray-50 p-4 md:p-8 rounded-2xl flex items-center justify-center 
                relative overflow-hidden shadow-inner">
                {product.imagenes && product.imagenes.length > 0 ? (
                  <>
                    <img
                      src={product.imagenes[currentImageIndex]}
                      alt={product.nombre}
                      className="w-full h-full object-contain transition-transform duration-500 ease-out hover:scale-105"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/500x500/D1D5DB/6B7280?text=SIN+IMAGEN" }}
                    />
                    
                    {/* Controles de navegación */}
                    {product.imagenes.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          aria-label="Imagen anterior"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur-sm text-black rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-white focus:ring-4 focus:ring-black/20 touch-manipulation"
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button 
                          onClick={nextImage}
                          aria-label="Imagen siguiente"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur-sm text-black rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-white focus:ring-4 focus:ring-black/20 touch-manipulation"
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                        
                        {/* Indicadores de imagen (puntos) para móviles */}
                        <div className="md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {product.imagenes.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => selectImage(index)}
                              aria-label={`Seleccionar imagen ${index + 1}`}
                              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 shadow-sm ${
                                currentImageIndex === index ? 'bg-black' : 'bg-gray-400 hover:bg-gray-500'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 text-lg font-semibold">Cargando imagen...</div>
                )}
              </div>
            </div>

            {/* --- Columna Derecha: Información y Compra --- */}
            <div className="lg:w-1/2 pt-4 lg:pt-0"> 
              
              <h2 className="text-sm uppercase tracking-widest font-bold text-indigo-600 mb-1">
                {product.marca || "Marca Desconocida"}
              </h2>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
                {product.nombre || "Nombre del Producto"}
              </h1>
              
              {/* Precio y Detalles Fiscales */}
              <div className="mb-6 border-y border-gray-200 py-4">
                <span className="text-5xl md:text-6xl font-bold text-black tracking-tight">
                  {formatPrice(product.precio)}
                </span>
                <div className="text-sm text-gray-500 mt-2">
                  <span>IVA incluido: {tax}</span>
                </div>
              </div>

              {/* Descripción del Producto */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed text-base">
                  {product.descripcion || "Descripción no disponible. Articulo de decoración."}
                </p>
              </div>

              {/* Oferta por Mayor (Card con ícono) */}
              {product.talle && (
                <div className="mb-6 p-4 rounded-xl bg-yellow-50 border-l-4 border-yellow-400 shadow-sm flex items-center gap-3">
                  <FontAwesomeIcon icon={faTag} className="text-yellow-600 text-xl" />
                  <div>
                    <h1 className="text-sm font-bold text-yellow-800">Precio por Mayor:</h1>
                    <p className="text-base font-semibold text-gray-900 mt-0">{product.talle}</p>
                  </div>
                </div>
              )}

              {/* Selector de Cantidad */}
              <div className="mb-8">
                <p className="text-base font-semibold mb-3 text-gray-700">Cantidad:</p>
                
                <div className="inline-flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
                  <button
                    onClick={decreaseQuantity}
                    aria-label="Disminuir cantidad"
                    className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-150 active:bg-gray-200 disabled:opacity-50 touch-manipulation"
                    disabled={quantity <= 1}
                  >
                    <FontAwesomeIcon icon={faMinus} className="text-lg sm:text-xl text-gray-600" />
                  </button>
                  <span className="text-lg sm:text-xl font-bold w-14 sm:w-16 text-center text-gray-900 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    aria-label="Aumentar cantidad"
                    className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-150 active:bg-gray-200 disabled:opacity-50 touch-manipulation"
                    disabled={quantity >= product.cantidad}
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-lg sm:text-xl text-gray-600" />
                  </button>
                </div>
                
                {/* Texto de Stock */}
                <p className="text-sm text-gray-500 font-medium mt-2">
                  Stock: <span className="font-bold text-gray-900">{product.cantidad || 0}</span>
                </p>
              </div>
              {/* FIN SELECTOR HORIZONTAL */}

              {/* Botones de acción - Alto contraste */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Botón principal (Agregar al carrito) */}
                <button
                  onClick={addToCart}
                  className="w-full sm:flex-1 bg-black text-white py-4 rounded-xl uppercase tracking-wider text-base font-bold transition-all duration-300 hover:bg-gray-800 active:bg-gray-900 shadow-2xl shadow-black/30 hover:shadow-black/50 touch-manipulation"
                >
                  🛒 AGREGAR AL CARRITO
                </button>

                {/* Botón secundario (Encargo por mayor - WhatsApp) */}
                <button
                  onClick={() => window.open('https://wa.me/+543425243854', '_blank')}
                  className="w-full sm:flex-1 inline-flex items-center justify-center px-6 py-4 border-2 border-green-500 text-base font-bold rounded-xl text-green-700 bg-green-50 transition-all duration-300 hover:bg-green-100 focus:outline-none focus:ring-4 focus:ring-green-100 shadow-lg touch-manipulation"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                  <span>Encargo por Mayor</span>
                </button>
              </div>

              {/* Información de envío/entrega */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 text-base text-gray-900 font-bold mb-2">
                  <FontAwesomeIcon icon={faTruck} className="text-indigo-600" />
                  <span>Envío y Retiro</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>**Disponible para envío** a todo el país.</li>
                  <li>Consultar stock para retiro en punto **PICKUP**.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

---

        {/* --------------------------- Productos Relacionados --------------------------- */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 md:mt-28">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-8 md:mb-10 text-center text-gray-900 border-b pb-3">
              Productos Relacionados
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  key={relatedProduct.ProductId} 
                  className="group bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* ✅ CLAVE: El Link navega al nuevo producto, lo que cambia el ID y activa el useEffect */}
                  <Link to={`/product/${relatedProduct.ProductId}`} className="block">
                    {/* Imagen de Producto */}
                    <div className="bg-gray-50 p-4 rounded-t-xl h-36 md:h-48 flex items-center justify-center overflow-hidden">
                      {relatedProduct.imagenes && relatedProduct.imagenes[0] ? (
                        <img
                          src={relatedProduct.imagenes[0]}
                          alt={relatedProduct.nombre}
                          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x400/E5E7EB/374151?text=IMG" }}
                        />
                      ) : (
                        <div className="text-gray-400 text-sm">Imagen</div>
                      )}
                    </div>
                    
                    {/* Contenido del Producto */}
                    <div className="p-4">
                      <p className="text-gray-500 text-xs uppercase font-medium mb-1">
                        {relatedProduct.marca || relatedProduct.categoria}
                      </p>
                      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-black transition-colors">
                        {relatedProduct.nombre}
                      </h3>
                      <p className="text-black font-extrabold text-xl tracking-tight">
                        {formatPrice(relatedProduct.precio)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;