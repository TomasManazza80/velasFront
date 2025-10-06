import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiFilter } from "react-icons/fi";
import ProductCart from "../../components/ProductCart"; 
import { Outlet } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ProductsHome = () => {
    // --- Lógica y estados (sin cambios) ---
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [category, setCategory] = useState("");
    const [showCategories, setShowCategories] = useState(false);
    const [loading, setLoading] = useState(true);

    const carouselRef = useRef(null);
    const [carouselWidth, setCarouselWidth] = useState(0);

    const MAX_CAROUSEL_ITEMS = 12;
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
            setFilteredProducts(sortedData.slice(0, MAX_CAROUSEL_ITEMS)); 
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
        
        setFilteredProducts(filtered.slice(0, MAX_CAROUSEL_ITEMS));
    }, [category, products]);

    function compareName(a, b) {
        return a.nombre.localeCompare(b.nombre);
    }
    
    // --- EFECTO PARA CALCULAR EL ANCHO DEL CARRUSEL (Mantenido) ---
    useEffect(() => {
        if (carouselRef.current) {
            const updateWidth = () => {
                const currentScrollWidth = carouselRef.current.scrollWidth;
                const currentOffsetWidth = carouselRef.current.offsetWidth;
                // Ajustamos el cálculo para que el límite izquierdo sea el padding (pl-4)
                // Usamos un offset fijo para evitar problemas de cálculo con el padding
                const paddingOffset = 16; // 'pl-4' en Tailwind es 1rem = 16px
                const width = currentScrollWidth > currentOffsetWidth 
                    ? currentScrollWidth - currentOffsetWidth + paddingOffset // Añadimos el offset para el arrastre
                    : 0; 

                setCarouselWidth(width);
            };

            updateWidth();
            const timeout = setTimeout(updateWidth, 50); 
            window.addEventListener('resize', updateWidth);
            return () => {
                clearTimeout(timeout);
                window.removeEventListener('resize', updateWidth);
            }
        }
    }, [filteredProducts, loading]); 

    // --- Configuración de transición (Mantenido) ---
    const dragTransitionConfig = {
        bounceStiffness: 600, 
        bounceDamping: 20, 
        power: 0.3, 
        timeConstant: 300, 
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    };

    return (
        <>
            <Outlet />
            
            <div className="min-h-screen bg-gradient-to-br from-neutral-200 via-white to-white"> 
                {/* Contenedor para filtros: Mantiene el margen central y padding horizontal */}
                <div className="container mx-auto px-4 sm:px-4 pt-4 pb-8 sm:pt-6 sm:pb-4">
                    
                    {/* Filtro de categorías */}
                    <div className="flex flex-col items-center mb-4 sm:mb-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCategories(!showCategories)}
                            className="flex items-center px-4 py-2 border border-gray-400 text-xs sm:text-sm tracking-widest uppercase hover:bg-gray-100 transition-colors duration-300 text-black"
                        >
                            <FiFilter className="mr-2 mb-0.5" />
                            FILTRAR POR CATEGORÍA
                        </motion.button>
                        
                        {showCategories && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-wrap justify-center mt-4 gap-2 max-w-2xl overflow-hidden" 
                            >
                                {categories.map((cat) => (
                                    <motion.button
                                        key={cat.id}
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => {
                                            setCategory(cat.id);
                                            setShowCategories(false);
                                        }}
                                        className={`px-2 py-1 text-xs tracking-widest uppercase ${category === cat.id ? "bg-black text-white font-semibold" : "bg-transparent text-gray-700 border border-gray-400"} hover:bg-gray-100 hover:text-black transition-colors duration-300`}
                                    >
                                        {cat.name}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div> 
                
                {/* --- CARRUSEL de Productos (Contenedor Crítico) --- */}
                {/* **¡CORRECCIÓN CRÍTICA!** Sacamos este div del 'container mx-auto' para que ocupe todo el ancho del viewport (w-full). */}
                {loading ? (
                    <div className="flex justify-center items-center py-16 sm:py-20">
                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-black"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <p className="text-gray-700 tracking-widest uppercase text-sm">NO SE ENCONTRARON PRODUCTOS EN ESTA CATEGORÍA</p>
                    </div>
                ) : (
                    // El contenedor principal del carrusel: `w-full overflow-hidden`
                    <motion.div className="w-full overflow-hidden cursor-grab py-4"> 
                        <motion.div
                            ref={carouselRef}
                            drag="x" 
                            // El límite izquierdo ahora es 0 (para el arrastre)
                            dragConstraints={{ right: 0, left: -carouselWidth }}
                            dragTransition={dragTransitionConfig} 
                            // `flex` para horizontalidad, `pl-4` para el margen inicial en móvil
                            className="flex pl-4 sm:pl-0 sm:container sm:mx-auto" 
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredProducts.map((item) => (
                                <motion.div 
                                    key={item.ProductId}
                                    variants={cardVariants}
                                    // **CLAVE DE VISUALIZACIÓN:** `min-w-[50%]` fuerza 2 tarjetas por pantalla en móvil.
                                    // El padding horizontal es manejado por esta clase.
                                    className="min-w-[50%] sm:min-w-[33.333%] md:min-w-[25%] lg:min-w-[20%] xl:min-w-[16.666%] pr-4 pb-2 sm:p-3 md:p-4"
                                >
                                    <ProductCart
                                        id={item.ProductId}
                                        name={item.nombre}
                                        price={item.precio}
                                        image={item.imagenes[0]}
                                        category={item.categoria}
                                        showCategory={false}
                                        showDiscount={false}
                                        imageClass="h-40 sm:h-56 md:h-64 rounded-md shadow-lg" 
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

export default ProductsHome;