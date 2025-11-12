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

  return (
    <>
      <motion.div 
        className="bg-white border border-gray-100 rounded-lg overflow-hidden p-0 transition-all duration-300 
                   shadow-sm hover:shadow-lg hover:shadow-black/10 
                   cursor-pointer group relative" 
        onClick={handleCardClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }} 
      >
        
        <div className="flex flex-col h-full relative z-10">
          
          {/* AJUSTE CLAVE AQUÍ: Contenedor de Imagen */}
          {/* El div superior ahora es el que tiene el background gris de tu foto (bg-gray-200) */}
          {/* La imagen dentro de este div es la que ocupa el 100% de su espacio, sin padding extra. */}
          <div className="relative h-64 sm:h-72 lg:h-80 mb-3 
                          overflow-hidden rounded-t-lg bg-gray-200"> {/* Fondo gris claro como en tu imagen */}
            
            {/* La imagen ocupa el 100% del contenedor gris */}
            {image ? (
              <motion.img
                src={image}
                alt={name}
                // Usamos object-cover para que la imagen llene el espacio, recortando si es necesario.
                // Si la imagen tiene transparencias y quieres que se vea el fondo gris, object-contain sería mejor.
                // Basado en tu foto, object-cover es lo que llena el espacio.
                className="h-full w-full object-cover" 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            ) : (
              // Si no hay imagen, el placeholder se centra en el fondo gris
              <div className="flex items-center justify-center h-full w-full">
                <span className="text-gray-400 text-xs tracking-widest uppercase">IMAGEN NO DISPONIBLE</span>
              </div>
            )}
            
            {/* Overlay para "VER DETALLE" (superpuesto a la imagen, como en tu foto) */}
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

          {/* Información del Producto (Esta sección permanece intacta en su padding y diseño) */}
          <motion.div 
            className="px-4 pb-4 text-left" 
            initial="hidden"
            animate="visible"
            variants={textVariants}
          > 
            
            <motion.h3 
              className="text-lg font-light tracking-wide text-gray-900 line-clamp-2 leading-snug mb-2"
              variants={textVariants}
            >
              {name}
            </motion.h3>
            
            <motion.p 
              className="text-xl sm:text-2xl font-bold text-black mb-0.5"
              variants={textVariants}
            >
              {formatPrice(price)}
            </motion.p>
            
            {transferPrice && (
                <motion.p 
                  className="text-sm font-normal text-gray-500 mb-4"
                  variants={textVariants}
                >
                  {formatPrice(transferPrice)} <span className="text-gray-600">con Transferencia</span>
                </motion.p>
            )}

            <motion.button
                className="w-full py-2.5 text-sm font-medium uppercase tracking-wider rounded-full mt-2
                           border border-black text-black bg-white 
                           hover:bg-black hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); /* Lógica de añadir al carrito */ }}
            >
                AGREGAR
            </motion.button>
            
          </motion.div>
        </div>
      </motion.div>
      <Outlet />
    </>
  );
};

export default ProductCard;