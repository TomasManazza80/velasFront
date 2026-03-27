import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, Link, useSearchParams } from "react-router-dom";
import { FiX, FiSearch, FiDollarSign, FiFilter, FiPlusCircle } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";

const API_URL = import.meta.env.VITE_API_URL;

const optimizeImage = (url) => {
    if (!url) return url;
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
const LuStyles = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lato:wght@300;400&family=Montserrat:wght@300;400;500&display=swap');

.lu-title { font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.15em; }
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

.lu-category {
    color: #999999;
    border-bottom: 1px solid transparent;
    transition: all 0.3s ease;
}

.lu-category.active {
    color: #b07d6b;
    border-bottom-color: #b07d6b;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
`;

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [sortOption, setSortOption] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [likedProducts, setLikedProducts] = useState([]);
    const [searchParams] = useSearchParams();

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

    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setCategory(categoryParam);
            setShowFilters(true); // Mostrar filtros si venimos de una categoría específica
        }
    }, [searchParams]);
    const availableCategories = [...new Set(products.map(p => p.categoria))].filter(Boolean).sort();
    const availableBrands = [...new Set(products.map(p => p.marca))].filter(Boolean).sort();

    const MAX_PREVIEW_RESULTS = 10;
    const previewProducts = search.length > 0 ? filteredProducts.slice(0, MAX_PREVIEW_RESULTS) : [];

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchProducts = useCallback(async (currentPage, searchQuery) => {
        try {
            if (currentPage === 1) setIsLoading(true);
            else setIsLoadingMore(true);

            const limit = 20;
            const url = `${API_URL}/products?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchQuery || '')}`;
            const { data } = await axios.get(url);

            const fetchedProducts = data.products || data;

            if (currentPage === 1) {
                setProducts(fetchedProducts);
            } else {
                setProducts(prev => [...prev, ...fetchedProducts]);
            }

            if (data.totalPages !== undefined) {
                setTotalPages(data.totalPages);
                setHasMore(currentPage < data.totalPages);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(page, debouncedSearch);
    }, [page, debouncedSearch, fetchProducts]);

    useEffect(() => {
        let filtered = products;

        if (category) filtered = filtered.filter(item => item.categoria.toLowerCase() === category.toLowerCase());
        if (brand) filtered = filtered.filter(item => item.marca && item.marca.toLowerCase() === brand.toLowerCase());
        if (minPrice) filtered = filtered.filter(item => {
            const stockVariant = item.variantes?.find(v => Number(v.stock) > 0) || (item.variantes?.length > 0 ? item.variantes[0] : null);
            const price = stockVariant?.precioAlPublico || item.precioVenta || 0;
            return parseFloat(price) >= parseFloat(minPrice);
        });
        if (maxPrice) filtered = filtered.filter(item => {
            const stockVariant = item.variantes?.find(v => Number(v.stock) > 0) || (item.variantes?.length > 0 ? item.variantes[0] : null);
            const price = stockVariant?.precioAlPublico || item.precioVenta || 0;
            return parseFloat(price) <= parseFloat(maxPrice);
        });

        if (sortOption === "price-asc") {
            filtered = [...filtered].sort((a, b) => {
                const priceA = a.variantes?.find(v => Number(v.stock) > 0)?.precioAlPublico || a.precioVenta || 0;
                const priceB = b.variantes?.find(v => Number(v.stock) > 0)?.precioAlPublico || b.precioVenta || 0;
                return parseFloat(priceA) - parseFloat(priceB);
            });
        }
        if (sortOption === "price-desc") {
            filtered = [...filtered].sort((a, b) => {
                const priceA = a.variantes?.find(v => Number(v.stock) > 0)?.precioAlPublico || a.precioVenta || 0;
                const priceB = b.variantes?.find(v => Number(v.stock) > 0)?.precioAlPublico || b.precioVenta || 0;
                return parseFloat(priceB) - parseFloat(priceA);
            });
        }

        setFilteredProducts(filtered);
    }, [search, category, brand, products, sortOption, minPrice, maxPrice, debouncedSearch]);

    const formatPrice = (price) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price).replace('ARS', '$');

    const resetFilters = () => {
        setSearch(""); setCategory(""); setBrand(""); setSortOption(""); setMinPrice(""); setMaxPrice("");
    };

    return (
        <div className="min-h-screen bg-[#ffffff] text-[#333333] lu-body pb-24 overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: LuStyles }} />
            <Outlet />

            <div>
                {/* HERO / HEADER SECTION */}
                <div className="pt-20 md:pt-32 pb-16 text-center px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <span className="lu-script block mb-2">Elegance</span>
                        <h1 className="lu-title text-3xl md:text-5xl text-[#333333] font-light tracking-[0.2em] leading-tight">
                            LUPETRUCCELLI
                        </h1>
                        <div className="flex items-center justify-center mt-8 gap-4">
                            <div className="h-[1px] w-12 bg-[#cba394]/40"></div>
                            <div className="w-2 h-2 rotate-45 border border-[#cba394]"></div>
                            <div className="h-[1px] w-12 bg-[#cba394]/40"></div>
                        </div>
                    </motion.div>
                </div>

                <div className="container mx-auto px-2 sm:px-6 md:px-12 lg:px-24">
                    {/* BARRA DE CONTROL Y BÚSQUEDA */}
                    <div className="bg-[#f9f3f2] p-6 md:p-12 mb-10 md:mb-16 rounded-sm shadow-sm relative z-[100]">
                        <div className="flex flex-col gap-6 md:gap-8">
                            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch lg:items-center">
                                <div className="flex gap-4 w-full lg:w-auto flex-grow relative z-[100]">
                                    <div className="relative flex-grow group z-[100]">
                                        <FiSearch className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-[#cba394] text-sm md:text-lg z-20" />
                                        <input
                                            type="text"
                                            placeholder="Buscar fragancia o producto..."
                                            className="lu-input w-full pl-10 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 rounded-sm lu-body text-[11px] md:text-[13px] tracking-wide relative z-10"
                                            onChange={(e) => setSearch(e.target.value)}
                                            value={search}
                                        />

                                        {/* RESULTADOS DESPLEGABLES */}
                                        <AnimatePresence>
                                            {search.trim() !== "" && previewProducts.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e0d7cc] shadow-2xl max-h-72 md:max-h-96 overflow-y-auto z-[110] rounded-b-xl"
                                                >
                                                    {previewProducts.map((prod) => {
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
                                    <button
                                        className="lg:hidden px-4 md:px-5 bg-[#ffffff] border border-[#cba394]/30 text-[#cba394] rounded-sm flex items-center justify-center hover:bg-[#cba394] hover:text-white transition-colors"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <FiFilter />
                                    </button>
                                </div>

                                <select
                                    className={`${showFilters ? 'block' : 'hidden'} lg:block lu-input px-4 md:px-6 py-3 md:py-4 rounded-sm lu-title text-[9px] md:text-[10px] w-full lg:w-auto min-w-[200px] cursor-pointer relative z-10`}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    value={sortOption}
                                >
                                    <option value="">ORDENAR POR</option>
                                    <option value="price-asc">PRECIO: MENOR A MAYOR</option>
                                    <option value="price-desc">PRECIO: MAYOR A MENOR</option>
                                </select>
                            </div>

                            {/* FILTROS ADICIONALES */}
                            <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 pt-4 md:pt-6 border-t border-[#cba394]/20`}>
                                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-start">
                                    <span className="lu-title text-[10px] text-[#999999] hidden md:inline">PRECIO</span>
                                    <div className="relative flex items-center flex-1 md:flex-none">
                                        <FiDollarSign className="absolute left-3 md:left-4 text-[#cba394] text-xs md:text-sm" />
                                        <input type="number" placeholder="Min" className="lu-input pl-7 md:pl-9 pr-2 md:pr-4 py-2 md:py-3 w-full md:w-32 rounded-sm lu-body text-[11px] md:text-[13px]" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                                    </div>
                                    <div className="h-[1px] w-2 md:w-4 bg-[#999999]/30"></div>
                                    <div className="relative flex items-center flex-1 md:flex-none">
                                        <FiDollarSign className="absolute left-3 md:left-4 text-[#cba394] text-xs md:text-sm" />
                                        <input type="number" placeholder="Max" className="lu-input pl-7 md:pl-9 pr-2 md:pr-4 py-2 md:py-3 w-full md:w-32 rounded-sm lu-body text-[11px] md:text-[13px]" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                                    </div>
                                </div>

                                {(search || category || brand || sortOption || minPrice || maxPrice) && (
                                    <button onClick={resetFilters} className="text-[#b07d6b] hover:text-[#333333] transition-colors lu-title text-[9px] md:text-[10px] flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 md:py-3">
                                        <FiX /> LIMPIAR FILTROS
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`${showFilters ? 'grid' : 'hidden'} lg:grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-20 px-2 md:px-0`}>
                        {/* CATEGORÍAS */}
                        <div>
                            <h2 className="lu-title text-[10px] text-[#999999] mb-4 md:mb-6">COLECCIONES</h2>
                            <div className="flex flex-nowrap md:flex-wrap gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
                                {availableCategories.length > 0 ? availableCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(category === cat ? "" : cat)}
                                        className={`lu-category pb-1 lu-title text-[9px] md:text-[11px] tracking-wider whitespace-nowrap ${category === cat ? 'active' : ''}`}
                                    >
                                        {cat}
                                    </button>
                                )) : <p className="text-[#999999] text-[11px] lu-body">No hay categorías disponibles</p>}
                            </div>
                        </div>

                        {/* MARCAS / LÍNEAS */}
                        <div>
                            <h2 className="lu-title text-[10px] text-[#999999] mb-4 md:mb-6">LÍNEA DE PRODUCTO</h2>
                            <div className="flex flex-nowrap md:flex-wrap gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
                                {availableBrands.length > 0 ? availableBrands.map((b) => (
                                    <button
                                        key={b}
                                        onClick={() => setBrand(brand === b ? "" : b)}
                                        className={`lu-category pb-1 lu-title text-[9px] md:text-[11px] tracking-wider whitespace-nowrap ${brand === b ? 'active' : ''}`}
                                    >
                                        {b}
                                    </button>
                                )) : <p className="text-[#999999] text-[11px] lu-body">No hay líneas detectadas</p>}
                            </div>
                        </div>
                    </div>

                    {/* GRID DE PRODUCTOS (3 COLUMNAS EN MÓVIL) */}
                    {isLoading ? (
                        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 lg:gap-8 gap-y-6 sm:gap-y-12 lg:gap-y-16">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="h-[150px] sm:h-[400px] lg:h-[450px] bg-[#f9f3f2] rounded-xl sm:rounded-[2rem] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-10 md:gap-20">
                            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 lg:gap-8 gap-y-6 sm:gap-y-12 lg:gap-y-16">
                                <AnimatePresence>
                                    {filteredProducts.length === 0 ? (
                                        <div className="col-span-full py-20 md:py-32 text-center">
                                            <p className="lu-body text-[#999999] text-sm md:text-lg">No se encontraron productos en esta selección.</p>
                                        </div>
                                    ) : (
                                        filteredProducts.map((product) => {
                                            const stockVariant = product.variantes?.find(v => Number(v.stock) > 0) || (product.variantes?.length > 0 ? product.variantes[0] : null);
                                            const price = stockVariant?.precioAlPublico || product.precioVenta || 0;
                                            const totalStock = product.variantes?.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0) || 0;
                                            const isAvailable = totalStock > 0;

                                            return (
                                                <Link to={`/product/${product.id}`} key={product.id} className="block group h-full">
                                                    <motion.div
                                                        layout
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 20 }}
                                                        className="lu-card h-full flex flex-col relative overflow-hidden rounded-xl sm:rounded-[2rem] shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        {/* ÁREA SUPERIOR: IMAGEN FULL COVER */}
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
                                                                className="absolute bottom-2 right-2 sm:bottom-6 sm:right-6 w-6 h-6 sm:w-11 sm:h-11 bg-[#333333] text-white rounded-full flex justify-center items-center shadow-lg hover:bg-black transition-all z-30 sm:hover:scale-110"
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
                                        })
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* BOTON CARGAR MAS */}
                            {hasMore && (
                                <div className="flex justify-center pt-8 md:pt-12">
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={isLoadingMore}
                                        className="lu-gradient-btn text-white px-6 py-3 md:px-10 md:py-4 lu-title text-[9px] md:text-[11px] shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-3 md:gap-4 rounded-sm w-full sm:w-auto justify-center"
                                    >
                                        {isLoadingMore ? "CARGANDO..." : (
                                            <>
                                                <FiPlusCircle className="text-base md:text-lg font-light" />
                                                DESCUBRIR MÁS PRODUCTOS
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;