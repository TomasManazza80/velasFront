import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

  async function fetchProducts() {
    try {
      const { data } = await axios.get(`${API_URL}/products`);
      const sortedData = data.sort(compareName);
      setProducts(sortedData);
      setFilteredProducts(sortedData);
    } catch (error) {
      console.log(error);
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
          {/* Filtros y ordenamiento */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-2">
            <div className="text-sm text-gray-700 mb-4 md:mb-0">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Botón para mostrar/ocultar filtros en móviles */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-between px-4 py-2 border border-gray-300 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors duration-200 md:hidden"
              >
                <span>Filtros</span>
                <FiChevronDown className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Select de ordenamiento */}
              <div className="relative">
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
          </div>

          {/* Filtros - Ocultos por defecto en móviles, visibles en desktop */}
          <div className={`mb-8 ${showFilters ? 'block' : 'hidden md:block'} px-2`}>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Buscador */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="search"
                  className="w-full pl-10 pr-3 py-3 md:py-2 border border-gray-300 text-xs tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Buscar productos..."
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />
              </div>

              {/* Precios */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    placeholder="Precio mínimo"
                    className="w-full pl-10 pr-3 py-3 md:py-2 border border-gray-300 text-xs tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-black"
                    onChange={(e) => setMinPrice(e.target.value)}
                    value={minPrice}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    placeholder="Precio máximo"
                    className="w-full pl-10 pr-3 py-3 md:py-2 border border-gray-300 text-xs tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-black"
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
              
              {showCategories && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-wrap mt-3 gap-2 w-full"
                >
                  <motion.button
                    key="all"
                    whileHover={{ scale: 1.05 }}
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
            </div>

            {/* Resetear filtros */}
            {(search || minPrice || maxPrice || category || sortOption) && (
              <button
                onClick={resetFilters}
                className="mt-4 flex items-center text-xs tracking-wider uppercase text-gray-500 hover:text-black transition-colors duration-200"
              >
                <FiX className="mr-1" /> Limpiar filtros
              </button>
            )}
          </div>

          {/* Listado de productos - 2 columnas en móviles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 tracking-wider uppercase mb-4">
                  No se encontraron productos
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 border border-gray-300 text-xs tracking-wider uppercase text-gray-700 hover:bg-black hover:text-white transition-colors duration-200"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <motion.div
                  key={product.ProductId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex"
                >
                  <div className="product-card relative pb-4 flex flex-col w-full group">
                    <Link 
                      to={`/product/${product.ProductId}`} 
                      className="block flex-grow"
                    >
                      {/* Imagen del producto */}
                      <div className="bg-gray-100 h-48 md:h-64 mb-3 flex items-center justify-center overflow-hidden">
                        {product.imagenes && product.imagenes.length > 0 ? (
                          <img 
                            src={product.imagenes[0]} 
                            alt={product.nombre} 
                            className="h-full w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">Imagen no disponible</span>
                        )}
                      </div>
                      
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
                 <Link to={`/product/${product.ProductId}`} className="block flex-grow">
  {/* ... */}
  <div className="px-2">
    <button className="w-full py-2 md:py-3 text-xs font-normal uppercase border border-black text-black hover:bg-black hover:text-white transition-colors duration-300 tracking-wider">
      Agregar al carrito
    </button>
  </div>
</Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600 uppercase tracking-widest">thecandleshop.com.ar</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;