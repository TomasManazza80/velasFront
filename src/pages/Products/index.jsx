import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, Link, useSearchParams } from "react-router-dom";
import { FiX, FiSearch, FiDollarSign, FiFilter, FiPlusCircle } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";

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
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setCategory(categoryParam);
            setShowFilters(true); // Mostrar filtros si venimos de una categoría específica
        }
    }, [searchParams]);
    const dispatch = useDispatch();

    const handleAddToCart = (e, product, price) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({
            type: "ADD_TO_CART",
            payload: {
                ...product,
                price: price,
                quantity: 1,
                origenDeVenta: 'Ecommerce',
                image: product.imagenes?.[0]
            }
        });
        window.dispatchEvent(new CustomEvent("showNotification", {
            detail: { message: "Agregado al carrito", type: "success" }
        }));
    };

    const availableCategories = [...new Set(products.map(p => p.categoria))].filter(Boolean).sort();
    const availableBrands = [...new Set(products.map(p => p.marca))].filter(Boolean).sort();

    const MAX_PREVIEW_RESULTS = 5;
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

                <div className="container mx-auto px-6 md:px-12 lg:px-24">
                    {/* BARRA DE CONTROL Y BÚSQUEDA */}
                    <div className="bg-[#f9f3f2] p-8 md:p-12 mb-16 rounded-sm shadow-sm">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center">
                                <div className="flex gap-4 w-full lg:w-auto flex-grow relative">
                                    <div className="relative flex-grow group">
                                        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#cba394] text-lg" />
                                        <input
                                            type="text"
                                            placeholder="Buscar fragancia o producto..."
                                            className="lu-input w-full pl-14 pr-6 py-4 rounded-sm lu-body text-[13px] tracking-wide"
                                            onChange={(e) => setSearch(e.target.value)}
                                            value={search}
                                        />
                                    </div>
                                    <button
                                        className="lg:hidden px-5 bg-[#ffffff] border border-[#cba394]/30 text-[#cba394] rounded-sm flex items-center justify-center hover:bg-[#cba394] hover:text-white transition-colors"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <FiFilter />
                                    </button>
                                </div>

                                <select
                                    className={`${showFilters ? 'block' : 'hidden'} lg:block lu-input px-6 py-4 rounded-sm lu-title text-[10px] w-full lg:w-auto min-w-[200px] cursor-pointer`}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    value={sortOption}
                                >
                                    <option value="">ORDENAR POR</option>
                                    <option value="price-asc">PRECIO: MENOR A MAYOR</option>
                                    <option value="price-desc">PRECIO: MAYOR A MENOR</option>
                                </select>
                            </div>

                            {/* FILTROS ADICIONALES */}
                            <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col md:flex-row items-stretch md:items-center gap-6 pt-6 border-t border-[#cba394]/20`}>
                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                                    <span className="lu-title text-[10px] text-[#999999] hidden md:inline">PRECIO</span>
                                    <div className="relative flex items-center flex-1 md:flex-none">
                                        <FiDollarSign className="absolute left-4 text-[#cba394] text-sm" />
                                        <input type="number" placeholder="Min" className="lu-input pl-9 pr-4 py-3 w-full md:w-32 rounded-sm lu-body text-[13px]" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                                    </div>
                                    <div className="h-[1px] w-4 bg-[#999999]/30"></div>
                                    <div className="relative flex items-center flex-1 md:flex-none">
                                        <FiDollarSign className="absolute left-4 text-[#cba394] text-sm" />
                                        <input type="number" placeholder="Max" className="lu-input pl-9 pr-4 py-3 w-full md:w-32 rounded-sm lu-body text-[13px]" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                                    </div>
                                </div>

                                {(search || category || brand || sortOption || minPrice || maxPrice) && (
                                    <button onClick={resetFilters} className="text-[#b07d6b] hover:text-[#333333] transition-colors lu-title text-[10px] flex items-center justify-center gap-2 w-full md:w-auto px-4 py-3">
                                        <FiX /> LIMPIAR FILTROS
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`${showFilters ? 'grid' : 'hidden'} lg:grid grid-cols-1 md:grid-cols-2 gap-12 mb-20`}>
                        {/* CATEGORÍAS */}
                        <div>
                            <h2 className="lu-title text-[10px] text-[#999999] mb-6">COLECCIONES</h2>
                            <div className="flex flex-nowrap md:flex-wrap gap-6 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
                                {availableCategories.length > 0 ? availableCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(category === cat ? "" : cat)}
                                        className={`lu-category pb-1 lu-title text-[11px] tracking-wider whitespace-nowrap ${category === cat ? 'active' : ''}`}
                                    >
                                        {cat}
                                    </button>
                                )) : <p className="text-[#999999] text-[11px] lu-body">No hay categorías disponibles</p>}
                            </div>
                        </div>

                        {/* MARCAS / LÍNEAS */}
                        <div>
                            <h2 className="lu-title text-[10px] text-[#999999] mb-6">LÍNEA DE PRODUCTO</h2>
                            <div className="flex flex-nowrap md:flex-wrap gap-6 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
                                {availableBrands.length > 0 ? availableBrands.map((b) => (
                                    <button
                                        key={b}
                                        onClick={() => setBrand(brand === b ? "" : b)}
                                        className={`lu-category pb-1 lu-title text-[11px] tracking-wider whitespace-nowrap ${brand === b ? 'active' : ''}`}
                                    >
                                        {b}
                                    </button>
                                )) : <p className="text-[#999999] text-[11px] lu-body">No hay líneas detectadas</p>}
                            </div>
                        </div>
                    </div>

                    {/* GRID DE PRODUCTOS */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-[450px] bg-[#f9f3f2] rounded-sm animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-20">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                                <AnimatePresence>
                                    {filteredProducts.length === 0 ? (
                                        <div className="col-span-full py-32 text-center">
                                            <p className="lu-body text-[#999999] text-lg">No se encontraron productos en esta selección.</p>
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
                                                            <button
                                                                onClick={(e) => handleAddToCart(e, product, price)}
                                                                className="absolute bottom-6 right-6 w-11 h-11 bg-[#333333] text-white rounded-full flex justify-center items-center shadow-lg hover:bg-black transition-all z-30 hover:scale-110"
                                                                aria-label="Agregar al carrito"
                                                            >
                                                                <FontAwesomeIcon icon={faCartPlus} className="text-sm" />
                                                            </button>
                                                        ) : (
                                                            <div className="absolute bottom-6 right-6 w-11 h-11 bg-gray-100 text-gray-400 rounded-full flex justify-center items-center disabled z-30 opacity-60">
                                                                <FontAwesomeIcon icon={faCartPlus} className="text-sm" />
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
                                <div className="flex justify-center pt-12">
                                    <button
                                        onClick={() => setPage(p => p + 1)}
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;