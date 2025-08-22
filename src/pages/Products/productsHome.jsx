import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiFilter } from "react-icons/fi";
import ProductCart from "../../components/ProductCart";
import { Outlet } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ProductsHome = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [category, setCategory] = useState("");
    const [showCategories, setShowCategories] = useState(false);
    const [loading, setLoading] = useState(true);

    const categories = [
        { id: "", name: "Todos" },
        { id: "velas", name: "Velas" },
        { id: "velas premium", name: "Velas Premium" },
        { id: "pulceras", name: "PULCERAS" },
        { id: "collares", name: "collares" },
        { id: "aromatizadores", name: "Aromatizadores" },
        { id: "accesiorios", name: "Accesorios" },
    ];

    async function fetchProducts() {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/products`);
            const sortedData = data.sort(compareName);
            setProducts(sortedData);
            setFilteredProducts(sortedData);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const filtered = category === "" 
            ? products 
            : products.filter(item => item.categoria === category);
        setFilteredProducts(filtered);
    }, [category, products]);

    function compareName(a, b) {
        return a.nombre.localeCompare(b.nombre);
    }

    return (
        <>
            <Outlet />
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-3 py-8 sm:px-4 sm:py-12">
                    {/* Encabezado */}
                    <div className="text-center mb-8 sm:mb-12">
                        <h1 className="text-2xl sm:text-3xl font-light tracking-widest uppercase text-gray-900 mb-2">LIFESTYLE DECORATION DESIGNER</h1>
                        <p className="text-xs tracking-widest uppercase text-gray-600">ENVÍOS A TODO EL PAÍS</p>
                        <div className="w-16 h-px bg-gray-300 mx-auto mt-4"></div>
                    </div>

                    {/* Filtro de categorías */}
                    <div className="flex flex-col items-center mb-8 sm:mb-12">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCategories(!showCategories)}
                            className="flex items-center px-5 py-2 border border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-300"
                        >
                            <FiFilter className="mr-2" />
                            CATEGORÍAS
                        </motion.button>
                        
                        {showCategories && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="flex flex-wrap justify-center mt-4 gap-2 max-w-2xl"
                            >
                                {categories.map((cat) => (
                                    <motion.button
                                        key={cat.id}
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => {
                                            setCategory(cat.id);
                                            setShowCategories(false);
                                        }}
                                        className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs tracking-widest uppercase ${category === cat.id ? "bg-black text-white" : "bg-white text-black border border-black"} hover:bg-gray-100 transition-colors duration-300`}
                                    >
                                        {cat.name}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Listado de productos - Corregido para mostrar 2 por fila en móviles */}
                    {loading ? (
                        <div className="flex justify-center items-center py-16 sm:py-20">
                            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
                            {filteredProducts.length === 0 ? (
                                <div className="col-span-2 sm:col-span-full text-center py-12">
                                    <p className="text-gray-500 tracking-widest uppercase text-sm">NO SE ENCONTRARON PRODUCTOS</p>
                                </div>
                            ) : (
                                filteredProducts.map((item) => (
                                    <motion.div 
                                        key={item.ProductId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex justify-center"
                                    >
                                        <div className="w-full max-w-[180px] sm:max-w-none">
                                            <ProductCart
                                                id={item.ProductId}
                                                name={item.nombre}
                                                price={item.precio}
                                                image={item.imagenes[0]}
                                                category={item.categoria}
                                                showCategory={false}
                                                showDiscount={false}
                                               imageClass="h-40 sm:h-48 md:h-56 lg:h-64 rounded"
                                            />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                
                {/* Estilos adicionales para asegurar la correcta visualización */}
                <style jsx>{`
                    @media (max-width: 640px) {
                        .grid-cols-2 {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                        }
                    }
                `}</style>
            </div>
        </>
    );
};

export default ProductsHome;