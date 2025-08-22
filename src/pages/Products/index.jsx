import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter, FiX, FiSearch, FiDollarSign, FiChevronDown } from "react-icons/fi";
import { Outlet, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function fetchProducts() {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_URL}/products`);
      const sortedData = data.sort(compareName);
      setProducts(sortedData);
      setFilteredProducts(sortedData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    
    if (search) {
      filtered = filtered.filter(item =>
        item.nombre.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (minPrice) {
      filtered = filtered.filter(item => 
        parseFloat(item.precio) >= parseFloat(minPrice)
      );
    }
    
    if (maxPrice) {
      filtered = filtered.filter(item => 
        parseFloat(item.precio) <= parseFloat(maxPrice)
      );
    }
    
    if (category) {
      filtered = filtered.filter(item => 
        item.categoria.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Aplicar ordenamiento
    if (sortOption === "name") {
      filtered = [...filtered].sort(compareName);
    } else if (sortOption === "price-asc") {
      filtered = [...filtered].sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
    } else if (sortOption === "price-desc") {
      filtered = [...filtered].sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
    }
    
    setFilteredProducts(filtered);
  }, [search, minPrice, maxPrice, category, products, sortOption]);

  function compareName(a, b) {
    const name1 = a.nombre.toUpperCase();
    const name2 = b.nombre.toUpperCase();
    return name1 > name2 ? 1 : name1 < name2 ? -1 : 0;
  }

  // Obtener categorías únicas de los productos
  const uniqueCategories = [...new Set(products.map(product => product.categoria))];

  const formatPrice = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice).replace('ARS', '$');
  };

  const resetFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setCategory("");
    setSortOption("");
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    hover: {
      scale: 1.02,
      backgroundColor: "#000",
      color: "#fff",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const skeletonVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const skeletonItemVariants = {
    hidden: { opacity: 0.5 },
    visible: {
      opacity: 0.8,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <>
      <Outlet />
      <div className="min-h-screen bg-white">
        {/* Header estilo THE CANDLE SHOP */}
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-serif text-gray-900 mb-1">THE CANDLE SHOP</h1>
              <p className="text-xs tracking-widest text-gray-600">AIR BEAUTY</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 py-6">
          {/* Barra de búsqueda y filtros móviles */}
          <div className="flex flex-col md:flex-row gap-3 mb-6 px-2">
            {/* Buscador - Siempre visible - Icono oculto en móviles */}
            <div className="relative flex-grow">
              {/* Icono de lupa - Solo visible en desktop */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none hidden md:flex">
                <FiSearch className="text-gray-400 h-4 w-4" />
              </div>
              <input
                type="search"
                className="w-full pl-3 md:pl-10 pr-3 py-3 border border-gray-300 text-xs tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Buscar productos..."
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </div>

            {/* Botón de filtros para móviles */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors duration-200 md:hidden"
            >
              <FiFilter className="mr-2" />
              Filtros
            </motion.button>

            {/* Select de ordenamiento - Oculto en móviles, visible en desktop */}
            <div className="hidden md:block relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 text-xs uppercase tracking-wider text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-black pr-8"
              >
                <option value="">Ordenar</option>
                <option value="name">Nombre A-Z</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FiChevronDown className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Contador de productos */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-gray-700 mb-4 px-2"
          >
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
          </motion.div>

          {/* Filtros - Ocultos por defecto en móviles, visibles en desktop */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 md:block px-2 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  {/* Precios - Iconos solo visibles en desktop */}
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none hidden md:flex">
                        <FiDollarSign className="text-gray-400 h-4 w-4" />
                      </div>
                      <input
                        type="number"
                        placeholder="Precio mínimo"
                        className="w-full pl-3 md:pl-10 pr-3 py-3 md:py-2 border border-gray-300 text-xs tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-black"
                        onChange={(e) => setMinPrice(e.target.value)}
                        value={minPrice}
                      />
                    </div>

                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none hidden md:flex">
                        <FiDollarSign className="text-gray-400 h-4 w-4" />
                      </div>
                      <input
                        type="number"
                        placeholder="Precio máximo"
                        className="w-full pl-3 md:pl-10 pr-3 py-3 md:py-2 border border-gray-300 text-xs tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-black"
                        onChange={(e) => setMaxPrice(e.target.value)}
                        value={maxPrice}
                      />
                    </div>
                  </div>
                </div>

                {/* Categorías */}
                <div className="flex flex-col items-start">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCategories(!showCategories)}
                    className="flex items-center px-4 py-2 border border-gray-300 text-xs tracking-wider uppercase text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <FiFilter className="mr-2" />
                    {category ? category : 'Todas las categorías'}
                  </motion.button>
                  
                  <AnimatePresence>
                    {showCategories && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap mt-3 gap-2 w-full overflow-hidden"
                      >
                        <motion.button
                          key="all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setCategory("");
                            setShowCategories(false);
                          }}
                          className={`px-4 py-2 text-xs tracking-wider uppercase ${
                            category === "" ? "bg-black text-white" : "bg-white text-gray-700 border border-gray-300"
                          } hover:bg-gray-100 transition-colors duration-200`}
                        >
                          Todas
                        </motion.button>
                        
                        {uniqueCategories.map((cat) => (
                          <motion.button
                            key={cat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setCategory(cat);
                              setShowCategories(false);
                            }}
                            className={`px-4 py-2 text-xs tracking-wider uppercase ${
                              category === cat ? "bg-black text-white" : "bg-white text-gray-700 border border-gray-300"
                          } hover:bg-gray-100 transition-colors duration-200`}
                          >
                            {cat}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Resetear filtros */}
                {(search || minPrice || maxPrice || category || sortOption) && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={resetFilters}
                    className="mt-4 flex items-center text-xs tracking-wider uppercase text-gray-500 hover:text-black transition-colors duration-200"
                  >
                    <FiX className="mr-1" /> Limpiar filtros
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Listado de productos - 2 columnas en móviles */}
          {isLoading ? (
            <motion.div
              variants={skeletonVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
            >
              {[...Array(8)].map((_, index) => (
                <motion.div
                  key={index}
                  variants={skeletonItemVariants}
                  className="flex flex-col"
                >
                  <div className="bg-gray-200 h-48 md:h-64 mb-3 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded mt-2 w-1/2 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded mt-3 animate-pulse"></div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
            >
              <AnimatePresence mode="wait">
                {filteredProducts.length === 0 ? (
                  <motion.div
                    key="no-products"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full text-center py-12"
                  >
                    <p className="text-gray-500 tracking-wider uppercase mb-4">
                      No se encontraron productos
                    </p>
                    <motion.button
                      variants={buttonVariants}
                      onClick={resetFilters}
                      className="px-6 py-2 border border-gray-300 text-xs tracking-wider uppercase text-gray-700 hover:bg-black hover:text-white transition-colors duration-200"
                    >
                      Limpiar filtros
                    </motion.button>
                  </motion.div>
                ) : (
                  filteredProducts.map((product) => (
                    <motion.div
                      key={product.ProductId}
                      variants={itemVariants}
                      whileHover="hover"
                      className="flex"
                    >
                      <div className="product-card relative pb-4 flex flex-col w-full group">
                        <Link 
                          to={`/product/${product.ProductId}`} 
                          className="block flex-grow"
                        >
                          {/* Imagen del producto */}
                          <motion.div
                            variants={imageVariants}
                            whileHover="hover"
                            className="bg-gray-100 h-48 md:h-64 mb-3 flex items-center justify-center overflow-hidden rounded-lg"
                          >
                            {product.imagenes && product.imagenes.length > 0 ? (
                              <img 
                                src={product.imagenes[0]} 
                                alt={product.nombre} 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">Imagen no disponible</span>
                            )}
                          </motion.div>
                          
                          {/* Nombre del producto */}
                          <h3 className="text-xs md:text-sm font-normal text-gray-900 mb-2 uppercase tracking-wider line-clamp-2 px-2">
                            {product.nombre}
                          </h3>
                          
                          {/* Precio */}
                          <p className="text-base md:text-lg font-normal text-gray-900 mb-3 px-2">
                            {formatPrice(product.precio)}
                          </p>
                        </Link>
                        
                        {/* Botón Agregar al carrito */}
                        <div className="px-2">
                          <Link to={`/product/${product.ProductId}`}>
                            <motion.button
                              variants={buttonVariants}
                              whileHover="hover"
                              whileTap="tap"
                              className="w-full py-2 md:py-3 text-xs font-normal uppercase border border-black text-black hover:bg-black hover:text-white transition-colors duration-300 tracking-wider"
                            >
                              Agregar al carrito
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-gray-200 text-center"
          >
            <p className="text-xs text-gray-600 uppercase tracking-widest">thecandleshop.com.ar</p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Products;