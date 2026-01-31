import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown, faSearch, faTimes, faHeart, faWineBottle,
    faGem, faLeaf, faChevronLeft, faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import sanValentinBanner from "../../images/san-valentin-banner.png";
import bannerMayorista from "../../images/bannerMayorista.png";
const SLIDES = [

    {
        id: 1,
        title: "Amor",
        subtitle: "Eterno",
        label: "Lu Petruccelli presenta",
        image: sanValentinBanner,
        color: "#B22222",
        icon: faHeart
    },
    {
        id: 0,
        title: "Venta",
        subtitle: "Mayorista",
        label: "🔥 30% OFF 1RA COMPRA > $150.000 📦",
        image: bannerMayorista,
        color: "#000000",
        icon: faGem
    },
    // {
    //     id: 2,
    //     title: "Esencia",
    //     subtitle: "Natural",
    //     label: "Colección Aromas 2026",
    //     image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=2000",
    //     color: "#d4a373",
    //     icon: faLeaf
    // },
    // {
    //     id: 3,
    //     title: "Lujo",
    //     subtitle: "Exclusivo",
    //     label: "Curaduría Premium",
    //     image: "https://images.unsplash.com/photo-1583549214013-03080c598007?auto=format&fit=crop&q=80&w=2000",
    //     color: "#708090",
    //     icon: faGem
    // }
];

const Hero = () => {
    const [index, setIndex] = useState(0);
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const controls = useAnimation();
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const heroRef = useRef(null);

    // --- LÓGICA DE NAVEGACIÓN ---
    const nextSlide = useCallback(() => {
        setIndex((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }, []);

    // Timer automático con reinicio al interactuar
    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [nextSlide, index]); // Se reinicia el intervalo si el índice cambia manualmente

    // --- PARALLAX ---
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data } = await axios.get(`${API_URL}/products`);
                setProducts(data);
            } catch (error) { console.log(error); }
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

    const formatPrice = (price) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('es-AR', {
            style: 'currency', currency: 'ARS', minimumFractionDigits: 0
        }).format(numericPrice);
    };

    return (
        <div ref={heroRef} className="relative w-full h-[700px] md:h-[650px] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">

            {/* 1. BACKGROUND CAROUSEL */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={SLIDES[index].id}
                    className="absolute inset-0 z-0"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    style={{ y: yBg }}
                >
                    <img src={SLIDES[index].image} alt={SLIDES[index].title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, ${SLIDES[index].color}22 50%, rgba(0,0,0,0.8) 100%)` }} />
                </motion.div>
            </AnimatePresence>

            {/* 2. FLECHAS DE NAVEGACIÓN (Solo si no hay resultados de búsqueda) */}
            {!showResults && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 md:left-8 z-30 p-4 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 group"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="text-xl md:text-2xl group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 md:right-8 z-30 p-4 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 group"
                    >
                        <FontAwesomeIcon icon={faChevronRight} className="text-xl md:text-2xl group-hover:translate-x-1 transition-transform" />
                    </button>
                </>
            )}

            {/* 3. CONTENIDO PRINCIPAL */}
            <motion.div className="text-center w-full max-w-6xl mx-auto px-6 z-10 pt-10">
                <AnimatePresence mode="wait">
                    {!showResults && (
                        <motion.div
                            key={SLIDES[index].id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.7 }}
                            className="mb-12"
                        >
                            <span className="text-[10px] tracking-[0.6em] text-white/70 mb-4 block uppercase font-bold">
                                {SLIDES[index].label}
                            </span>
                            <h1 className="text-5xl md:text-8xl font-serif text-white mb-6 italic leading-tight">
                                {SLIDES[index].title} <span className="font-light not-italic opacity-80">{SLIDES[index].subtitle}</span>
                            </h1>
                            <motion.div
                                className="h-[1px] w-24 mx-auto mb-8"
                                animate={{ backgroundColor: SLIDES[index].color }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SEARCH BAR */}
                <div className="max-w-2xl w-full mx-auto relative z-20">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-white/40 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="BUSCAR EL REGALO IDEAL..."
                            className="w-full pl-16 pr-16 py-5 text-center text-xs tracking-[0.3em] uppercase bg-white/5 backdrop-blur-xl border border-white/10 rounded-full focus:outline-none focus:border-white/30 transition-all placeholder-white/20 text-white font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Dots Indicadores */}
                    {!showResults && (
                        <div className="flex justify-center gap-3 mt-10">
                            {SLIDES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    className={`h-[3px] transition-all duration-700 rounded-full ${index === i ? 'w-10' : 'w-4 bg-white/20'}`}
                                    style={{ backgroundColor: index === i ? SLIDES[index].color : '' }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* RESULTADOS DE BÚSQUEDA */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            {filteredProducts.map((p) => (
                                <motion.div
                                    key={p.ProductId}
                                    whileHover={{ y: -5 }}
                                    className="bg-white/90 backdrop-blur-lg p-3 rounded-xl shadow-2xl cursor-pointer"
                                    onClick={() => navigate(`/product/${p.ProductId}`)}
                                >
                                    <div className="h-32 w-full bg-gray-50 rounded-lg mb-3 overflow-hidden">
                                        {p.imagenes?.[0] && <img src={p.imagenes[0]} className="w-full h-full object-cover" alt={p.nombre} />}
                                    </div>
                                    <p className="font-bold text-sm" style={{ color: SLIDES[index].color }}>{formatPrice(p.precio)}</p>
                                    <p className="text-[10px] text-gray-500 uppercase truncate font-bold">{p.nombre}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* SCROLL ICON */}
            {!showResults && (
                <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30" animate={controls}>
                    <FontAwesomeIcon icon={faAngleDown} />
                </motion.div>
            )}
        </div>
    );
};

export default Hero;