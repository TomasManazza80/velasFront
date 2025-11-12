import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiFilter } from "react-icons/fi";
import { Outlet } from "react-router-dom";
import ProductCart from "../../components/ProductCart"; 

const API_URL = import.meta.env.VITE_API_URL;

// Definición del color Bordo oscuro para acentuar
const ACCENT_COLOR_BORDO = "#B22222"; 

// 💡 Estilos de profundidad del fondo ORIGINALES (Priorizando el BLANCO)
const depthStyle = {
    // Gradiente elíptico: La "luz" brillante (rgba(255, 255, 255, 1)) se concentra en el centro superior (50% 0%).
    // Se desvanece suavemente a un gris muy claro (rgba(240, 240, 240, 1)) para un efecto de profundidad suave.
    background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 1) 0%, rgba(240, 240, 240, 1) 100%)',
    backgroundAttachment: 'fixed', // Mantiene el foco de luz fijo al hacer scroll.
};

// =================================================================
// 🍷 ESTILOS CSS PUROS PARA EL CARRUSEL INFINITO
// =================================================================
const carouselStyles = `
/* Contenedor principal para ocultar el contenido extra */
.carousel-container {
    overflow: hidden;
    width: 100%;
    /* Desvanecimiento sutil en los bordes para el efecto infinito (adaptado a fondo claro) */
    mask-image: linear-gradient(to right, 
        rgba(0, 0, 0, 0) 0%, 
        rgba(0, 0, 0, 1) 10%, 
        rgba(0, 0, 0, 1) 90%, 
        rgba(0, 0, 0, 0) 100%
    );
}

/* Pista de todos los elementos (originales + duplicados) */
.carousel-track {
    display: flex;
    width: fit-content; /* Asegura que la pista sea lo suficientemente ancha */
    /* ✅ VELOCIDAD MODIFICADA: 40 segundos para ser más lento */
    animation: scroll-left 40s linear infinite; 
    padding: 20px 0; /* Espacio vertical para estética */
}

/* Definición de la animación de movimiento */
@keyframes scroll-left {
    from {
        transform: translateX(0);
    }
    /* Mueve exactamente el ancho de la lista original para un reinicio sin salto */
    to {
        transform: translateX(calc(-100% / 2)); 
    }
}
.carousel-item-wrapper {
    /* Define el ancho de cada producto en el carrusel */
    min-width: 250px; /* Ancho fijo para cada tarjeta de producto */
    padding: 0 15px; /* Espacio entre productos */
    box-sizing: border-box;
}

@media (max-width: 768px) {
    .carousel-item-wrapper {
        min-width: 180px;
        padding: 0 10px;
    }
}
`;


