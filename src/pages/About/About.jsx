import React from "react";
import { motion } from "framer-motion";
import {
  CpuChipIcon,
  ShieldCheckIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

// =================================================================
// CONFIGURACIÓN ESTILOS LUPETRUCCELLI
// =================================================================
const STYLES = {
  title: "font-['Montserrat'] font-light uppercase tracking-widest text-[#333333]",
  accent: "font-[cursive] text-[#cba394] text-xl md:text-2xl",
  body: "font-sans font-light text-[13px] md:text-[14px] text-[#333333]",
};

const About = () => {
  const features = [
    {
      id: "01",
      title: "Hardware Premium",
      description: "Unidades seleccionadas bajo los más altos estándares de rendimiento.",
      icon: <CpuChipIcon className="h-8 w-8 text-[#cba394]" strokeWidth={1} />,
    },
    {
      id: "02",
      title: "Soporte Técnico",
      description: "Asesoramiento especializado y atención personalizada en cada detalle.",
      icon: <WrenchScrewdriverIcon className="h-8 w-8 text-[#cba394]" strokeWidth={1} />,
    },
    {
      id: "03",
      title: "Seguridad Absoluta",
      description: "Protocolos avanzados para garantizar la tranquilidad en tu compra.",
      icon: <ShieldCheckIcon className="h-8 w-8 text-[#cba394]" strokeWidth={1} />,
    },
    {
      id: "04",
      title: "Logística Global",
      description: "Distribución de precisión con un empaquetado cuidado y sofisticado.",
      icon: <TruckIcon className="h-8 w-8 text-[#cba394]" strokeWidth={1} />,
    },
  ];

  return (
    <section className="relative py-32 bg-[#ffffff] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Encabezado LuPetruccelli */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <span className={STYLES.accent + " mb-6 block"}>
            Nuestra filosofía
          </span>
          <h2 className={STYLES.title + " text-3xl md:text-5xl mb-8 leading-relaxed"}>
            LuPetruccelli
          </h2>
          <p className={STYLES.body + " max-w-2xl mx-auto leading-loose opacity-80"}>
            Liderando la vanguardia en Santa Fe: Calidad certificada,
            innovación constante y un respaldo técnico de excelencia para tus dispositivos.
          </p>

          {/* Divisor Minimalista Rose Gold */}
          <div className="flex items-center justify-center gap-4 mt-12 opacity-70">
            <div className="h-[1px] w-12 bg-[#cba394]"></div>
            <span className="text-[#cba394] text-[10px]">✦</span>
            <div className="h-[1px] w-12 bg-[#cba394]"></div>
          </div>
        </motion.div>

        {/* Tarjetas Minimalistas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
              className="relative bg-[#f9f3f2] p-12 flex flex-col items-center text-center group transition-transform duration-700 hover:-translate-y-2"
            >
              {/* ID Sutil */}
              <span className="absolute top-6 right-6 font-['Montserrat'] text-[#cba394]/20 text-2xl font-light">
                {feature.id}
              </span>

              {/* Ícono de línea fina */}
              <div className="mb-8 transition-transform duration-500 group-hover:scale-110">
                {feature.icon}
              </div>

              <h3 className={STYLES.title + " text-sm mb-4"}>
                {feature.title}
              </h3>

              <p className={STYLES.body + " text-[13px] leading-loose opacity-70"}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA LuPetruccelli */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-center mt-24"
        >
          <button className="group relative overflow-hidden bg-gradient-to-r from-[#ffffff] to-[#f9f3f2] border border-[#cba394]/30 px-14 py-5 transition-all duration-500 hover:border-[#cba394]/60 hover:shadow-[0_8px_30px_rgba(203,163,148,0.1)]">
            <span className="relative z-10 text-[#333333] font-['Montserrat'] font-light text-[11px] tracking-[0.25em] uppercase transition-colors duration-500 group-hover:text-[#cba394]">
              Explorar Servicios
            </span>
          </button>
          <p className="mt-8 font-sans font-light text-[10px] text-[#333333]/40 uppercase tracking-[0.2em]">
            Authorized Service Provider ✦ Quality Guaranteed
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;