import React from "react";
import { motion } from "framer-motion";
import BuySteps from "../../components/BuyStepsCard/BuySteps.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Hero from "../../components/Hero/Hero.jsx";
import ProductsHome from "../Products/productsHome.jsx";



// 1. CONCEPT: EASINGS & SPRINGS (Configuración de física premium)
const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.8
    }
  }
};

import RepairsModule from "../../components/RepairsModule/RepairsModule.jsx";

const HOME = () => {
  const [visualContent, setVisualContent] = React.useState({});

  React.useEffect(() => {
    const fetchVisualContent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/contenido/obtenerContenidoVisual`);
        const data = await response.json();
        const urls = {};
        const positions = {};
        data.forEach(item => {
          urls[item.CmsVisualId] = item.imageUrl;
          positions[item.CmsVisualId] = item.position || 'center center';
        });
        setVisualContent({ urls, positions });
      } catch (error) {
        console.error("Error fetching visual content:", error);
      }
    };
    fetchVisualContent();
  }, []);

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-black selection:bg-orange-500 selection:text-black">

      {/* 2. CONCEPT: INITIAL LOAD ANIMATION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full"
      >
        <Hero />
        <BuySteps />
      </motion.div>

      {/* 3. CONCEPT: VIEWPORT DETECTION (Aparece al hacer scroll) */}
      {/* <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <ProductsHome />
      </motion.div> */}

      {/* BOTÓN "VER TODOS" - ESTILOS FEDECELL APLICADOS */}
      <motion.div
        className="w-full flex justify-center py-24 bg-[#ffffff]"
        variants={fadeUpVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.button
          onClick={() => window.location.href = '/products'}
          whileHover={{ scale: 1.02, boxShadow: "0px 15px 35px rgba(203, 163, 148, 0.15)" }}
          whileTap={{ scale: 0.98 }}
          className="group relative overflow-hidden bg-[#ffffff] border border-[#cba394]/30 px-12 py-5 transition-all duration-500"
        >
          {/* Tipografía Montserrat light y tracking amplio según el branding LuPetruccelli */}
          <span className="relative z-10 text-[#333333] font-['Montserrat'] font-light text-[11px] tracking-[0.2em] uppercase flex items-center gap-4 transition-colors duration-500 group-hover:text-[#333333]">
            Ver todos los productos

            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-[#cba394] font-light text-lg leading-none"
            >
              ⟶
            </motion.span>
          </span>

          {/* Efecto de fondo Nude sofisticado al pasar el mouse */}
          <div className="absolute inset-0 bg-[#f9f3f2] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        </motion.button>
      </motion.div>

      {/* SECCIÓN PROMOS - DINÁMICA CMS */}
      {visualContent.urls?.[2] && (
        <motion.section
          className="w-full py-20 px-6 bg-black"
          variants={fadeUpVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto relative group overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10 opacity-60" />
            <img
              src={visualContent.urls[2]}
              className="w-full h-[300px] md:h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
              style={{ objectPosition: visualContent.positions?.[2] || 'center center' }}
              alt="Promociones Especiales"
            />
            <div className="absolute bottom-12 left-12 z-20">
              <span className="font-['JetBrains_Mono'] text-orange-500 text-xs tracking-[0.5em] uppercase mb-4 block">// OFERTAS_EXCLUSIVAS_DEL_MES</span>
              <h3 className="font-['Montserrat'] font-[900] text-white text-4xl md:text-6xl uppercase tracking-tighter">MEJORÁ TU <br /><span className="text-orange-500">EQUIPO</span> HOY</h3>
            </div>
          </div>
        </motion.section>
      )}

      {/* MÓDULO DE REPARACIONES */}
      <RepairsModule
        bannerImage={visualContent.urls?.[3]}
        bannerPosition={visualContent.positions?.[3]}
      />

      {/* 4. CONCEPT: STAGGERED VIEWPORT DETECTION */}
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="border-t border-white/5 bg-black"
      >


      </motion.div>

      <div className="w-full border-t border-white/5">
        <Footer />
      </div>
    </div>
  );
};

export default HOME;