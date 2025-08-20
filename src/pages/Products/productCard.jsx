import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const API_URL = "http://localhost:3000";

function ProductCard({ products }) {
  const [productsToShow, setProductsToShow] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice).replace('ARS', '$');
  };

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/products`);
      const sortedData = data.sort(compareName);
      setProductsToShow(sortedData);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback data
      setProductsToShow([
        {
          ProductId: 1,
          nombre: "DIFUSOR LAB MANDARIN ROSE",
          precio: 48500,
          marca: "ANI BEAUTY",
          imagenes: [""],
          categoria: "aromatizadores"
        },
        {
          ProductId: 2,
          nombre: "DIFUSOR CLOSSY MANDARIN ROSE",
          precio: 34500,
          marca: "ANI BEAUTY",
          imagenes: [""],
          categoria: "aromatizadores"
        },
        {
          ProductId: 3,
          nombre: "DIFUSOR BASE: MANDARIN ROSE",
          precio: 20900,
          marca: "ANI BEAUTY",
          imagenes: [""],
          categoria: "aromatizadores"
        },
        {
          ProductId: 4,
          nombre: "REPUESTO PARA DIFUSOR MANDARIN ROSE",
          precio: 32500,
          marca: "ANI BEAUTY",
          imagenes: [""],
          categoria: "repuestos"
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function compareName(a, b) {
    return a.nombre.localeCompare(b.nombre);
  }

  useEffect(() => {
    if (!products) {
      fetchProducts();
    } else {
      setProductsToShow(products);
      setLoading(false);
    }
  }, [products]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Optional heading could be added here */}
        {!products && (
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light tracking-widest uppercase text-gray-900 mb-2">
              NUESTROS PRODUCTOS
            </h1>
            <p className="text-xs tracking-widest uppercase text-gray-600">
              COLECCIÓN PREMIUM
            </p>
            <div className="w-16 h-px bg-gray-300 mx-auto mt-4"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {productsToShow.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 tracking-widest uppercase">
                NO SE ENCONTRARON PRODUCTOS
              </p>
            </div>
          ) : (
            productsToShow.map((product) => (
              <motion.div
                key={product.ProductId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                className="product-card"
              >
                <div className="flex flex-col h-full">
                  <Link 
                    to={`/product/${product.ProductId}`} 
                    className="block flex-grow"
                  >
                    {/* Product Image */}
                    <div className="bg-gray-50 h-80 mb-4 flex items-center justify-center p-6">
                      {product.imagenes && product.imagenes[0] ? (
                        <motion.img
                          src={product.imagenes[0]}
                          alt={product.nombre}
                          className="h-full w-full object-contain mix-blend-multiply"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">IMAGEN NO DISPONIBLE</span>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="px-2">
                      {/* Brand */}
                      <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                        {product.marca || 'ANI BEAUTY'}
                      </p>
                      
                      {/* Product Name */}
                      <h3 className="text-lg font-light tracking-wide text-gray-900 mb-2">
                        {product.nombre}
                      </h3>
                      
                      {/* Category */}
                      <p className="text-xs text-gray-500 uppercase mb-3">
                        {product.categoria}
                      </p>
                      
                      {/* Price */}
                      <p className="text-lg font-medium text-gray-900">
                        {formatPrice(product.precio)}
                      </p>
                    </div>
                  </Link>
                  
                  {/* Add to Cart Button */}
                  <div className="mt-4 px-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 text-xs font-medium uppercase border border-black text-black hover:bg-black hover:text-white transition-colors duration-300"
                    >
                      Agregar al carrito
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;