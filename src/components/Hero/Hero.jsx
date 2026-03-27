import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronLeft, faChevronRight, faCartPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';

// Estilo de carga para el esqueleto
const SkeletonCard = () => (
    <div className="h-[150px] sm:h-[400px] lg:h-[450px] bg-gray-100 rounded-xl sm:rounded-[2rem] animate-pulse" />
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
.lu-script { font-family: 'Great Vibes', cursive; font-size: clamp(2rem, 4vw, 2.5rem); color: #cba394; }
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
    const [likedProducts, setLikedProducts] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL;

    // Cargar likes desde localStorage al montar
    useEffect(() => {
        const savedLikes = JSON.parse(localStorage.getItem('lu_liked_products')) || [];
        setLikedProducts(savedLikes);
    }, []);

    const handleToggleLike = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();

        const isLiked = likedProducts.includes(productId);
        let updatedLikes;

        if (isLiked) {
            updatedLikes = likedProducts.filter(id => id !== productId);
        } else {
            updatedLikes = [...likedProducts, productId];
        }

        setLikedProducts(updatedLikes);
        localStorage.setItem('lu_liked_products', JSON.stringify(updatedLikes));

        try {
            await axios.patch(`${API_URL}/products/${productId}/like`, { isIncrement: !isLiked });
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };
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
        <div className="relative w-full overflow-hidden">

            {/* WRAPPER PRINCIPAL: Define la altura pero permite superposiciones (sin overflow-hidden) */}
            <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[90vh]">

                {/* HERO CONTAINER: Encapsula imágenes y vectores (con overflow-hidden para recortarlos) */}
                <div ref={heroRef} className="absolute inset-0 flex items-center overflow-hidden bg-[#F9F7F2]">
                    <style dangerouslySetInnerHTML={{ __html: LuStyles }} />

                    {/* 1. LAYOUT HERO */}
                    <div className="relative flex w-full h-full flex-col md:flex-row">
                        {/* IMAGEN: Fondo absoluto en móvil, Mitad derecha estática en PC */}
                        <div className="absolute inset-0 md:relative md:w-1/2 h-full overflow-hidden flex-shrink-0 z-0 bg-[#F9F7F2]">
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

                        {/* TEXTO: Superpuesto con Blur en móvil, Mitad izquierda estática en PC */}
                        <div className="relative z-10 w-full md:w-1/2 h-full flex flex-col justify-center items-center text-center px-4 sm:px-10 z-10 bg-white/40 backdrop-blur-md md:bg-transparent md:backdrop-blur-none md:order-first">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={slides[index]?.id || 'empty'}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.8 }}
                                    className="w-full max-w-lg"
                                >
                                    <span className="text-[10px] sm:text-xs md:text-xs tracking-[0.3em] md:tracking-[0.5em] text-gray-700 md:text-gray-400 mb-2 md:mb-6 block uppercase font-medium">
                                        {slides[index]?.label}
                                    </span>
                                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-[#1a1a1a] mb-2 md:mb-4 tracking-tighter leading-tight drop-shadow-sm md:drop-shadow-none">
                                        {slides[index]?.title}
                                    </h1>
                                    <p className="text-sm sm:text-base md:text-xl font-light text-gray-800 md:text-gray-500 italic mb-6 md:mb-10 font-medium md:font-light">
                                        {slides[index]?.subtitle}
                                    </p>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        className="px-6 py-3 sm:px-10 sm:py-3.5 md:py-4 bg-[#e0d7cc] text-[#5a4d40] text-[9px] sm:text-xs md:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold hover:bg-[#d4c8ba] transition-colors shadow-md md:shadow-none"
                                    >
                                        SHOP NOW
                                    </motion.button>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* 2. CINTA ONDEANTE 1 */}
                    <div className="mt-[-80px] sm:mt-[-60px] md:mt-[-200px] absolute top-1/2 left-0 w-[180%] sm:w-[150%] md:w-[120%] -translate-x-[5%] -translate-y-1/2 pointer-events-none z-20 overflow-visible rotate-[-1deg]">
                        <svg viewBox="0 0 1000 150" className="w-full overflow-visible">
                            <path id="wavePath1" d="M0,80 C150,20 350,140 500,80 C650,20 850,140 1000,80" fill="none" />
                            <use href="#wavePath1" stroke="#e0d7cc" strokeWidth="50" fill="none" className="opacity-90 md:opacity-80" strokeLinecap="round" />
                            <text className="text-[9px] sm:text-[10px] md:text-[13px] uppercase tracking-[0.15em] md:tracking-[0.25em] font-serif fill-[#5a4d40]">
                                <textPath href="#wavePath1" startOffset="0%">
                                    Our best sellers - Gentle scents - Discover our new products - Our best sellers - Gentle scents - Discover our new products
                                    <animate attributeName="startOffset" from="0%" to="-50%" dur="25s" repeatCount="indefinite" />
                                </textPath>
                            </text>
                        </svg>
                    </div>

                    {/* 3. CINTA ONDEANTE 2 */}
                    <div className="hidden md:block mt-[200px] absolute top-1/2 left-0 w-[120%] -translate-x-[5%] -translate-y-1/2 pointer-events-none z-20 overflow-visible rotate-[-1deg]">
                        <svg viewBox="0 0 1000 150" className="w-full overflow-visible">
                            <path id="wavePath2" d="M0,80 C150,20 350,140 500,80 C650,20 850,140 1000,80" fill="none" />
                            <use href="#wavePath2" stroke="#e0d7cc" strokeWidth="50" fill="none" className="opacity-80" strokeLinecap="round" />
                            <text className="text-[13px] uppercase tracking-[0.25em] font-serif fill-[#5a4d40]">
                                <textPath href="#wavePath2" startOffset="0%">
                                    Our best sellers - Gentle scents - Discover our new products - Our best sellers - Gentle scents - Discover our new products
                                    <animate attributeName="startOffset" from="0%" to="-50%" dur="25s" repeatCount="indefinite" />
                                </textPath>
                            </text>
                        </svg>
                    </div>

                    {/* FLECHAS DE NAVEGACIÓN */}
                    <button onClick={prevSlide} className="absolute left-2 md:left-6 z-40 text-gray-600 md:text-gray-300 hover:text-black md:hover:text-gray-600 transition-colors hidden md:block">
                        <FontAwesomeIcon icon={faChevronLeft} size="lg" />
                    </button>
                    <button onClick={nextSlide} className="absolute right-2 md:right-6 z-40 text-gray-600 md:text-gray-300 hover:text-black md:hover:text-gray-600 transition-colors hidden md:block">
                        <FontAwesomeIcon icon={faChevronRight} size="lg" />
                    </button>
                </div>

                {/* SEARCH BAR (Liberado del overflow-hidden y con z-[100] elevado) */}
                <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 w-[85%] md:w-full max-w-sm md:max-w-md px-2 md:px-6 z-[100]">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="BUSCAR AROMA..."
                            className="w-full py-3 md:py-4 text-center text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase bg-white/90 backdrop-blur-md border border-[#e0d7cc] rounded-none focus:outline-none focus:border-[#8b5e3c] transition-all placeholder-gray-500 md:placeholder-gray-400 text-gray-800 md:text-gray-700 font-medium shadow-lg md:shadow-none relative z-10"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                if (e.target.value === "") setShowResults(false);
                            }}
                        />
                        <div className="absolute inset-y-0 left-4 md:left-6 flex items-center pointer-events-none z-20">
                            <FontAwesomeIcon icon={faSearch} className="text-gray-400 md:text-gray-300 text-[10px] md:text-xs" />
                        </div>

                        <AnimatePresence>
                            {showResults && filteredProducts.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    // AQUI EL CAMBIO: max-h-72 en móviles (mucho más largo) y md:max-h-96 en escritorio
                                    className="absolute top-full left-0 right-0 bg-white border border-[#e0d7cc] shadow-2xl max-h-72 md:max-h-96 overflow-y-auto z-[110] rounded-b-xl"
                                >
                                    {filteredProducts.map((prod) => {
                                        const totalStock = prod.variantes?.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0) || 0;
                                        const isAvailable = totalStock > 0;
                                        return (
                                            <Link to={`/product/${prod.id}`} key={prod.id} className="relative flex items-center gap-3 md:gap-5 p-3 md:p-5 hover:bg-[#F9F7F2] transition-colors border-b border-gray-100 last:border-none group min-w-0 pr-12 md:pr-16">
                                                <div className="w-10 h-10 md:w-16 md:h-16 flex-shrink-0 overflow-hidden rounded-lg md:rounded-xl bg-gray-50">
                                                    <img src={optimizeImage(prod.imagenes?.[0] || prod.image)} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <h4 className="lu-title text-[9px] md:text-[11px] font-bold text-[#333333] truncate mb-0.5">{prod.nombre}</h4>
                                                    <p className="lu-body text-[8px] md:text-[10px] text-gray-400 tracking-[0.05em] md:tracking-[0.1em] uppercase mb-1 truncate">{prod.marca || 'LU PETRUCCELLI'}</p>
                                                    {prod.variantes && prod.variantes.some(v => Number(v.precioAlPublico) > 0) && (
                                                        <div className="lu-title text-[10px] md:text-[12px] text-[#b07d6b] font-bold">
                                                            ${Math.min(...prod.variantes.map(v => Number(v.precioAlPublico) || 0).filter(p => p > 0)).toLocaleString('es-AR')}
                                                        </div>
                                                    )}
                                                </div>
                                                {isAvailable ? (
                                                    <div className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-[#333333] text-white rounded-full flex justify-center items-center shadow-md hover:bg-black transition-all flex-shrink-0 z-10">
                                                        <FontAwesomeIcon icon={faCartPlus} className="text-[10px] md:text-xs" />
                                                    </div>
                                                ) : (
                                                    <div className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-gray-100 text-gray-400 rounded-full flex justify-center items-center disabled z-10 opacity-60">
                                                        <FontAwesomeIcon icon={faCartPlus} className="text-[10px] md:text-xs" />
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
            </div>

            {/* SECTION: PRODUCT GRID */}
            <div className="relative w-full bg-white pt-6 sm:pt-10 md:pt-24 pb-16 sm:pb-24 md:pb-32">
                <div className="container mx-auto px-2 sm:px-6 md:px-12 lg:px-24">
                    <div className="text-center mb-6 sm:mb-12 md:mb-16 mt-2">
                        <span className="lu-script block mb-1 sm:mb-2 text-[#cba394]">Novedades</span>
                        <h2 className="lu-title text-lg sm:text-2xl md:text-4xl text-[#333333] tracking-[0.1em] sm:tracking-[0.15em]">Nuestros Productos</h2>
                    </div>

                    {loadingProducts ? (
                        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 lg:gap-8 gap-y-6 sm:gap-y-12 lg:gap-y-16">
                            {[...Array(8)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 lg:gap-8 gap-y-6 sm:gap-y-12 lg:gap-y-16">
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
                                            className="lu-card h-full flex flex-col relative overflow-hidden rounded-xl sm:rounded-[2rem] shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="relative w-full aspect-square bg-[#ffffff] overflow-hidden">
                                                <img
                                                    src={optimizeImage(product.imagenes?.[0] || product.image)}
                                                    alt={product.nombre}
                                                    loading="lazy"
                                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />

                                                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-start z-10">
                                                    <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                                                        {!isAvailable ? (
                                                            <span className="bg-[#f9f3f2] text-[#b07d6b] text-[6px] sm:text-[10px] md:text-xs font-semibold px-1 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm">Agotado</span>
                                                        ) : (
                                                            <>
                                                                <span className="bg-white/90 backdrop-blur-sm text-[#333333] text-[6px] sm:text-[10px] md:text-xs font-semibold px-1 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm">-50%</span>
                                                                <span className="bg-white/90 backdrop-blur-sm text-[#b07d6b] text-[6px] sm:text-[10px] md:text-xs font-semibold px-1 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm hidden xs:block">Bestseller</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {(() => {
                                                        const isLiked = likedProducts.includes(product.id);
                                                        return (
                                                            <button
                                                                onClick={(e) => handleToggleLike(e, product.id)}
                                                                className={`bg-white/70 backdrop-blur-sm p-1 sm:p-2 rounded-full transition-colors shadow-sm ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                                                            >
                                                                <svg className="w-3 h-3 sm:w-5 sm:h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                                            </button>
                                                        );
                                                    })()}
                                                </div>

                                                <div className="hidden md:flex absolute bottom-4 sm:bottom-5 left-4 sm:left-5 items-center z-10 transition-opacity duration-300 group-hover:opacity-0">
                                                    <div className="flex items-center bg-white/70 backdrop-blur-md p-1 sm:p-1.5 rounded-full shadow-sm">
                                                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#fcd34d] border-2 border-white z-30"></div>
                                                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#333333] border-2 border-white -ml-1 sm:-ml-1.5 z-20"></div>
                                                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#93c5fd] border-2 border-white -ml-1 sm:-ml-1.5 z-10"></div>
                                                        <span className="text-[8px] sm:text-[10px] text-[#333333] font-medium ml-1 sm:ml-1.5 px-1">+5</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col px-2 sm:px-5 md:px-6 pt-2 sm:pt-6 pb-3 sm:pb-8 bg-[#f9f3f2] flex-1 justify-between">
                                                <div>
                                                    <span className="lu-title text-[6px] sm:text-[9px] text-[#999999] mb-0.5 block">{product.categoria || 'Colección'}</span>
                                                    <h3 className="lu-title text-[8px] sm:text-[12px] md:text-[13px] text-[#333333] font-bold tracking-tight leading-tight truncate mt-0.5">{product.nombre}</h3>
                                                    <p className="lu-body text-[7px] sm:text-[11px] text-[#999999] mt-0.5 truncate w-full">{product.marca || 'LuPetruccelli'}</p>
                                                </div>

                                                <div className="flex items-baseline gap-1 sm:gap-2 mt-2 sm:mt-4 pr-6 sm:pr-12">
                                                    <span className="lu-title text-[10px] sm:text-lg md:text-xl font-bold text-[#333333]">{formatPrice(price)}</span>
                                                    <span className="text-[7px] sm:text-xs text-[#999999] line-through font-medium">{formatPrice(price * 1.5)}</span>
                                                </div>
                                            </div>

                                            {isAvailable ? (
                                                <div
                                                    className="absolute bottom-2 right-2 sm:bottom-6 sm:right-6 w-6 h-6 sm:w-11 sm:h-11 bg-[#333333] text-white rounded-full flex justify-center items-center shadow-lg hover:bg-black transition-all z-30 hover:scale-110"
                                                    aria-label="Agregar al carrito"
                                                >
                                                    <FontAwesomeIcon icon={faCartPlus} className="text-[8px] sm:text-sm" />
                                                </div>
                                            ) : (
                                                <div className="absolute bottom-2 right-2 sm:bottom-6 sm:right-6 w-6 h-6 sm:w-11 sm:h-11 bg-gray-100 text-gray-400 rounded-full flex justify-center items-center disabled z-30 opacity-60">
                                                    <FontAwesomeIcon icon={faCartPlus} className="text-[8px] sm:text-sm" />
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