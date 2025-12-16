import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiFilter } from "react-icons/fi";
import { Outlet, useNavigate } from "react-router-dom"; // Importamos useNavigate
import ProductCart from "../../components/ProductCart"; 

const API_URL = import.meta.env.VITE_API_URL;

const ACCENT_COLOR_BORDO = "#B22222"; 

const depthStyle = {
    background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 1) 0%, rgba(240, 240, 240, 1) 100%)',
    backgroundAttachment: 'fixed', 
};

const carouselStyles = `
.carousel-container {
    overflow: hidden;
    width: 100%;
    cursor: grab;
    mask-image: linear-gradient(to right, 
        rgba(0, 0, 0, 0) 0%, 
        rgba(0, 0, 0, 1) 10%, 
        rgba(0, 0, 0, 1) 90%, 
        rgba(0, 0, 0, 0) 100%
    );
}
.carousel-container:active {
    cursor: grabbing;
}
.carousel-track {
    display: flex;
    width: fit-content;
    padding: 20px 0;
}
.carousel-item-wrapper {
    min-width: 250px;
    padding: 0 15px;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-drag: none;
}
@media (max-width: 768px) {
    .carousel-item-wrapper {
        min-width: 180px;
        padding: 0 10px;
    }
}
`;

const ProductsHome = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [category, setCategory] = useState("");
    const [showCategories, setShowCategories] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate(); // Hook para la navegación manual
    const constraintsRef = useRef(null);

    async function fetchProducts() {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/products`);
            const sortedData = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
            setProducts(sortedData);
            setFilteredProducts(sortedData);
        } catch (error) {
            console.error("Error al obtener los productos:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const filtered = category === "" 
            ? products 
            : products.filter(item => item.categoria === category);
        setFilteredProducts(filtered);
    }, [category, products]);

    const carouselProducts = products
        .filter(p => p.categoria !== 'accesorios')
        .slice(0, 15);
    
    const duplicatedCarouselProducts = [...carouselProducts, ...carouselProducts];

    // Función para manejar el doble click
    const handleDoubleClick = (id) => {
        navigate(`/product/${id}`); // Ajusta esta ruta según tu configuración de router
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: carouselStyles }} /> 
            <Outlet />
            
            <div className="min-h-screen text-black" style={depthStyle}> 
                <div className="container mx-auto px-0 py-10 sm:px-6 sm:py-16">
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-20 sm:py-24">
                            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-gray-900"></div>
                        </div>
                    ) : (
                        <div className="carousel-container" ref={constraintsRef}>
                            <motion.div 
                                className="carousel-track"
                                drag="x"
                                dragConstraints={constraintsRef}
                                animate={{ x: [0, -1875] }}
                                transition={{
                                    x: {
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        duration: 80,
                                        ease: "linear",
                                    },
                                }}
                            >
                                {duplicatedCarouselProducts.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className="carousel-item-wrapper"
                                        onDoubleClick={() => handleDoubleClick(item.ProductId)} // Acción solo en doble click
                                        onClick={(e) => e.preventDefault()} // Bloquea el click simple
                                    >
                                        <motion.div 
                                            whileHover={{ scale: 1.05 }} 
                                            transition={{ type: "spring", stiffness: 300 }}
                                            className="h-full w-full flex justify-center pointer-events-none" // Evita que el hijo capture el click
                                        >
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
                        </div>
                    )}
                    
                    {/* Sección inferior se mantiene igual (con click normal para comodidad) */}
                    <div className="pt-20 px-3 sm:px-6"> 
                        <div className="text-center mb-10 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl font-serif tracking-widest uppercase text-black mb-2">
                                algunos de nuestros productos destacados
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-8">
                            {filteredProducts.map((item, index) => (
                                <motion.div 
                                    key={item.ProductId}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }} 
                                    className="flex justify-center h-full"
                                >
                                    <ProductCart
                                        id={item.ProductId}
                                        name={item.nombre}
                                        price={item.precio}
                                        image={item.imagenes[0]}
                                        category={item.categoria}
                                        showCategory={false}
                                        showDiscount={false}
                                        imageClass="h-48 sm:h-60 md:h-72 lg:h-80 object-cover rounded-sm shadow-xl"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductsHome;