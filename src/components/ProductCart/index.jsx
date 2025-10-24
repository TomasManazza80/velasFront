import { useNavigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion"; 

const ProductCard = ({ image, name, price, id }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice).replace('ARS', '$').replace(/\s/g, '\u00A0');
  };

  const textVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut", 
        staggerChildren: 0.08 
      } 
    }
  };

  return (
    <>
      <motion.div 
        // AJUSTE: Menor padding en móvil (p-3) y hover lift para evitar ser muy grandes
        className="bg-gradient-to-b from-white/20 to-black/90 rounded-[20px] p-3 md:p-4 transition-all duration-300 
                   shadow-2xl shadow-black/50 
                   hover:shadow-3xl hover:shadow-black/70 
                   cursor-pointer group relative overflow-hidden backdrop-blur-md" 
        onClick={() => navigate(`/product/${id}`)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -6 }} // Reducimos ligeramente el hover lift para móviles
      >
        
        {/* Gradiente Inferior de Sombra (Mantenido) */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

        <div className="flex flex-col h-full relative z-10">
          
          {/* 1. Contenedor de Imagen: Responsividad de Altura */}
          {/* AJUSTE: Altura de imagen más compacta en móvil (h-48) y escalada */}
          <div className="relative h-48 sm:h-56 lg:h-72 mb-4 md:mb-6 flex items-center justify-center 
                          overflow-hidden bg-white rounded-3xl"> 
            {image ? (
              <motion.img
                src={image}
                alt={name}
                className="h-full w-full object-cover mix-blend-multiply" 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            ) : (
              <span className="text-gray-400 text-xs tracking-widest uppercase">IMAGEN NO DISPONIBLE</span>
            )}
            
            {/* Overlay de Hover (Mantenido) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                            bg-black/70 backdrop-blur-md"> 
              <motion.button
                className="w-full py-2 sm:py-3 text-xs sm:text-sm font-medium uppercase tracking-wider 
                           border border-white text-white 
                           bg-white/10 hover:bg-white hover:text-black transition-colors duration-300 
                           rounded-full shadow-lg" 
                onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                VER DETALLE
              </motion.button>
              
              {/* Precio en hover: Tamaño de fuente más pequeño en móvil */}
              <p className="mt-3 text-lg sm:text-xl font-bold text-white tracking-wider">
                {formatPrice(price)}
              </p>
            </div>
          </div>

          {/* 2. Información del Producto */}
          <motion.div 
            className="px-1 text-center"
            initial="hidden"
            animate="visible"
            variants={textVariants}
          > 
            
            {/* Título: Tamaño de fuente más pequeño en móvil */}
            <motion.h3 
              className="text-base sm:text-lg font-semibold tracking-wide text-white line-clamp-2 leading-tight"
              variants={textVariants}
            >
              {name}
            </motion.h3>
            
            {/* Separador Blanco (Mantenido) */}
            <div className="w-10 h-0.5 bg-white mx-auto my-2 rounded-full"></div>

            {/* Precio: Tamaño de fuente más pequeño en móvil */}
            <motion.p 
              className="mt-auto text-xl sm:text-2xl font-bold text-white tracking-wide"
              variants={textVariants}
            >
              {formatPrice(price)}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
      <Outlet />
    </>
  );
};

export default ProductCard;