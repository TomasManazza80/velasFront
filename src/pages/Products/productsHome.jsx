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

    const uniqueProductsByCategory = filteredProducts.reduce((acc, current) => {
        if (!acc.some(item => item.categoria === current.categoria)) {
            acc.push(current);
        }
        return acc;
    }, []);

    return (
        <>
            <Outlet />
            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-12">
                    {/* Encabezado - Estilo modificado */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-light tracking-widest uppercase text-gray-900 mb-2">FASHION DESIGNER</h1>
                        <p className="text-xs tracking-widest uppercase text-gray-600">ENVÍOS A TODO EL PAÍS</p>
                        <div className="w-16 h-px bg-gray-300 mx-auto mt-4"></div>
                    </div>

                    {/* Filtro de categorías - Estilo modificado */}
                    <div className="flex flex-col items-center mb-12">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCategories(!showCategories)}
                            className="flex items-center px-6 py-2 border border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-300"
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
                                        className={`px-4 py-2 text-xs tracking-widest uppercase ${category === cat.id ? "bg-black text-white" : "bg-white text-black border border-black"} hover:bg-gray-100 transition-colors duration-300`}
                                    >
                                        {cat.name}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Listado de productos - Estilo modificado */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProducts.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500 tracking-widest uppercase">NO SE ENCONTRARON PRODUCTOS</p>
                                </div>
                            ) : (
                                filteredProducts.map((item) => (
                                    <motion.div 
                                        key={item.ProductId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-b border-gray-100 pb-6"
                                    >
                                        <ProductCart
                                            id={item.ProductId}
                                            name={item.nombre}
                                            price={item.precio}
                                            image={item.imagenes[0]}
                                            category={item.categoria}
                                            showCategory={false}
                                            showDiscount={false}
                                            imageClass="h-64"
                                        />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductsHome;