import { useNavigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion"; 

const ProductCard = ({ image, name, price, transferPrice, id }) => {
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
    hidden: { opacity: 0, y: 10 },
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

  const handleCardClick = () => navigate(`/product/${id}`);

  // PLACEHOLDERS (Mantenidos para asegurar la altura uniforme)
  const titlePlaceholderClass = "min-h-[2.4em] mb-3"; 
  const transferPlaceholderClass = "text-sm font-normal text-transparent mb-4 leading-[1.3]";

  return (
    <>
      <motion.div 
        className="bg-white border border-gray-100 rounded-lg overflow-hidden p-0 transition-all duration-300 
                   shadow-sm hover:shadow-lg hover:shadow-black/10 
                   cursor-pointer group relative flex flex-col h-full" 
        onClick={handleCardClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }} 
      >
        
        {/* SECCIÓN DE IMAGEN (No modificada) */}
        <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden rounded-t-lg bg-gray-200"> 
          {image ? (
            <motion.img
              src={image}
              alt={name}
              className="h-full w-full object-cover" 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <span className="text-gray-400 text-xs tracking-widest uppercase">IMAGEN NO DISPONIBLE</span>
            </div>
          )}
          
          {/* Overlay para "VER DETALLE" (Mantenido) */}
          <div className="absolute inset-0 flex items-center justify-center 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                          bg-black/20"> 
            <motion.button
              className="py-2 px-6 text-sm font-medium uppercase tracking-wider 
                         border border-white text-white bg-white/20 hover:bg-white hover:text-black 
                         transition-colors duration-300 rounded-full shadow-lg" 
              onClick={handleCardClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              VER DETALLE
            </motion.button>
          </div>
        </div>

        {/* 2. SECCIÓN DE INFORMACIÓN (¡ELEGANCIA AQUÍ!) */}
        <motion.div 
          className="px-4 pb-4 text-left flex flex-col justify-between flex-grow min-h-[160px] sm:min-h-[180px]" 
          initial="hidden"
          animate="visible"
          variants={textVariants}
        > 
          
          <div className="flex flex-col">
            
            {/* A. TÍTULO: Más grande (text-xl), peso más ligero (font-extralight o light), letter-spacing sutil (tracking-tight) */}
            <motion.h3 
              className={`text-xl font-extralight tracking-tight text-gray-900 line-clamp-2 leading-snug mb-2 ${name.length > 30 ? '' : titlePlaceholderClass}`}
              variants={textVariants}
            >
              {name}
            </motion.h3>
            
            {/* Pequeño divisor (opcional) para separar el título del precio en un diseño premium */}
            <div className="w-6 h-px bg-gray-300 mb-3"></div>

            {/* B. PRECIO PRINCIPAL: Color negro intenso, tamaño destacado (text-3xl) y peso semi-bold, para mayor jerarquía. */}
            <motion.p 
              className="text-3xl font-semibold text-black mb-1"
              variants={textVariants}
            >
              {formatPrice(price)}
            </motion.p>
            
            {/* C. PRECIO DE TRANSFERENCIA: Más pequeño (text-xs) y gris más oscuro para un contraste sutil. */}
            {transferPrice ? (
                <motion.p 
                  className="text-xs font-normal text-gray-700 mb-4 tracking-wider" // Cambios aquí
                  variants={textVariants}
                >
                  {formatPrice(transferPrice)} <span className="text-gray-600">con Transferencia</span>
                </motion.p>
            ) : (
                <div className={transferPlaceholderClass}>&nbsp;</div>
            )}
          </div>

          {/* Botón: Mantenemos el estilo limpio y B&W */}
          <motion.button
              className="w-full py-2.5 text-sm font-medium uppercase tracking-wider rounded-full 
                         border border-black text-black bg-white 
                         hover:bg-black hover:text-white transition-colors duration-200"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { e.stopPropagation(); /* Lógica de añadir al carrito */ }}
          >
              AGREGAR
          </motion.button>
            
        </motion.div>
      </motion.div>
      <Outlet />
    </>
  );
};

export default ProductCard;