import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMobileScreenButton,
    faTabletScreenButton,
    faPlug,
    faHeadphones,
    faChargingStation,
    faGlassWater,
    faCartPlus,
    faSearch,
    faFilter,
    faXmark,
    faBoxOpen,
    faInfoCircle,
    faGamepad,
    faVolumeHigh,
    faBolt,
    faGift,
    faHeart,
    faChild,
    faEllipsis
} from "@fortawesome/free-solid-svg-icons";
import { FiPlusCircle } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const optimizeImage = (url) => {
    if (!url) return "https://via.placeholder.com/300?text=No+Image";
    if (url.includes('imagekit.io')) {
        return `${url}?tr=w-500,f-webp,q-80`;
    }
    if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', '/upload/w_500,f_webp,q_auto/');
    }
    return url;
};

// =================================================================
// ESTILOS LU: MINIMALIST LUXURY
// =================================================================
const LuWholesaleStyles = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lato:wght@300;400&family=Montserrat:wght@300;400;500&display=swap');

.lu-title { font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 300; }
.lu-body { font-family: 'Lato', sans-serif; font-weight: 300; }
.lu-script { font-family: 'Great Vibes', cursive; font-size: 2.5rem; color: #cba394; }

.lu-card {
    background-color: #f9f3f2;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.lu-card:hover {
    box-shadow: 0 15px 40px rgba(203, 163, 148, 0.15);
    transform: translateY(-4px);
}

.lu-gradient-btn {
    background: linear-gradient(135deg, #cba394 0%, #b07d6b 100%);
    transition: opacity 0.3s ease;
}

.lu-gradient-btn:hover {
    opacity: 0.9;
}

.lu-input {
    background-color: #ffffff;
    border: 1px solid rgba(203, 163, 148, 0.2);
    color: #333333;
    transition: all 0.3s ease;
}

.lu-input:focus {
    border-color: #cba394;
    outline: none;
    box-shadow: 0 0 15px rgba(203, 163, 148, 0.1);
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
`;

const ResellersModule = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [activeCategory, setActiveCategory] = useState("todos");
    const [categories, setCategories] = useState([]);
    const [wholesaleConfig, setWholesaleConfig] = useState(null);
    const [likedProducts, setLikedProducts] = useState([]);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Paginación
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Cargar likes desde localStorage
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

    const categoryIconMap = useMemo(() => ({
        "CELULARES": faMobileScreenButton,
        "FUNDAS": faTabletScreenButton,
        "CARGADORES": faPlug,
        "ADAPTADORES": faBolt,
        "MANDOS DE CONSOLAS": faGamepad,
        "COMBOS": faBoxOpen,
        "AURICULARES": faHeadphones,
        "PARLANTES": faVolumeHigh,
        "TERMOS": faGlassWater,
        "JUGUETES": faGamepad,
        "OTROS": faEllipsis,
        "PROMO NAVIDAD": faGift,
        "PROMO DÍA DEL PADRE": faHeart,
        "PROMO DÍA DE LA MADRE": faHeart,
        "PROMO DÍA DEL NIÑO": faChild,
    }), []);

    useEffect(() => {
        const fetchInitialConfig = async () => {
            try {
                const [configRes, categoriesRes] = await Promise.all([
                    axios.get(`${API_URL}/gastos/global-configs`),
                    axios.get(`${API_URL}/api/categories`)
                ]);

                const globalConfigs = configRes.data || [];
                const cartTotalMinConf = globalConfigs.find(c => c.key === 'wholesale_cart_total_min');
                const productQtyMinConf = globalConfigs.find(c => c.key === 'wholesale_product_qty_min');

                setWholesaleConfig({
                    cartTotalMin: cartTotalMinConf ? parseFloat(cartTotalMinConf.value) : 0,
                    productQtyMin: productQtyMinConf ? parseFloat(productQtyMinConf.value) : 0,
                });

                const fetchedCategories = categoriesRes.data || [];
                const dynamicCategories = fetchedCategories.map(cat => ({
                    id: cat.categoryName,
                    label: cat.categoryName,
                    icon: categoryIconMap[cat.categoryName.toUpperCase()] || faBoxOpen
                }));
                setCategories(dynamicCategories);
            } catch (err) {
                console.error("Error al cargar configuraciones", err);
            }
        };
        fetchInitialConfig();
    }, [categoryIconMap]);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset page on new search
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchProducts = useCallback(async (currentPage, searchQuery) => {
        try {
            if (currentPage === 1) setLoading(true);
            else setIsLoadingMore(true);

            const limit = 20;
            const url = `${API_URL}/products?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchQuery || '')}`;
            const { data } = await axios.get(url);

            const fetchedProducts = data.products || data;

            // FIltrar mayoristas solo del set cargado
            const reselProducts = fetchedProducts.filter(p =>
                p.variantes && p.variantes.some(v => v.precioMayorista && v.precioMayorista > 0)
            );

            if (currentPage === 1) {
                setProducts(reselProducts);
            } else {
                setProducts(prev => [...prev, ...reselProducts]);
            }

            if (data.totalPages !== undefined) {
                setHasMore(currentPage < data.totalPages);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Error al cargar productos", err);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(page, debouncedSearch);
    }, [page, debouncedSearch, fetchProducts]);

    const getMinWholesalePrice = (product) => {
        if (!product.variantes || product.variantes.length === 0) return 0;
        const prices = product.variantes
            .map(v => Number(v.precioMayorista) || 0)
            .filter(p => p > 0);
        return prices.length > 0 ? Math.min(...prices) : 0;
    };

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const price = getMinWholesalePrice(p);

            let matchesSearch = true;
            const matchesCategory = activeCategory === "todos" || p.categoria === activeCategory;
            const matchesMinPrice = minPrice === "" || price >= parseFloat(minPrice);
            const matchesMaxPrice = maxPrice === "" || price <= parseFloat(maxPrice);

            return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
        });
    }, [products, searchTerm, debouncedSearch, activeCategory, minPrice, maxPrice]);

    const resetFilters = () => {
        setSearchTerm("");
        setMinPrice("");
        setMaxPrice("");
        setActiveCategory("todos");
    };

    if (loading && page === 1) return (
        <div className="flex h-screen items-center justify-center bg-[#ffffff]">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#cba394] border-t-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#ffffff] text-[#333333] lu-body pb-24">
            <style dangerouslySetInnerHTML={{ __html: LuWholesaleStyles }} />

            {/* Header / Hero */}
            <section className="bg-[#f9f3f2] py-20 text-center relative overflow-hidden">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 px-4">
                    <span className="lu-script block mb-2">Exclusivo</span>
                    <h1 className="lu-title text-3xl md:text-5xl text-[#333333] leading-tight mb-4">
                        PORTAL MAYORISTA
                    </h1>
                    <p className="lu-title text-[10px] text-[#999999] tracking-[0.3em]">
                        LuPetruccelli Boutique | Acceso Exclusivo
                    </p>

                    <div className="flex items-center justify-center mt-8 gap-4">
                        <div className="h-[1px] w-12 bg-[#cba394]/40"></div>
                        <div className="w-2 h-2 rotate-45 border border-[#cba394]"></div>
                        <div className="h-[1px] w-12 bg-[#cba394]/40"></div>
                    </div>
                </motion.div>

                {wholesaleConfig && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative z-10 mx-auto mt-12 max-w-2xl bg-[#ffffff] border border-[#cba394]/20 rounded-sm p-8 shadow-sm text-center"
                    >
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="flex items-center gap-2 text-[#cba394]">
                                <FontAwesomeIcon icon={faInfoCircle} />
                                <span className="lu-title text-[11px]">Condiciones de Compra</span>
                            </div>
                            <p className="lu-body text-[13px] text-[#333333]">
                                Para acceder a los precios exclusivos, tu pedido debe cumplir al menos una de estas condiciones:
                            </p>
                            <div className="flex flex-wrap justify-center gap-6 mt-4">
                                <span className="text-[#b07d6b] lu-title text-[10px] flex flex-col items-center">
                                    <span className="text-[#999999] mb-1">Mínimo Global</span>
                                    ${Number(wholesaleConfig.cartTotalMin).toLocaleString('es-AR')}
                                </span>
                                <div className="w-[1px] h-8 bg-[#cba394]/20"></div>
                                <span className="text-[#b07d6b] lu-title text-[10px] flex flex-col items-center">
                                    <span className="text-[#999999] mb-1">Volumen Mínimo</span>
                                    {wholesaleConfig.productQtyMin} Unidades
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </section>

            {/* Toolbar de Filtros y Buscador */}
            <div className="sticky top-[80px] z-40 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#f9f3f2] py-4">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        {/* Buscador */}
                        <div className="flex gap-4 w-full lg:w-auto flex-1 max-w-md">
                            <div className="relative flex-1 group">
                                <span className="absolute inset-y-0 left-5 flex items-center text-[#cba394]">
                                    <FontAwesomeIcon icon={faSearch} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="BUSCAR PRODUCTO..."
                                    className="lu-input w-full py-4 pl-14 pr-6 rounded-sm text-center lu-title text-[10px] tracking-[0.2em] focus:outline-none placeholder-[#999999]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            setDebouncedSearch(searchTerm);
                                            setPage(1);
                                        }
                                    }}
                                />
                            </div>
                            <button
                                className="lg:hidden flex items-center justify-center px-6 border border-[#cba394]/30 text-[#cba394] rounded-sm hover:bg-[#cba394] hover:text-white transition-colors"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <FontAwesomeIcon icon={faFilter} />
                            </button>
                        </div>

                        {/* Filtros de Precio */}
                        <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex items-center gap-6`}>
                            <div className="flex items-center gap-3">
                                <span className="lu-title text-[9px] text-[#999999]">PRECIO</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="lu-input w-24 py-3 text-center lu-body text-[12px] rounded-sm focus:outline-none"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                                <span className="text-[#999999]">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="lu-input w-24 py-3 text-center lu-body text-[12px] rounded-sm focus:outline-none"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>

                            {(searchTerm || minPrice || maxPrice || activeCategory !== "todos") && (
                                <button
                                    onClick={resetFilters}
                                    className="text-[#b07d6b] hover:text-[#333333] transition-colors lu-title text-[10px] flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faXmark} /> LIMPIAR
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categorías */}
                    <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex mt-8 items-center gap-8 overflow-x-auto no-scrollbar pb-2`}>
                        <button
                            onClick={() => setActiveCategory("todos")}
                            className={`whitespace-nowrap pb-1 lu-title text-[10px] transition-all border-b ${activeCategory === "todos" ? "text-[#b07d6b] border-[#b07d6b]" : "text-[#999999] border-transparent hover:text-[#b07d6b]"}`}
                        >
                            Colección Completa
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 whitespace-nowrap pb-1 lu-title text-[10px] transition-all border-b ${activeCategory === cat.id ? "text-[#b07d6b] border-[#b07d6b]" : "text-[#999999] border-transparent hover:text-[#b07d6b]"}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Listado de Productos */}
            <main className="mx-auto max-w-7xl px-6 lg:px-12 py-16">
                {filteredProducts.length > 0 ? (
                    <div className="flex flex-col gap-16">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                            <AnimatePresence>
                                {filteredProducts.map((product) => {
                                    const minWholesale = getMinWholesalePrice(product);
                                    const totalStock = product.variantes?.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0) || 0;
                                    const isAvailable = totalStock > 0;

                                    return (
                                        <Link to={`/product/${product.id}`} key={product.id} className="block group h-full">
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
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

                                                    {/* Overlay superior (Badges) */}
                                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                                        <div className="flex items-center">
                                                            {!isAvailable ? (
                                                                <span className="bg-[#f9f3f2] text-[#b07d6b] text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Agotado</span>
                                                            ) : (
                                                                <>
                                                                    {product.aplicarMayoristaPorCantidad && (
                                                                        <span className="bg-white/90 backdrop-blur-sm text-[#cba394] text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full shadow-sm">X Cantidad</span>
                                                                    )}
                                                                    <span className="bg-white/90 backdrop-blur-sm text-[#b07d6b] text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full shadow-sm ml-2 hidden xs:block">Mayorista</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {(() => {
                                                            const isLiked = likedProducts.includes(product.id);
                                                            return (
                                                                <button
                                                                    onClick={(e) => handleToggleLike(e, product.id)}
                                                                    className={`bg-white/70 backdrop-blur-sm p-1.5 rounded-full transition-colors shadow-sm ml-auto ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                                                                >
                                                                    <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                                                </button>
                                                            );
                                                        })()}
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
                                                        <span className="lu-title text-lg sm:text-xl font-bold text-[#333333]">${minWholesale.toLocaleString('es-AR')}</span>
                                                        <span className="text-[10px] text-[#999999] font-medium uppercase tracking-wider italic">P. Mayorista</span>
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
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                        {hasMore && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={isLoadingMore}
                                    className="lu-gradient-btn text-white px-10 py-4 lu-title text-[11px] shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-4 rounded-sm"
                                >
                                    {isLoadingMore ? "CARGANDO..." : (
                                        <>
                                            <FiPlusCircle className="text-lg font-light" />
                                            DESCUBRIR MÁS PRODUCTOS
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="mb-6 flex items-center justify-center text-[#cba394]/30">
                            <FontAwesomeIcon icon={faFilter} size="3x" />
                        </div>
                        <h3 className="lu-title text-lg text-[#333333] mb-2">No se encontraron productos</h3>
                        <p className="lu-body text-sm text-[#999999] mb-8">Intenta ajustar los filtros de búsqueda</p>
                        <button
                            onClick={resetFilters}
                            className="text-[#b07d6b] lu-title text-[10px] border-b border-[#b07d6b] pb-1 hover:text-[#333333] hover:border-[#333333] transition-colors"
                        >
                            RESTABLECER BÚSQUEDA
                        </button>
                    </div>
                )}
            </main >

            <footer className="border-t border-[#f9f3f2] bg-[#ffffff] py-16 text-center">
                <p className="lu-title text-[9px] text-[#999999]">
                    LUPETRUCCELLI BOUTIQUE MAYORISTA &copy; 2026
                </p>
            </footer>
        </div >
    );
};

export default ResellersModule;