const ProductsHome = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [category, setCategory] = useState("");
    const [showCategories, setShowCategories] = useState(false);
    const [loading, setLoading] = useState(true);

    // Categorías adaptadas para una Vinoteca
    const categories = [
        { id: "", name: "Todos los Vinos" },
        { id: "tintos", name: "Tintos" },
        { id: "blancos", name: "Blancos" },
        { id: "espumantes", name: "Espumantes" },
        { id: "rosados", name: "Rosados" },
        { id: "cosecha-tardia", name: "Cosecha Tardía" },
        { id: "accesorios", name: "Accesorios de Vino" },
    ];

    async function fetchProducts() {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/products`);
            const sortedData = data.sort(compareName);
            setProducts(sortedData);
            setFilteredProducts(sortedData);
        } catch (error) {
            console.error("Error al obtener los productos:", error);
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

    // Productos para el carrusel (excluimos accesorios si es necesario)
    const carouselProducts = products.filter(p => p.categoria !== 'accesorios');
    
    // *** CLAVE PARA EL MOVIMIENTO INFINITO: DUPLICAR LA LISTA. ***
    const duplicatedCarouselProducts = [...carouselProducts, ...carouselProducts];


    return (
        <>
            {/* INYECTAMOS LOS ESTILOS CSS DEL CARRUSEL */}
            <style dangerouslySetInnerHTML={{ __html: carouselStyles }} /> 
            <Outlet />
            
            {/* Contenedor principal con estilo de profundidad. Clase de texto cambiada a 'text-black' */}
            <div className="min-h-screen text-black" style={depthStyle}> 
                <div className="container mx-auto px-0 py-10 sm:px-6 sm:py-16">
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-20 sm:py-24">
                            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-gray-900"></div>
                        </div>
                    ) : (
                        // CÓDIGO DEL CARRUSEL INFINITO INTEGRADO AQUÍ
                        <div className="carousel-container">
                            <div className="carousel-track">
                                {duplicatedCarouselProducts.map((item, index) => (
                                    <div key={index} className="carousel-item-wrapper">
                                        <motion.div 
                                            whileHover={{ scale: 1.05 }} 
                                            transition={{ type: "spring", stiffness: 300 }}
                                            className="h-full w-full flex justify-center"
                                        >
                                            <ProductCart
                                                id={item.ProductId}
                                                name={item.nombre}
                                                price={item.precio}
                                                image={item.imagenes[0]}
                                                category={item.categoria}
                                                showCategory={false}
                                                showDiscount={false}
                                                imageClass="h-72 object-cover rounded-sm shadow-xl transition-shadow duration-300 hover:shadow-2xl"
                                            />
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-20 px-3 sm:px-6"> {/* Padding superior para separar del carrusel */}
                        
                        {/* SECCIÓN 2: LISTADO COMPLETO CON FILTROS */}
                        <div className="text-center mb-10 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl font-serif tracking-widest uppercase text-black mb-2">
                                algunos de nuestros productos destacados
                            </h2>
                            <p className="text-sm tracking-widest uppercase text-gray-700">
                                Explora todo nuestro catálogo.
                            </p>
                            <div className="w-20 h-0.5 bg-gray-400 mx-auto mt-4"></div> 
                        </div>

                        {/* Filtro de categorías (Reutilizando el estilo original) */}
                        <div className="flex justify-center mb-12 relative z-10">
                            <button
                                onClick={() => setShowCategories(!showCategories)}
                                className="flex items-center text-sm font-medium tracking-wider uppercase bg-white text-gray-800 py-2 px-4 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300 shadow-md"
                            >
                                <FiFilter className="mr-2" style={{ color: ACCENT_COLOR_BORDO }} />
                                Filtrar por Categoría: <span className="ml-1 font-bold text-black">{categories.find(c => c.id === category)?.name || "Todos los Vinos"}</span>
                            </button>

                            {showCategories && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20"
                                >
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setCategory(cat.id);
                                                setShowCategories(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition duration-200 ${
                                                category === cat.id
                                                    ? `bg-gray-100 text-black font-bold` 
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                        
                        {/* Listado de productos filtrados */}
                        {loading ? (
                            // Spinner (adaptado a fondo blanco)
                            <div className="flex justify-center items-center py-20 sm:py-24">
                                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-gray-900"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-8">
                                {filteredProducts.length === 0 ? (
                                    // Mensaje de no productos (adaptado a fondo blanco)
                                    <div className="col-span-2 sm:col-span-full text-center py-20">
                                        <p className="text-gray-600 tracking-widest uppercase text-base font-light">
                                            LO SENTIMOS, NO SE ENCONTRARON VINOS EN ESTA SELECCIÓN.
                                        </p>
                                    </div>
                                ) : (
                                    filteredProducts.map((item, index) => (
                                        <motion.div 
                                            key={item.ProductId}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }} 
                                            className="flex justify-center h-full"
                                        >
                                            <div className="w-full h-full"> 
                                                <ProductCart
                                                    id={item.ProductId}
                                                    name={item.nombre}
                                                    price={item.precio}
                                                    image={item.imagenes[0]}
                                                    category={item.categoria}
                                                    showCategory={false}
                                                    showDiscount={false}
                                                    imageClass="h-48 sm:h-60 md:h-72 lg:h-80 object-cover rounded-sm shadow-xl transition-shadow duration-300 hover:shadow-2xl"
                                                />
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductsHome;