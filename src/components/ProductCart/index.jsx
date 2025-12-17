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
    }).format(numericPrice).replace('ARS', '$');
  };

  const handleCardClick = () => navigate(`/product/${id}`);

  // Variantes de entrada (al cargar la página)
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <>
      <motion.div 
        className="group relative flex flex-col h-full bg-white cursor-pointer antialiased border border-neutral-100"
        onClick={handleCardClick}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
        // ANIMACIÓN AL PASAR EL MOUSE POR LA CARD
        whileHover={{ 
          y: -10,
          transition: { duration: 0.4, ease: "easeOut" }
        }}
      >
        {/* CONTENEDOR DE IMAGEN */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F2F2F2] flex-shrink-0"> 
          {image ? (
            <motion.img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <span className="text-[10px] tracking-[0.5em] text-neutral-400 uppercase font-light">Essential</span>
            </div>
          )}
          
          {/* Overlay que se oscurece mínimamente al hacer hover */}
          <div className="absolute inset-0 bg-black/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* INFO - CONTENEDOR PRINCIPAL */}
        <div className="py-8 px-5 flex flex-col items-center text-center grow transition-all duration-500 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
          
          {/* SECCIÓN SUPERIOR */}
          <motion.div variants={itemVariants} className="flex flex-col items-center w-full">
            <h3 className="text-[14px] sm:text-[15px] font-normal tracking-[0.2em] text-black uppercase mb-4 leading-relaxed min-h-[3rem]">
              {name}
            </h3>
            {/* La línea crece al pasar por encima de la card */}
            <div className="w-8 h-[1px] bg-black/20 mb-6 group-hover:w-20 group-hover:bg-black transition-all duration-700 ease-in-out" />
          </motion.div>

          {/* SECCIÓN INFERIOR: Alineada al fondo */}
          <div className="mt-auto flex flex-col items-center w-full">
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-1.5 mb-8 min-h-[50px] justify-center">
              <span className="text-[16px] font-light tracking-[0.15em] text-black/90">
                {formatPrice(price)}
              </span>
              
              {transferPrice && (
                <span className="text-[9px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
                  {formatPrice(transferPrice)} vía transferencia
                </span>
              )}
            </motion.div>

            {/* BOTÓN CON EFECTO DE ELEVACIÓN */}
            <motion.button
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "#000",
                boxShadow: "0px 10px 20px rgba(0,0,0,0.15)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 w-full max-w-[180px] text-[10px] font-bold uppercase tracking-[0.3em] 
                         bg-black text-white transition-all duration-300
                         group-hover:translate-y-[-5px]"
              onClick={(e) => { e.stopPropagation(); }}
            >
              Añadir
            </motion.button>
          </div>
        </div>
      </motion.div>
      <Outlet />
    </>
  );
};

export default ProductCard;