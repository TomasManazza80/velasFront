import React, { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faSearch, faTimes, faWineBottle } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import fondoProfecional from "../../images/fondoProfecional.png";

const Hero = () => {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const controls = useAnimation();
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data } = await axios.get(`${API_URL}/products`); 
                setProducts(data);
            } catch (error) {
                console.log("Error al obtener productos:", error);
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
        setFilteredProducts(filtered.slice(0, 4)); 
        setShowResults(true);
    }, [search, products]);

    useEffect(() => {
        const sequence = async () => {
            await controls.start("visible");
            await controls.start({
                y: [0, -10, 0],
                transition: { repeat: Infinity, duration: 3 } // Flecha también más lenta
            });
        };
        sequence();
    }, [controls]);

    const handleFilterByCategory = (categoryName) => {
        resetSearch(); 
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
        navigate(`/products?category=${categorySlug}`);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", damping: 10, stiffness: 100 }
        }
    };

    const searchVariants = {
        hidden: { width: 0 },
        visible: {
            width: "100%",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const formatPrice = (price) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('es-AR', {
            style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(numericPrice).replace('ARS', '$');
    };

    const resetSearch = () => { setSearch(""); setShowResults(false); };
    const handleNavigateToSearchResults = () => { navigate(`/products?search=${search}`); };

    return (
        <div className="relative w-full h-[550px] md:h-[400px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0 w-full">
                <img src={fondoProfecional} alt="Fondo" className="w-full h-full object-cover min-w-full" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 w-full"></div>
            </div>

            {/* ANIMACIÓN DE PARTÍCULAS EXTREMADAMENTE LENTA */}
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
                            opacity: [0, 0.15, 0], // Opacidad un poco más sutil
                            y: [0, Math.random() * 60 - 30],
                            x: [0, Math.random() * 30 - 15]
                        }}
                        transition={{
                            // DURACIÓN AUMENTADA: entre 60 y 80 segundos por ciclo
                            duration: Math.random() * 20 + 60, 
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: Math.random() * 5,
                            ease: "linear" // Movimiento constante y suave
                        }}
                    />
                ))}
            </div>

            <motion.div className="text-center w-full max-w-6xl mx-auto px-4 z-10 pt-16" variants={containerVariants} initial="hidden" animate="visible">
                <AnimatePresence>
                    {!showResults && (
                        <motion.div className="mb-10 w-full" variants={itemVariants} exit={{ opacity: 0, y: -20 }}>
                           <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-light tracking-wider mt-[40px] uppercase text-white mb-4 w-full" variants={itemVariants}>
                                Lu <span className="text-white font-normal">Petruccelli</span>
                            </motion.h1>
                            <motion.h2 className="text-sm md:text-base tracking-widest uppercase text-gray-200 w-full mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
                                Lifestyle Decoration Designer - velas santa fe
                            </motion.h2>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div className="max-w-2xl w-full mx-auto relative mb-6" variants={searchVariants}>
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && search.trim() !== "") handleNavigateToSearchResults();
                            }}
                        />
                        {search && (
                            <button onClick={resetSearch} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                <FontAwesomeIcon icon={faTimes} className="text-white/70 hover:text-white transition-colors" />
                            </button>
                        )}
                    </div>
                </motion.div>

                <AnimatePresence>
                    {!showResults && (
                        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mt-8" variants={containerVariants} exit={{ opacity: 0 }}>
                            {["Velas Premium", "Collares", "Pulseras", "Accesorios"].map((name) => (
                                <motion.div
                                    key={name}
                                    className="text-xs tracking-widest uppercase text-gray-300 hover:text-white transition-colors cursor-pointer py-2 px-4 bg-white/5 backdrop-blur-sm rounded border border-white/10 hover:border-white"
                                    variants={itemVariants}
                                    whileHover={{ y: -3, backgroundColor: "rgba(255,255,255,0.1)" }}
                                    onClick={() => handleFilterByCategory(name)}
                                >
                                    {name}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showResults && (
                        <motion.div className="mt-8 w-full max-w-6xl mx-auto px-4 z-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="text-left mb-6 w-full flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm tracking-widest uppercase text-gray-300 w-full">RESULTADOS PARA: <span className="text-white">{search}</span></h3>
                                </div>
                                <button onClick={resetSearch} className="text-xs text-gray-400 hover:text-white uppercase tracking-widest flex items-center">
                                    <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cerrar
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full h-[180px] overflow-y-auto">
                                {filteredProducts.map((product) => (
                                    <motion.div key={product.ProductId} className="bg-white p-2 rounded-lg shadow-lg cursor-pointer flex flex-col items-center" onClick={() => navigate(`/product/${product.ProductId}`)}>
                                        <div className="w-full h-[80px] md:h-[100px] flex items-center justify-center mb-2">
                                            {product.imagenes && product.imagenes[0] ? <img src={product.imagenes[0]} className="w-full h-full object-contain" alt={product.nombre} /> : <FontAwesomeIcon icon={faWineBottle} />}
                                        </div>
                                        <p className="text-black font-semibold text-sm">{formatPrice(product.precio)}</p>
                                        <p className="text-xs text-gray-600 truncate w-full text-center">{product.nombre}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {!showResults && (
                    <motion.div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-full text-center" animate={controls} variants={{ visible: { opacity: [0, 1, 0], y: [10, 0, 10], transition: { duration: 3, repeat: Infinity } } }}>
                        <FontAwesomeIcon icon={faAngleDown} className="text-white text-lg" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Hero;