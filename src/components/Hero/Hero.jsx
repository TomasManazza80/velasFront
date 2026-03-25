import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronLeft, faChevronRight, faCartPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';

// Importamos tus imágenes (asumiendo que mantienes las rutas)


// Estilo de carga para el esqueleto
const SkeletonCard = () => (
    <div className="h-[300px] md:h-[400px] bg-gray-100 rounded-[2rem] animate-pulse" />
);

const optimizeImage = (url) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.includes('imagekit.io')) {
        return `${url}?tr=w-500,f-webp,q-80`;
    }
    if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', '/upload/w_500,f_webp,q_auto/');
    }
    return url;
};

const LuStyles = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lato:wght@300;400&family=Montserrat:wght@300;400;500&display=swap');
.lu-title { font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.15em; }
.lu-body { font-family: 'Lato', sans-serif; font-weight: 300; }
.lu-script { font-family: 'Great Vibes', cursive; font-size: 2.5rem; color: #cba394; }
`;

const Hero = () => {
    const [index, setIndex] = useState(0);
    const [slides, setSlides] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const heroRef = useRef(null);

    // 1. Obtener contenido del CMS para el Hero
    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/hero-slider`);
                const heroItems = res.data;

                if (heroItems && heroItems.length > 0) {
                    setSlides(heroItems);
                } else {
                    // Fallback
                    setSlides([{ id: 0, title: "LUPETRUCCELLI", subtitle: "Handmade Candle", label: "BOUTIQUE", image: "" }]);
                }
            } catch (error) {
                console.error("Error fetching CMS content", error);
            }
        };
        fetchCMS();
    }, [API_URL]);

    // 2. Obtener productos para el grid
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const res = await axios.get(`${API_URL}/products?limit=16`);
                setProducts(res.data.products || res.data || []);
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, [API_URL]);

    // Navegación del carrusel
    const nextSlide = useCallback(() => {
        if (slides.length === 0) return;
        setIndex((prev) => (prev + 1) % slides.length);
    }, [slides]);

    const prevSlide = useCallback(() => {
        if (slides.length === 0) return;
        setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides]);

    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [nextSlide, index]);

    // Parallax suave para la imagen de fondo
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch.trim() === "") {
            setFilteredProducts([]);
            setShowResults(false);
            return;
        }
        axios.get(`${API_URL}/products?search=${debouncedSearch}&limit=16`)
            .then((res) => {
                setFilteredProducts(res.data.products || res.data || []);
                setShowResults(true);
            })
            .catch(err => console.log(err));
    }, [debouncedSearch, API_URL]);

    const formatPrice = (price) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price).replace('ARS', '$');

    return (
        <div className="relative w-full">
            <div ref={heroRef} className="relative w-full h-[85vh] md:h-[90vh] flex items-center overflow-hidden bg-[#F9F7F2]">
                <style dangerouslySetInnerHTML={{ __html: LuStyles }} />

                {/* 1. LAYOUT DIVIDIDO (Inspirado en la foto) */}
                <div className="flex w-full h-full flex-col md:flex-row">

                    {/* LADO IZQUIERDO: TEXTO */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center p-10 z-10 bg-white md:bg-transparent">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={slides[index]?.id || 'empty'}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.8 }}
                            >
                                <span className="text-[10px] tracking-[0.5em] text-gray-400 mb-6 block uppercase font-medium">
                                    {slides[index]?.label}
                                </span>
                                <h1 className="text-4xl md:text-7xl font-serif text-[#1a1a1a] mb-2 tracking-tighter">
                                    {slides[index]?.title}
                                </h1>
                                <p className="text-lg md:text-xl font-light text-gray-500 italic mb-10">
                                    {slides[index]?.subtitle}
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="px-10 py-3 bg-[#e0d7cc] text-[#5a4d40] text-xs tracking-[0.2em] uppercase font-bold hover:bg-[#d4c8ba] transition-colors"
                                >
                                    SHOP NOW
                                </motion.button>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* LADO DERECHO: IMAGEN */}
                    <div className="w-full md:w-1/2 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={slides[index]?.id || 'empty-img'}
                                className="absolute inset-0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                style={{ y: yBg }}
                            >
                                <img
                                    src={slides[index]?.image}
                                    alt="Candle"
                                    className="w-full h-full object-cover"
                                    style={{ objectPosition: slides[index]?.position || 'center' }}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>


                <div className="mt-[-200px] absolute top-1/2 left-0 w-[120%] -translate-x-[5%] -translate-y-1/2 pointer-events-none z-20 overflow-visible rotate-[-1deg]">
                    <svg viewBox="0 0 1000 150" className="w-full overflow-visible">
                        {/* Definición del camino de la onda */}
                        <path
                            id="wavePath"
                            d="M0,80 C150,20 350,140 500,80 C650,20 850,140 1000,80"
                            fill="none"
                        />

                        {/* LA CINTA: Ahora es un trazo grueso que sigue el path exactamente */}
                        <use
                            href="#wavePath"
                            stroke="#e0d7cc"
                            strokeWidth="50"
                            fill="none"
                            className="opacity-80"
                            strokeLinecap="round"
                        />

                        {/* EL TEXTO: Flota perfectamente sobre la cinta curva */}
                        <text className="text-[13px] uppercase tracking-[0.25em] font-serif fill-[#5a4d40]">
                            <textPath href="#wavePath" startOffset="0%">
                                Our best sellers - Gentle scents - Discover our new products - Our best sellers - Gentle scents - Discover our new products
                                <animate
                                    attributeName="startOffset"
                                    from="0%"
                                    to="-50%"
                                    dur="25s"
                                    repeatCount="indefinite"
                                />
                            </textPath>
                        </text>
                    </svg>
                </div>


                {/* 2. CINTA ONDEANTE ORGÁNICA */}
                <div className="mt-[200px] absolute top-1/2 left-0 w-[120%] -translate-x-[5%] -translate-y-1/2 pointer-events-none z-20 overflow-visible rotate-[-1deg]">
                    <svg viewBox="0 0 1000 150" className="w-full overflow-visible">
                        {/* Definición del camino de la onda */}
                        <path
                            id="wavePath"
                            d="M0,80 C150,20 350,140 500,80 C650,20 850,140 1000,80"
                            fill="none"
                        />

                        {/* LA CINTA: Ahora es un trazo grueso que sigue el path exactamente */}
                        <use
                            href="#wavePath"
                            stroke="#e0d7cc"
                            strokeWidth="50"
                            fill="none"
                            className="opacity-80"
                            strokeLinecap="round"
                        />

                        {/* EL TEXTO: Flota perfectamente sobre la cinta curva */}
                        <text className="text-[13px] uppercase tracking-[0.25em] font-serif fill-[#5a4d40]">
                            <textPath href="#wavePath" startOffset="0%">
                                Our best sellers - Gentle scents - Discover our new products - Our best sellers - Gentle scents - Discover our new products
                                <animate
                                    attributeName="startOffset"
                                    from="0%"
                                    to="-50%"
                                    dur="25s"
                                    repeatCount="indefinite"
                                />
                            </textPath>
                        </text>
                    </svg>
                </div>

                {/* 3. SEARCH BAR (Estilo Minimalista) */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-30">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="BUSCAR AROMA..."
                            className="w-full py-4 text-center text-[10px] tracking-[0.3em] uppercase bg-white/80 backdrop-blur-md border border-[#e0d7cc] rounded-none focus:outline-none focus:border-[#8b5e3c] transition-all placeholder-gray-400 text-gray-700 font-medium"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                if (e.target.value === "") setShowResults(false);
                            }}
                        />
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-gray-300 text-xs" />
                        </div>

                        <AnimatePresence>
                            {showResults && filteredProducts.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 bg-white border border-[#e0d7cc] shadow-2xl max-h-80 overflow-y-auto z-50 rounded-b-xl"
                                >
                                    {filteredProducts.map((prod) => {
                                        const totalStock = prod.variantes?.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0) || 0;
                                        const isAvailable = totalStock > 0;
                                        return (
                                            <Link to={`/product/${prod.id}`} key={prod.id} className="relative flex items-center gap-5 p-5 hover:bg-[#F9F7F2] transition-colors border-b border-gray-100 last:border-none group min-w-0 pr-16">
                                                <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
                                                    <img src={optimizeImage(prod.imagenes?.[0] || prod.image)} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <h4 className="lu-title text-[11px] font-bold text-[#333333] truncate mb-0.5">{prod.nombre}</h4>
                                                    <p className="lu-body text-[10px] text-gray-400 tracking-[0.1em] uppercase mb-1">{prod.marca || 'LU PETRUCCELLI'}</p>
                                                    {prod.variantes && prod.variantes.some(v => Number(v.precioAlPublico) > 0) && (
                                                        <div className="lu-title text-[12px] text-[#b07d6b] font-bold">
                                                            ${Math.min(...prod.variantes.map(v => Number(v.precioAlPublico) || 0).filter(p => p > 0)).toLocaleString('es-AR')}
                                                        </div>
                                                    )}
                                                </div>
                                                {isAvailable ? (
                                                    <div
                                                        className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#333333] text-white rounded-full flex justify-center items-center shadow-md hover:bg-black transition-all flex-shrink-0 z-10"
                                                    >
                                                        <FontAwesomeIcon icon={faCartPlus} className="text-xs" />
                                                    </div>
                                                ) : (
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex justify-center items-center disabled z-10 opacity-60">
                                                        <FontAwesomeIcon icon={faCartPlus} className="text-xs" />
                                                    </div>
                                                )}
                                            </Link>
                                        )
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* FLECHAS DE NAVEGACIÓN */}
                <button onClick={prevSlide} className="absolute left-6 z-40 text-gray-300 hover:text-gray-600 transition-colors hidden md:block">
                    <FontAwesomeIcon icon={faChevronLeft} size="lg" />
                </button>
                <button onClick={nextSlide} className="absolute right-6 z-40 text-gray-300 hover:text-gray-600 transition-colors hidden md:block">
                    <FontAwesomeIcon icon={faChevronRight} size="lg" />
                </button>
            </div>

            {/* SECTION: PRODUCT GRID - NEW */}
            <div className="relative w-full bg-white pt-24 pb-32">
                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    <div className="text-center mb-16">
                        <span className="lu-script block mb-2 text-[#cba394]">Novedades</span>
                        <h2 className="lu-title text-2xl md:text-4xl text-[#333333] tracking-[0.15em]">Nuestros Productos</h2>
                    </div>

                    {loadingProducts ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-[450px] bg-[#f9f3f2] rounded-sm animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                            {products.map((product) => {
                                const stockVariant = product.variantes?.find(v => Number(v.stock) > 0) || (product.variantes?.length > 0 ? product.variantes[0] : null);
                                const price = stockVariant?.precioAlPublico || product.precioVenta || 0;
                                const totalStock = product.variantes?.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0) || 0;
                                const isAvailable = totalStock > 0;

                                return (
                                    <Link to={`/product/${product.id}`} key={product.id} className="block group h-full">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            className="lu-card h-full flex flex-col relative overflow-hidden rounded-[2rem]"
                                        >
                                            {/* ÁREA SUPERIOR: IMAGEN FULL COVER */}
                                            <div className="relative w-full aspect-square bg-[#ffffff] overflow-hidden">
                                                {/* Imagen Principal */}
                                                <img
                                                    src={optimizeImage(product.imagenes?.[0] || product.image)}
                                                    alt={product.nombre}
                                                    loading="lazy"
                                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />

                                                {/* Overlay superior (Badges y Corazón) */}
                                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                                    <div className="flex items-center">
                                                        {!isAvailable ? (
                                                            <span className="bg-[#f9f3f2] text-[#b07d6b] text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Agotado</span>
                                                        ) : (
                                                            <>
                                                                <span className="bg-white/90 backdrop-blur-sm text-[#333333] text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full shadow-sm">-50%</span>
                                                                <span className="bg-white/90 backdrop-blur-sm text-[#b07d6b] text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full shadow-sm ml-2 hidden xs:block">Bestseller</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                        className="bg-white/70 backdrop-blur-sm p-2 rounded-full text-gray-400 hover:text-red-400 transition-colors shadow-sm"
                                                    >
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                                    </button>
                                                </div>

                                                {/* Overlay Inferior (Colores) */}
                                                <div className="absolute bottom-5 left-5 flex items-center z-10 transition-opacity duration-300 group-hover:opacity-0">
                                                    <div className="flex items-center bg-white/70 backdrop-blur-md p-1.5 rounded-full shadow-sm">
                                                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#fcd34d] border-2 border-white z-30"></div>
                                                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#333333] border-2 border-white -ml-1.5 z-20"></div>
                                                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#93c5fd] border-2 border-white -ml-1.5 z-10"></div>
                                                        <span className="text-[9px] sm:text-[10px] text-[#333333] font-medium ml-1.5 px-1">+5</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* ÁREA INFERIOR: TEXTOS Y PRECIOS */}
                                            <div className="flex flex-col px-5 sm:px-6 pt-6 pb-8 bg-[#f9f3f2] flex-1 justify-between">
                                                <div>
                                                    <span className="lu-title text-[9px] text-[#999999] mb-1">{product.categoria || 'Colección'}</span>
                                                    <h3 className="lu-title text-[13px] text-[#333333] font-bold tracking-tight leading-tight truncate mt-1">{product.nombre}</h3>
                                                    <p className="lu-body text-[11px] text-[#999999] mt-1 truncate w-full">{product.marca || 'LuPetruccelli'}</p>
                                                </div>

                                                <div className="flex items-baseline gap-2 mt-4 pr-12">
                                                    <span className="lu-title text-lg sm:text-xl font-bold text-[#333333]">{formatPrice(price)}</span>
                                                    <span className="text-xs text-[#999999] line-through font-medium">{formatPrice(price * 1.5)}</span>
                                                </div>
                                            </div>

                                            {/* Botón Acción - Posición fija absoluta en la CARD para simetría visual */}
                                            {isAvailable ? (
                                                <div
                                                    className="absolute bottom-6 right-6 w-11 h-11 bg-[#333333] text-white rounded-full flex justify-center items-center shadow-lg hover:bg-black transition-all z-30 hover:scale-110"
                                                    aria-label="Agregar al carrito"
                                                >
                                                    <FontAwesomeIcon icon={faCartPlus} className="text-sm" />
                                                </div>
                                            ) : (
                                                <div className="absolute bottom-6 right-6 w-11 h-11 bg-gray-100 text-gray-400 rounded-full flex justify-center items-center disabled z-30 opacity-60">
                                                    <FontAwesomeIcon icon={faCartPlus} className="text-sm" />
                                                </div>
                                            )}
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Hero;