import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faSearch, faTimes, faWineBottle } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
// import video from "../../images/fondovela.mp4"; // Código original comentado
import fondoProfecional from "../../images/fondoProfecional.png"; // Importación correcta de la imagen

const Hero = () => {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showResults, setShowResults] = useState(false);
    // LÓGICA DE VIDEO ELIMINADA: isVideoPlaying, isMobile, hasUserInteracted

    const controls = useAnimation();
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    // LÓGICA DE VIDEO ELIMINADA: useEffect para checkIsMobile

    // LÓGICA DE VIDEO ELIMINADA: useEffect para manejar la reproducción de video (play, pause, ended)
    // Se elimina handleVideoPlay, handleVideoPause, handleVideoEnd, playVideo, videoRef, etc.
    
    // Solo dejamos la obtención de productos
    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data } = await axios.get(`${API_URL}/products`);
                setProducts(data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchProducts();
    }, [API_URL]);

    useEffect(() => {
        if (search.trim() === "") {
            setFilteredProducts([]);
            setShowResults(false);
            return;
        }

        const filtered = products.filter(item =>
            item.nombre.toLowerCase().includes(search.toLowerCase())
        );

        // Limitar a los primeros 4 resultados en el hero para mantener la estética
        setFilteredProducts(filtered.slice(0, 4)); 
        setShowResults(true);
    }, [search, products]);

    useEffect(() => {
        const sequence = async () => {
            await controls.start("visible");
            // Animación de rebote para la flecha de scroll
            await controls.start({
                y: [0, -10, 0],
                transition: { repeat: Infinity, duration: 2 }
            });
        };
        sequence();
    }, [controls]);

    // LÓGICA DE VIDEO ELIMINADA: handlePlayVideo, handleUserInteraction

    const handleFilterByCategory = (category) => {
        // Al filtrar por categoría, navegamos a la página de productos con el filtro aplicado.
        // Aquí simulamos la búsqueda en el hero.
        const filtered = products.filter(item => item.categoria.toLowerCase() === category.toLowerCase());
        setFilteredProducts(filtered.slice(0, 4));
        setShowResults(true);
        setSearch(category);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 10,
                stiffness: 100
            }
        }
    };

    const searchVariants = {
        hidden: { width: 0 },
        visible: {
            width: "100%",
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    const formatPrice = (price) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numericPrice).replace('ARS', '$');
    };

    const resetSearch = () => {
        setSearch("");
        setShowResults(false);
    };

    return (
        <div
            // Ya no es necesario el onClick={handleUserInteraction}
            className="relative w-full h-[400px] flex items-center justify-center overflow-hidden" // Aumenté la altura a h-[600px] para que se vea más impactante
        >
            <div className="absolute inset-0 z-0 w-full">
                {/* 1. REEMPLAZO DE <video> POR <img> */}
                <img
                    src={fondoProfecional}
                    alt="Fondo profesional decorativo"
                    // Estilos para cubrir todo el contenedor de manera profesional
                    className="w-full h-full object-cover min-w-full"
                    // Atributos de video eliminados (autoPlay, muted, loop, etc.)
                />
                
                {/* 2. ELIMINACIÓN DEL REPRODUCTOR MÓVIL */}
                {/* Se elimina el div de {!isVideoPlaying && isMobile && ...} */}

                {/* Overlay Oscuro Mantenido para Contraste */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 w-full"></div>
            </div>

            {/* Animación de "burbujas" mantenida */}
            <div className="absolute inset-0 overflow-hidden z-1 w-full">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-gray-200 opacity-20"
                        style={{
                            width: Math.random() * 8 + 2 + "px",
                            height: Math.random() * 8 + 2 + "px",
                            left: Math.random() * 100 + "%",
                            top: Math.random() * 100 + "%"
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 0.2, 0],
                            y: [0, Math.random() * 80 - 40],
                            x: [0, Math.random() * 40 - 20]
                        }}
                        transition={{
                            duration: Math.random() * 15 + 15,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: Math.random() * 5
                        }}
                    />
                ))}
            </div>

            {/* Contenido Central */}
            <motion.div
                className="text-center w-full max-w-6xl mx-auto px-4 z-10 pt-16"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Título y Subtítulo */}
                <AnimatePresence>
                    {!showResults && (
                        <motion.div
                            className="mb-10 w-full"
                            variants={itemVariants}
                            exit={{ opacity: 0, y: -20 }}
                        >
                           <motion.h1
                                className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-light tracking-wider mt-[40px] uppercase text-white mb-4 w-full"
                                variants={itemVariants}
                            >
                                Lu <span className="text-white font-normal">Petruccelli</span>
                            </motion.h1>
                            <motion.h2
                                className="text-sm md:text-base tracking-widest uppercase text-gray-200 w-full mb-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 1 }}
                            >
                                Lifestyle Decoration Designer -
                                velas santa fe
                            </motion.h2>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Barra de Búsqueda */}
                <motion.div
                    className="max-w-2xl w-full mx-auto relative mb-6"
                    variants={searchVariants}
                >
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-white" />
                        </div>
                        <motion.input
                            type="text"
                            placeholder="BUSCAR PRODUCTOS..."
                            className="w-full pl-12 pr-12 py-4 text-center text-sm tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/20 rounded-full focus:outline-none placeholder-white/70 text-white font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            whileFocus={{
                                scale: 1.02,
                                backgroundColor: "rgba(255,255,255,0.15)",
                                borderColor: "#ffffff",
                                backdropFilter: "blur(8px)"
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                borderColor: { duration: 0.3 }
                            }}
                        />
                        {search && (
                            <button
                                onClick={resetSearch}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-white/70 hover:text-white transition-colors" />
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Categorías de Búsqueda Rápida */}
                <AnimatePresence>
                    {!showResults && (
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mt-8"
                            variants={containerVariants}
                            exit={{ opacity: 0 }}
                        >
                            {["Velas Premium", "Collares", "Pulseras", "Accesorios"].map((name, i) => (
                                <motion.div
                                    key={name}
                                    className="text-xs tracking-widest uppercase text-gray-300 hover:text-white transition-colors cursor-pointer py-2 px-4 bg-white/5 backdrop-blur-sm rounded border border-white/10 hover:border-white"
                                    variants={itemVariants}
                                    whileHover={{
                                        y: -3,
                                        backgroundColor: "rgba(255,255,255,0.1)",
                                        transition: { type: "spring", stiffness: 300 }
                                    }}
                                    custom={i}
                                    onClick={() => handleFilterByCategory(name)}
                                >
                                    {name}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Resultados de Búsqueda */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            className="mt-8 w-full max-w-6xl mx-auto px-4 z-20"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-left mb-6 w-full flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm tracking-widest uppercase text-gray-300 w-full">
                                        RESULTADOS PARA: <span className="text-white">{search}</span>
                                    </h3>
                                    {filteredProducts.length > 0 && (
                                        <p className="text-xs tracking-widest text-gray-300 mt-1 w-full">
                                            {filteredProducts.length} {filteredProducts.length === 1 ? 'PRODUCTO' : 'PRODUCTOS'} ENCONTRADOS
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={resetSearch}
                                    className="text-xs text-gray-400 hover:text-white uppercase tracking-widest flex items-center"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cerrar
                                </button>
                            </div>

                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-12 w-full bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                                    <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-2xl mb-3" />
                                    <p className="text-gray-300 tracking-widest uppercase text-sm">
                                        No se encontraron productos para "{search}"
                                    </p>
                                    <p className="text-gray-400 text-xs mt-2">Intenta con otros términos de búsqueda</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full h-[180px] overflow-y-auto">
                                    {filteredProducts.map((product) => (
                                        <motion.div
                                            key={product.ProductId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 cursor-pointer flex flex-col items-center justify-between"
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => navigate(`/product/${product.ProductId}`)}
                                        >
                                            <div className="w-full h-[80px] md:h-[100px] relative overflow-hidden flex items-center justify-center mb-2">
                                                {product.imagenes && product.imagenes.length > 0 ? (
                                                    <img
                                                        src={product.imagenes[0]}
                                                        alt={product.nombre}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                                        <FontAwesomeIcon icon={faWineBottle} className="text-2xl" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center w-full">
                                                <p className="text-black font-semibold text-sm w-full truncate mb-1">
                                                    {formatPrice(product.precio)}
                                                </p>
                                                <p className="text-xs text-gray-600 font-medium w-full truncate">
                                                    {product.nombre}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Flecha de Scroll */}
            <AnimatePresence>
                {!showResults && (
                    <motion.div
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-full text-center"
                        animate={controls}
                        variants={{
                            visible: {
                                opacity: [0, 1, 0],
                                y: [10, 0, 10],
                                transition: { duration: 2, repeat: Infinity }
                            }
                        }}
                        exit={{ opacity: 0 }}
                    >
                        <FontAwesomeIcon
                            icon={faAngleDown}
                            className="text-white text-lg"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Hero;