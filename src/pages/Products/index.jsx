import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiFilter, FiX, FiSearch, FiDollarSign } from "react-icons/fi";
import ProductCart from "../../components/ProductCart";
import { Outlet, Link } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const API_URL = 'http://localhost:3000';

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
    
    setFilteredProducts(filtered);
  }, [search, minPrice, maxPrice, category, products]);

  function compareName(a, b) {
    const name1 = a.nombre.toUpperCase();
    const name2 = b.nombre.toUpperCase();
    return name1 > name2 ? 1 : name1 < name2 ? -1 : 0;
  }

  // Obtener categorías únicas de los productos
  const uniqueCategories = [...new Set(products.map(product => product.categoria))];

  const formatPrice = (price) => {
    // Convertir el precio de string a número
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
  };

  return (
    <>
      <Outlet />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          {/* Encabezado */}
          <div className="text-center mb-12">
            <br />
            <br />
            <h1 className="text-3xl font-light tracking-widest uppercase text-gray-900 mb-2">
              NUESTROS PRODUCTOS
            </h1>
            <p className="text-xs tracking-widest uppercase text-gray-600">
              ENVÍOS A TODO EL PAÍS
            </p>
            <div className="w-16 h-px bg-gray-300 mx-auto mt-4"></div>
          </div>

          {/* Filtros */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Buscador */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="search"
                  className="w-full pl-10 pr-3 py-2 border border-black text-xs tracking-widest uppercase focus:outline-none"
                  placeholder="BUSCAR PRODUCTOS..."
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />
              </div>

              {/* Precios */}
              <div className="flex gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    placeholder="MÍNIMO"
                    className="w-full pl-10 pr-3 py-2 border border-black text-xs tracking-widest uppercase focus:outline-none"
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
                    placeholder="MÁXIMO"
                    className="w-full pl-10 pr-3 py-2 border border-black text-xs tracking-widest uppercase focus:outline-none"
                    onChange={(e) => setMaxPrice(e.target.value)}
                    value={maxPrice}
                  />
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div className="flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center px-6 py-2 border border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-300"
              >
                <FiFilter className="mr-2" />
                {category ? category.toUpperCase() : 'CATEGORÍAS'}
              </motion.button>
              
              {showCategories && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-wrap justify-center mt-4 gap-2 max-w-2xl"
                >
                  <motion.button
                    key="all"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setCategory("");
                      setShowCategories(false);
                    }}
                    className={`px-4 py-2 text-xs tracking-widest uppercase ${
                      category === "" ? "bg-black text-white" : "bg-white text-black border border-black"
                    } hover:bg-gray-100 transition-colors duration-300`}
                  >
                    TODOS
                  </motion.button>
                  
                  {uniqueCategories.map((cat) => (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setCategory(cat);
                        setShowCategories(false);
                      }}
                      className={`px-4 py-2 text-xs tracking-widest uppercase ${
                        category === cat ? "bg-black text-white" : "bg-white text-black border border-black"
                      } hover:bg-gray-100 transition-colors duration-300`}
                    >
                      {cat.toUpperCase()}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Resetear filtros */}
            {(search || minPrice || maxPrice || category) && (
              <button
                onClick={resetFilters}
                className="mt-4 flex items-center text-xs tracking-widest uppercase text-gray-500 hover:text-black"
              >
                <FiX className="mr-1" /> LIMPIAR FILTROS
              </button>
            )}
          </div>

          {/* Listado de productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 tracking-widest uppercase">
                  NO SE ENCONTRARON PRODUCTOS
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <motion.div
                  key={product.ProductId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="product-card relative pb-6 flex flex-col">
                    <Link 
                      to={`/product/${product.ProductId}`} 
                      className="block flex-grow"
                    >
                      {/* Imagen del producto */}
                      <div className="bg-gray-100 h-64 mb-4 flex items-center justify-center overflow-hidden">
                        {product.imagenes && product.imagenes.length > 0 ? (
                          <img 
                            src={product.imagenes[0]} 
                            alt={product.nombre} 
                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <span className="text-gray-400">IMAGEN NO DISPONIBLE</span>
                        )}
                      </div>
                      
                      {/* Nombre del producto */}
                      <h3 className="text-sm font-medium uppercase text-gray-900 mb-2">
                        {product.nombre}
                      </h3>
                      
                      {/* Marca */}
                      <p className="text-xs text-gray-500 mb-1">
                        {product.marca}
                      </p>
                      
                      {/* Precio */}
                      <p className="text-lg font-normal text-gray-900 mb-4">
                        {formatPrice(product.precio)}
                      </p>
                    </Link>
                    
                    {/* Botón Agregar al carrito */}
                    <button className="mt-auto w-full py-3 text-xs font-medium uppercase border border-black text-black hover:bg-black hover:text-white transition-colors duration-300">
                      Agregar al carrito
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;