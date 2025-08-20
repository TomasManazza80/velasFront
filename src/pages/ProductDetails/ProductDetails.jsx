import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Add } from "../../store/redux/cart/CartAction";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTruck } from "@fortawesome/free-solid-svg-icons";

const API_URL = "http://localhost:3000";

function ProductDetails() {
  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams();
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

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products/${id}`);
      setProduct(data);
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

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const addToCart = () => {
    const existingItem = cartItems.find((item) => item.id === product.ProductId);
    
    if (existingItem) {
      Swal.fire({
        title: "Producto ya en carrito",
        text: "Este producto ya está en tu carrito",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    dispatch(Add(cartItem));
    Swal.fire({
      title: "¡Agregado!",
      text: "Producto añadido al carrito",
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product.categoria) {
      fetchRelatedProducts();
    }
  }, [product.categoria]);

  const { subtotal, tax } = calculateTax(product.precio);

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Galería de imágenes - Diseño lateral */}
          <div className="lg:w-1/2 flex flex-row gap-4">
            {/* Miniaturas verticales */}
            <div className="hidden md:flex flex-col gap-2 w-20">
              {product.imagenes?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => selectImage(index)}
                  className={`w-full aspect-square border-2 rounded-md overflow-hidden ${
                    currentImageIndex === index ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Imagen principal */}
            <div className="flex-1 bg-gray-50 p-8 rounded-lg flex items-center justify-center h-[500px]">
              {product.imagenes && product.imagenes.length > 0 ? (
                <img
                  src={product.imagenes[currentImageIndex]}
                  alt={product.nombre}
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              ) : (
                <div className="text-gray-400 text-center">Imagen no disponible</div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="lg:w-1/2">
            <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-2">
              {product.marca}
            </h2>

            <h1 className="text-3xl font-light tracking-wide mb-4">
              {product.nombre}
            </h1>

           

            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                {product.descripcion || "Descripción no disponible"}
              </p>
            </div>

            {product.talle && (
              <div className="mb-6">
                <h1 className="text-sm font-medium mb-1">Precio por Mayor: {product.talle}</h1>
              </div>
            )}

            

            <div className="mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-gray-600" />
                </button>
                <span className="text-lg font-medium w-10 text-center">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Stock disponible: {product.cantidad}
              </p>
            </div>

            <button
              onClick={addToCart}
              className="w-full bg-black text-white py-4 px-6 uppercase tracking-wider text-sm font-medium hover:bg-gray-800 transition-colors duration-200 mb-4"
            >
              Agregar al carrito
            </button>

            <button
  onClick={() => window.open('https://wa.me/+543425937358', '_blank')}
  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
>
  Hacer encargo por mayor
</button>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FontAwesomeIcon icon={faTruck} />
              <span>Disponible para envío</span>
            </div>
            <p className="text-sm text-gray-600">
              CONSULTAR STOCK PARA RETIRO PICKUP
            </p>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-light tracking-wide mb-8 text-center">
              PRODUCTOS RELACIONADOS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.ProductId} className="group">
                  <Link 
                    to={`/product/${relatedProduct.ProductId}`}
                    className="block"
                  >
                    <div className="bg-gray-50 p-6 rounded-lg mb-4 h-64 flex items-center justify-center">
                      {relatedProduct.imagenes && relatedProduct.imagenes[0] ? (
                        <img
                          src={relatedProduct.imagenes[0]}
                          alt={relatedProduct.nombre}
                          className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-gray-400">Imagen no disponible</div>
                      )}
                    </div>
                    <h3 className="text-lg font-light mb-1">{relatedProduct.nombre}</h3>
                    <p className="text-gray-900 font-medium">
                      {formatPrice(relatedProduct.precio)}
                    </p>
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