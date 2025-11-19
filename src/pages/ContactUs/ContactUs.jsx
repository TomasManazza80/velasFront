import React from "react";
import { NavLink } from "react-router-dom";
import { FiMail, FiPhone, FiInstagram, FiArrowLeft } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

function ContactUs() {
  // Enlace base para WhatsApp
  const whatsappLink = "https://wa.me/+543425243854?text=Hola%2C%20quisiera%20saber%20más%20sobre%20tus%20diseños.";

  const contacts = [
    {
      id: 1,
      icon: <FiMail className="w-7 h-7 text-gray-700 transition-colors duration-300 group-hover:text-blue-600" />,
      text: "lufpetruccelli@gmail.com",
      // MODIFICACIÓN CLAVE: Usamos 'mailto:' para abrir el cliente de correo.
      link: "mailto:lufpetruccelli@gmail.com", 
    },
    {
      id: 2,
      icon: <FiPhone className="w-7 h-7 text-gray-700 transition-colors duration-300 group-hover:text-red-600" />,
      text: "342-5243854",
      link: "tel:+543425243854", // Link para llamada
    },
    {
      id: 3,
      icon: <FiInstagram className="w-7 h-7 text-gray-700 transition-colors duration-300 group-hover:text-pink-600" />,
      text: "@lu.petruccelli",
      link: "https://www.instagram.com/lu.petruccelli/", // Link para Instagram
    },
    // Botón de WhatsApp
    {
      id: 4,
      icon: <FaWhatsapp className="w-7 h-7 text-gray-700 transition-colors duration-300 group-hover:text-emerald-600" />, 
      text: "Envía un mensaje",
      link: whatsappLink, 
      isWhatsapp: true, 
    },
  ];

  return (
    <section className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Fondo sutil minimalista */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#fafafa_1px,transparent_1px)] bg-[length:22px_22px]" />

      <div className="relative container mx-auto px-6 py-24">
        
        {/* Encabezado SEO */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-gray-900 mb-4">
            CONTACTO | VELAS ARTESANALES SANTA FE
          </h1>
          <p className="text-sm tracking-widest text-gray-500 uppercase">
            Comunícate con Lu Petruccelli
          </p>
          <div className="w-16 h-px bg-gray-300 mx-auto mt-6"></div>
        </div>

        {/* Bloque de Contenido SEO */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 leading-relaxed">
            ¿Tienes alguna consulta sobre nuestros productos, quieres realizar un pedido mayorista o personalizar tus **velas de cera de soja en Santa Fe**? Estamos aquí para ayudarte. Ponte en contacto directamente con **Lu Petruccelli**, la creadora de tus **velas artesanales favoritas en la ciudad de Santa Fe**. Utiliza cualquiera de los canales a continuación para resolver tus dudas sobre aromas, envíos o diseños especiales.
          </p>
        </div>

        {/* Tarjetas de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {contacts.map((contact, index) => {
            const isClickable = contact.link;
            
            // Componente que renderiza el contenido de la tarjeta
            const CardContent = () => (
              <div 
                // Añadimos 'hover:border-black' para un toque extra en el hover
                className={`relative bg-white border border-gray-100 shadow-sm rounded-2xl p-10 flex flex-col items-center text-center group transform transition duration-500 hover:-translate-y-2 ${isClickable ? 'cursor-pointer hover:shadow-xl hover:border-black' : ''} animate-fade-up h-full`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="mb-6 p-4 bg-gray-50 rounded-full shadow-sm transform transition duration-500 group-hover:rotate-6">
                  {contact.icon}
                </div>
                <p className={`text-gray-600 text-base tracking-wide ${contact.isWhatsapp ? 'group-hover:text-emerald-700 font-medium transition-colors duration-300' : isClickable ? 'group-hover:text-black transition-colors duration-300' : ''}`}>
                  {contact.text}
                </p>
              </div>
            );

            if (isClickable) {
              // Si es email o teléfono, no necesitamos 'target="_blank"'
              const target = (contact.link.startsWith('http') || contact.link.startsWith('wa.me')) ? "_blank" : "_self";

              return (
                <a
                  key={contact.id}
                  href={contact.link}
                  target={target}
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  <CardContent />
                </a>
              );
            }

            return (
              <CardContent key={contact.id} />
            );
          })}
        </div>

        {/* Botón volver */}
        <div className="text-center mt-16">
          <NavLink
            to="/"
            className="inline-flex items-center px-8 py-3 border border-black text-xs font-medium tracking-[0.2em] uppercase rounded-xl bg-black text-white hover:bg-gray-800 transition-all duration-300"
          >
            <FiArrowLeft className="mr-2" />
            Volver al Inicio
          </NavLink>
        </div>

        {/* Footer */}
        <div className="text-center mt-20 pt-10 border-t border-gray-200">
          <p className="text-xs text-gray-500 tracking-wide">
            &copy; {new Date().getFullYear()} Lu Petruccelli Velas. Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ContactUs;