import React from "react";
import { NavLink } from "react-router-dom";
import { FiMail, FiPhone, FiInstagram, FiArrowLeft } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

// =================================================================
// CONFIGURACIÓN ESTILOS LUPETRUCCELLI
// =================================================================
const STYLES = {
  title: "font-['Montserrat'] font-light uppercase tracking-widest text-[#333333]",
  accent: "font-[cursive] text-[#cba394] text-xl md:text-2xl",
  body: "font-sans font-light text-[13px] md:text-[14px] text-[#333333]",
};

function ContactUs() {
  const contacts = [
    {
      id: "01",
      icon: <FiMail className="w-6 h-6 text-[#cba394]" strokeWidth={1} />,
      label: "Escribinos",
      text: "hola@lupetruccelli.com",
    },
    {
      id: "02",
      icon: <FiPhone className="w-6 h-6 text-[#cba394]" strokeWidth={1} />,
      label: "Llamanos",
      text: "+54 342 5937358",
    },
    {
      id: "03",
      icon: <FiInstagram className="w-6 h-6 text-[#cba394]" strokeWidth={1} />,
      label: "Instagram",
      text: (
        <a
          href="https://www.instagram.com/lupetruccelli/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#cba394] transition-colors"
        >
          @lupetruccelli
        </a>
      ),
    },
    {
      id: "04",
      icon: <FaWhatsapp className="w-6 h-6 text-[#cba394]" />,
      label: "WhatsApp",
      text: (
        <a
          href="https://wa.me/+543425937358?text=Hola! Quisiera realizar una consulta."
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#cba394] transition-colors"
        >
          Iniciar chat
        </a>
      ),
    },
  ];

  return (
    <section className="relative min-h-screen w-full bg-[#ffffff] overflow-x-hidden text-[#333333] pt-32 pb-16">

      <div className="relative container mx-auto px-6 lg:px-12">

        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <span className={STYLES.accent + " mb-6 block"}>
            Estamos cerca
          </span>
          <h1 className={STYLES.title + " text-4xl md:text-6xl mb-6 leading-relaxed"}>
            Contacto
          </h1>
          <p className={STYLES.body + " max-w-xl mx-auto opacity-80"}>
            Nos encantaría escucharte. Ya sea para una consulta, un pedido especial o simplemente para decir hola, aquí estamos.
          </p>

          {/* Divisor Minimalista Rose Gold */}
          <div className="flex items-center justify-center gap-4 mt-12 opacity-70">
            <div className="h-[1px] w-12 bg-[#cba394]"></div>
            <span className="text-[#cba394] text-[10px]">✦</span>
            <div className="h-[1px] w-12 bg-[#cba394]"></div>
          </div>
        </motion.div>

        {/* Tarjetas de Comunicación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
              className="relative bg-[#f9f3f2] p-12 flex flex-col items-center text-center group transition-transform duration-700 hover:-translate-y-2"
            >
              {/* ID Sutil */}
              <span className="absolute top-6 right-6 font-['Montserrat'] text-[#cba394]/20 text-2xl font-light">
                {contact.id}
              </span>

              {/* Contenedor de Ícono (sin fondo blanco pesado) */}
              <div className="mb-6 transition-transform duration-500 group-hover:scale-110">
                {contact.icon}
              </div>

              {/* Etiqueta */}
              <span className="font-['Montserrat'] text-[10px] text-[#cba394] mb-3 uppercase tracking-widest">
                {contact.label}
              </span>

              {/* Texto de contacto */}
              <p className={STYLES.body + " text-[13px] tracking-wide"}>
                {contact.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Botón de Retorno */}
        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <NavLink
            to="/"
            className="inline-flex items-center group relative overflow-hidden bg-gradient-to-r from-[#ffffff] to-[#f9f3f2] border border-[#cba394]/30 px-12 py-5 transition-all duration-500 hover:border-[#cba394]/60 hover:shadow-[0_8px_30px_rgba(203,163,148,0.1)]"
          >
            <FiArrowLeft className="mr-4 text-[#cba394] transition-transform duration-500 group-hover:-translate-x-1" strokeWidth={1} />
            <span className="relative z-10 text-[#333333] font-['Montserrat'] font-light text-[11px] tracking-[0.25em] uppercase transition-colors duration-500 group-hover:text-[#cba394]">
              Volver al inicio
            </span>
          </NavLink>
        </motion.div>

        {/* Footer Minimalista */}
        <motion.div
          className="text-center mt-32 pt-10 border-t border-[#cba394]/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
        >
          <p className="font-['Montserrat'] text-[9px] text-[#333333]/50 uppercase tracking-[0.25em]">
            &copy; {new Date().getFullYear()} LuPetruccelli ✦ Santa Fe, AR.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ContactUs;