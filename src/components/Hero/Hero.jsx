import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faSearch, faTimes, faPlay } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import ProductCart from "../../components/ProductCart";
import video from "../../images/fondovela.mp4";
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const controls = useAnimation();
  const videoRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Detectar si es un dispositivo móvil
  useEffect(() => {
    const checkIsMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    setIsMobile(checkIsMobile());
  }, []);

  // Configuración del video de fondo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoPlay = () => {
      setIsVideoPlaying(true);
    };

    const handleVideoPause = () => {
      setIsVideoPlaying(false);
    };

    const handleVideoEnd = () => {
      video.currentTime = 0.2;
      video.play().catch(error => {
        console.log("Video replay prevented:", error);
      });
    };

    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('pause', handleVideoPause);
    video.addEventListener('ended', handleVideoEnd);

    // Intentar reproducir automáticamente
    const playVideo = async () => {
      try {
        // En móviles, necesitamos esperar a que el usuario interactúe primero
        if (isMobile && !hasUserInteracted) {
          return;
        }
        
        await video.play();
        setIsVideoPlaying(true);
      } catch (error) {
        console.log("Autoplay prevented:", error);
        // En caso de error, mostrar un botón de reproducción
        setIsVideoPlaying(false);
      }
    };

    playVideo();

    return () => {
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('pause', handleVideoPause);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [isMobile, hasUserInteracted]);

  // Obtener productos al montar el componente
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await axios.get(`${API_URL}/products`);
        setProducts(data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchProducts();
  }, []);

  // Filtrar productos cuando cambia la búsqueda
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredProducts([]);
      setShowResults(false);
      return;
    }

    const filtered = products.filter(item =>
      item.nombre.toLowerCase().includes(search.toLowerCase())
    );
    
    setFilteredProducts(filtered);
    setShowResults(true);
  }, [search, products]);

  // Animación de la flecha indicadora
  useEffect(() => {
    const sequence = async () => {
      await controls.start("visible");
      await controls.start({
        y: [0, -10, 0],
        transition: { repeat: Infinity, duration: 2 }
      });
    };
    sequence();
  }, [controls]);

  // Función para reproducir video manualmente (necesaria en móviles)
  const handlePlayVideo = async () => {
    try {
      setHasUserInteracted(true);
      await videoRef.current.play();
      setIsVideoPlaying(true);
    } catch (error) {
      console.log("Error al reproducir video:", error);
    }
  };

  // Función para manejar la interacción del usuario con la página
  const handleUserInteraction = () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      if (videoRef.current && !isVideoPlaying) {
        handlePlayVideo();
      }
    }
  };
 
  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    }
  };

  const searchVariants = {
    hidden: { width: 0 },
    visible: {
      width: "100%",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  // Formatear precio
  const formatPrice = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice).replace('ARS', '$');
  };

  // Resetear búsqueda
  const resetSearch = () => {
    setSearch("");
    setShowResults(false);
  };

  return (
    <div 
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      onClick={handleUserInteraction}
    >
      {/* Video de fondo */}
      <div className="absolute inset-0 z-0 w-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover min-w-full"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={video} type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>
        
        {/* Overlay para reproducir en móviles */}
        {!isVideoPlaying && isMobile && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 cursor-pointer z-20"
            onClick={handlePlayVideo}
          >
            <motion.div 
              className="text-center p-6 bg-black bg-opacity-60 rounded-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <FontAwesomeIcon icon={faPlay} className="text-white text-3xl ml-1" />
              <p className="text-white mt-2 text-sm">Toca para reproducir</p>
            </motion.div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-30 w-full"></div>
      </div>

      {/* Efecto de partículas */}
      <div className="absolute inset-0 overflow-hidden z-1 w-full">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gray-200"
            style={{
              width: Math.random() * 10 + 2 + "px",
              height: Math.random() * 10 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%"
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0],
              y: [0, Math.random() * 100 - 50]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <motion.div
        className="text-center w-full max-w-7xl mx-auto px-4 z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {!showResults && (
            <motion.div 
              className="mb-16 w-full"
              variants={itemVariants}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.3em] uppercase text-white mb-2 w-full"
                variants={itemVariants}
              >
                Luciana Petruccelli
              </motion.h1>
              <motion.h2 
                className="text-sm md:text-base tracking-[0.3em] uppercase text-gray-300 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                Lifestyle Decoration 
              </motion.h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de búsqueda */}
        <motion.div 
          className="max-w-md w-full mx-auto relative mb-4"
          variants={searchVariants}
        >
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-white/70" />
            </div>
            
            <motion.input
              type="text"
              placeholder="BUSCAR PRODUCTOS..."
              className="w-full pl-10 pr-10 py-4 text-center text-xs tracking-[0.3em] uppercase bg-transparent border-b-2 border-white/30 focus:outline-none placeholder-white/50 text-white font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              whileFocus={{
                scale: 1.05,
                borderBottomColor: "#ffffff",
                backdropFilter: "blur(4px)"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300,
                borderBottomColor: { duration: 0.3 }
              }}
            />
            
            {search && (
              <button 
                onClick={resetSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FontAwesomeIcon icon={faTimes} className="text-white/70 hover:text-white transition-colors" />
              </button>
            )}
          </div>
          
          {/* Barra de carga animada - Versión mejorada */}
          <motion.div
            className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-transparent via-white to-transparent w-full"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: 1,
              opacity: 1,
              boxShadow: '0 0 15px rgba(255,255,255,0.7)'
            }}
            transition={{ 
              delay: 1.2,
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1]
            }}
          />
        </motion.div>
          

        {/* Nombres de categorías (solo sin resultados) */}
        <AnimatePresence>
          {!showResults && (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mx-auto mt-20"
              variants={containerVariants}
              exit={{ opacity: 0 }}
            >
              {["premium candles", "necklaces", "flavorings", "decorations"].map((name, i) => (
                <motion.div
                  key={name}
                  className="text-xs md:text-sm tracking-[0.3em] uppercase text-gray-300 hover:text-white transition-colors cursor-pointer w-full"
                  variants={itemVariants}
                  whileHover={{ 
                    y: -5,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  custom={i}
                >
                  {name}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultados de búsqueda */}
        <AnimatePresence>
          {showResults && (
            <motion.div 
              className="mt-12 w-full max-w-7xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-left mb-6 w-full">
                <h3 className="text-xs tracking-widest uppercase text-gray-300 w-full">
                  RESULTADOS PARA: <span className="text-white">{search}</span>
                </h3>
                {filteredProducts.length > 0 && (
                  <p className="text-xs tracking-widest text-gray-300 mt-1 w-full">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'PRODUCTO' : 'PRODUCTOS'} ENCONTRADOS
                  </p>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 w-full">
                  <p className="text-gray-300 tracking-widest uppercase w-full">
                    NO SE ENCONTRARON PRODUCTOS
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                  {filteredProducts.slice(0, 3).map((product) => (
                    <motion.div
                      key={product.ProductId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white bg-opacity-90 p-6 shadow-sm hover:shadow-md transition-shadow w-full"
                    >
                      <div className="h-48 mb-4 flex items-center justify-center overflow-hidden bg-gray-50 w-full">
                        {product.imagenes && product.imagenes.length > 0 ? (
                          <img 
                            src={product.imagenes[0]} 
                            alt={product.nombre} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <span className="text-gray-400">IMAGEN NO DISPONIBLE</span>
                        )}
                      </div>
                      
                      <h3 className="text-sm font-medium uppercase text-gray-900 mb-2 w-full">
                        {product.nombre}
                      </h3>
                      
                      <p className="text-xs text-gray-500 mb-1 w-full">
                        {product.marca}
                      </p>
                      
                      <p className="text-lg font-normal text-gray-900 mb-4 w-full">
                        {formatPrice(product.precio)}
                      </p>
                      
                      <button
                        className="w-full py-2 text-xs font-medium uppercase border border-black text-black hover:bg-black hover:text-white transition-colors duration-300"
                        onClick={() => navigate(`/product/${product.ProductId}`)}
                      >
                        Ver producto
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Flecha indicadora (solo sin resultados) */}
      <AnimatePresence>
        {!showResults && (
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 w-full text-center"
            animate={controls}
            variants={{
              visible: { 
                opacity: [0, 1, 0],
                y: [10, 0, 10],
                transition: { duration: 2, repeat: Infinity }
              }
            }}
            exit={{ opacity: 0 }}
          >
            <FontAwesomeIcon
              icon={faAngleDown}
              className="text-white text-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hero;