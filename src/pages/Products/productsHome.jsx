import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Outlet, useNavigate } from "react-router-dom";
import ProductCart from "../../components/ProductCart";

const API_URL = import.meta.env.VITE_API_URL;

// Variantes para las animaciones de entrada
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Los hijos aparecen uno tras otro
            delayChildren: 0.3
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } // Ease tipo 'expo out' para elegancia
    }
};

const ProductsHome = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const constraintsRef = useRef(null);

    // --- CONFIGURACIÓN DEL LOADER INTRO ---
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        if (showIntro) {
            // Bloquear scroll mientras se muestra el intro
            document.body.style.overflow = "hidden";

            return () => {
                document.body.style.overflow = "auto";
            };
        }
    }, [showIntro]);

    // --- CONFIGURACIÓN DE SAN VALENTÍN (Carga aquí tus IDs) ---
    const valentineIds = [];
    const valentineProducts = products.filter(p => valentineIds.includes(p.ProductId));

    async function fetchProducts() {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/products`);
            const sortedData = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
            setProducts(sortedData);
            setFilteredProducts(sortedData);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchProducts(); }, []);

    return (
        <>
            {/* MODAL DE INFORMACIÓN (POPUP) */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            {/* Botón Cerrar (X) */}
                            <button
                                onClick={() => setShowIntro(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10 p-2"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-xl" />
                            </button>

                            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">Novedades</h3>
                                    <div className="h-1 w-10 bg-pink-300 mx-auto rounded-full" />
                                </div>

                                <div className="flex flex-col items-center justify-center w-full mb-8">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        className="text-center space-y-4"
                                    >
                                        <h2 className="text-4xl md:text-6xl font-serif italic text-pink-950 tracking-wide uppercase leading-tight">
                                            📦 VENTA MAYORISTA
                                        </h2>
                                        <p className="text-lg md:text-xl text-gray-600 font-light tracking-widest uppercase">
                                            A partir de <span className="font-bold text-black">$150.000</span>
                                        </p>
                                        <div className="pt-4">
                                            <span className="inline-block bg-black text-white px-8 py-3 text-sm md:text-lg font-bold uppercase tracking-widest rounded-sm shadow-lg transform hover:scale-105 transition-transform">
                                                🔥 30% OFF 1ra Compra
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>

                                <button
                                    onClick={() => setShowIntro(false)}
                                    className="mt-6 px-10 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-transform active:scale-95 shadow-lg"
                                >
                                    Entendido
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .carousel-container { overflow: hidden; width: 100%; cursor: grab; mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%); }
                .carousel-track { display: flex; width: fit-content; padding: 20px 0; }
                .carousel-item-wrapper { min-width: 250px; padding: 0 15px; }
            `}} />
            <Outlet />

            <div className="min-h-screen text-black" style={{ background: 'radial-gradient(ellipse at 50% 0%, #fff 0%, #f4f4f4 100%)' }}>
                <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-16">

                    {/* SECCIÓN SAN VALENTÍN ANIMADA */}
                    {!loading && (
                        <motion.section
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={containerVariants}
                            className="relative mb-24 p-8 md:p-16 rounded-[2.5rem] overflow-hidden border border-pink-100 shadow-[0_20px_50px_rgba(255,182,193,0.15)]"
                            style={{ background: 'linear-gradient(135deg, #fffafa 0%, #ffedf1 100%)' }}
                        >
                            {/* Corazón flotante decorativo */}
                            <motion.div
                                animate={{ y: [0, -15, 0], opacity: [0.05, 0.1, 0.05] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-0 right-0 p-12 pointer-events-none"
                            >
                                <FontAwesomeIcon icon={faHeart} className="text-9xl text-pink-400" />
                            </motion.div>

                            {/* Cabecera de Sección */}
                            <motion.div variants={itemVariants} className="text-center mb-16 relative z-10">
                                <span className="text-[10px] tracking-[0.6em] text-pink-500 mb-4 block uppercase font-bold">
                                    Special Selection
                                </span>
                                <h2 className="text-5xl md:text-7xl font-serif text-pink-950 mb-6 italic">
                                    San <span className="font-light not-italic opacity-60">Valentín</span>
                                </h2>
                                <div className="h-[1px] w-24 bg-pink-300 mx-auto"></div>
                            </motion.div>

                            {/* Grid de Productos de San Valentín */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                                {valentineProducts.length > 0 ? (
                                    valentineProducts.map((item) => (
                                        <motion.div
                                            key={item.ProductId}
                                            variants={itemVariants}
                                            whileHover={{ y: -12, transition: { duration: 0.3 } }}
                                            className="bg-white/50 backdrop-blur-xl border border-white/80 p-2 rounded-2xl shadow-sm"
                                        >
                                            <ProductCart
                                                id={item.ProductId}
                                                name={item.nombre}
                                                price={item.precio}
                                                image={item.imagenes[0]}
                                                category={item.categoria}
                                                showCategory={false}
                                                imageClass="h-52 md:h-72 object-cover rounded-xl shadow-lg"
                                            />
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div variants={itemVariants} className="col-span-full text-center py-10">
                                        <p className="font-serif italic text-pink-900/40 text-lg">
                                            Seleccionando piezas únicas para este 14 de febrero...
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.section>
                    )}

                    {/* CARRUSEL INFINITO */}
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-black"></div></div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="carousel-container mb-24"
                            ref={constraintsRef}
                        >
                            <motion.div
                                className="carousel-track"
                                drag="x"
                                dragConstraints={constraintsRef}
                                animate={{ x: [0, -1875] }}
                                transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 80, ease: "linear" } }}
                            >
                                {([...Array(2)].flatMap(() => products.filter(p => p.categoria !== 'accesorios').slice(0, 15))).map((item, index) => (
                                    <div key={index} className="carousel-item-wrapper" onDoubleClick={() => navigate(`/product/${item.ProductId}`)}>
                                        <motion.div whileHover={{ scale: 1.05 }} className="pointer-events-none">
                                            <ProductCart
                                                id={item.ProductId}
                                                name={item.nombre}
                                                price={item.precio}
                                                image={item.imagenes[0]}
                                                category={item.categoria}
                                                showCategory={false}
                                                showDiscount={false}
                                                imageClass="h-72 object-cover rounded-sm shadow-xl"
                                            />
                                        </motion.div>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* RESTO DE PRODUCTOS (GRILLA INFERIOR) */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                        className="pt-10 px-3 sm:px-6"
                    >
                        <motion.div variants={itemVariants} className="text-center mb-16">
                            <span className="text-[10px] tracking-[0.4em] text-black/40 mb-2 block uppercase font-bold">Colección Completa</span>
                            <h2 className="text-4xl md:text-5xl font-serif tracking-widest uppercase text-black italic">
                                Destacados
                            </h2>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 sm:gap-12">
                            {filteredProducts.map((item) => (
                                <motion.div
                                    key={item.ProductId}
                                    variants={itemVariants}
                                    whileHover={{ y: -8 }}
                                    className="flex justify-center"
                                >
                                    <ProductCart
                                        id={item.ProductId}
                                        name={item.nombre}
                                        price={item.precio}
                                        image={item.imagenes[0]}
                                        category={item.categoria}
                                        showCategory={false}
                                        showDiscount={false}
                                        imageClass="h-56 sm:h-72 md:h-80 object-cover rounded-sm shadow-xl"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default ProductsHome;
