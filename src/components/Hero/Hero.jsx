import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faSearch, faTimes, faHeart, faWineBottle } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import sanValentinBanner from "../../images/san-valentin-banner.png";

const Hero = () => {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const controls = useAnimation();
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const heroRef = useRef(null);

    // --- PARALLAX EFFECT ---
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

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
        controls.start({
            y: [0, -10, 0],
            transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
        });
    }, [controls]);

    const handleFilterByCategory = (categoryName) => {
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
        navigate(`/products?category=${categorySlug}`);
    };

    const formatPrice = (price) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('es-AR', {
            style: 'currency', currency: 'ARS', minimumFractionDigits: 0
        }).format(numericPrice);
    };

    return (
        <div ref={heroRef} className="relative w-full h-[650px] md:h-[600px] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">

            {/* 1. FONDO CON PARALLAX (CORREGIDO) */}
            <motion.div className="absolute inset-0 z-0" style={{ y: yBg }}>
                <img
                    src={sanValentinBanner}
                    alt="San Valentin Collection"
                    className="w-full h-full object-cover scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#2e0a0a]/60 to-black/80"></div>
            </motion.div>

            {/* 2. PARTÍCULAS LENTAS */}
            <div className="absolute inset-0 overflow-hidden z-1 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-orange-100 opacity-20 blur-[1px]"
                        style={{
                            width: Math.random() * 5 + 2 + "px",
                            height: Math.random() * 5 + 2 + "px",
                            left: Math.random() * 100 + "%",
                            top: Math.random() * 100 + "%"
                        }}
                        animate={{
                            opacity: [0, 0.3, 0],
                            y: [0, -150],
                            x: [0, Math.random() * 50 - 25]
                        }}
                        transition={{
                            duration: Math.random() * 20 + 40,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* 3. CONTENIDO PRINCIPAL */}
            <motion.div
                className="text-center w-full max-w-6xl mx-auto px-6 z-10 pt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <AnimatePresence mode="wait">
                    {!showResults && (
                        <motion.div
                            key="titles"
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-12"
                        >
                            <span className="text-[10px] tracking-[0.5em] text-white/60 mb-4 block uppercase font-bold">
                                Lu Petruccelli presenta
                            </span>
                            <h1 className="text-5xl md:text-8xl font-serif text-white mb-6 italic">
                                Amor <span className="font-light not-italic opacity-80">Eterno</span>
                            </h1>
                            <div className="h-[1px] w-24 bg-[#B22222] mx-auto mb-8"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SEARCH BAR GLASS */}
                <div className="max-w-2xl w-full mx-auto relative">
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-white/40 group-focus-within:text-[#B22222] transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="BUSCAR EL REGALO IDEAL..."
                            className="w-full pl-16 pr-16 py-5 text-center text-xs tracking-[0.3em] uppercase bg-white/5 backdrop-blur-md border border-white/10 rounded-full focus:outline-none focus:border-[#B22222]/50 transition-all placeholder-white/30 text-white font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute inset-y-0 right-0 pr-6">
                                <FontAwesomeIcon icon={faTimes} className="text-white/30 hover:text-white" />
                            </button>
                        )}
                    </div>

                    {/* QUICK CATEGORIES */}
                    {!showResults && (
                        <motion.div
                            className="flex flex-wrap justify-center gap-3 mt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            {["Velas", "Sets", "Accesorios"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleFilterByCategory(cat)}
                                    className="text-[9px] tracking-widest uppercase text-white/50 hover:text-white px-6 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-[#B22222]/20 transition-all"
                                >
                                    {cat}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* SEARCH RESULTS */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {filteredProducts.map((p) => (
                                <motion.div
                                    key={p.ProductId}
                                    whileHover={{ y: -5 }}
                                    className="bg-white p-3 rounded-xl shadow-2xl cursor-pointer"
                                    onClick={() => navigate(`/product/${p.ProductId}`)}
                                >
                                    <div className="h-32 w-full bg-gray-50 rounded-lg mb-3 overflow-hidden">
                                        {p.imagenes?.[0] ? (
                                            <img src={p.imagenes[0]} className="w-full h-full object-cover" alt={p.nombre} />
                                        ) : (
                                            <div className="flex h-full items-center justify-center"><FontAwesomeIcon icon={faWineBottle} className="text-gray-200" /></div>
                                        )}
                                    </div>
                                    <p className="text-[#B22222] font-bold text-sm">{formatPrice(p.precio)}</p>
                                    <p className="text-[10px] text-gray-500 uppercase truncate">{p.nombre}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* SCROLL ICON */}
            {!showResults && (
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
                    animate={controls}
                >
                    <FontAwesomeIcon icon={faAngleDown} />
                </motion.div>
            )}
        </div>
    );
};

export default Hero;