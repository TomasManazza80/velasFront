import React, { useState } from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [floatingContent, setFloatingContent] = useState(null);
  const [showFloatingDiv, setShowFloatingDiv] = useState(false);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFloatingContent = (contentKey) => {
    // Definir el contenido para cada opción
    const contentMap = {
      historia: {
        title: "Nuestra Historia",
        content: "Soy lu petruccelli! Artista y diseñadora de decoración enfocada en el estilo de vida. Esta marca nació desde una necesidad artistica y estética, y las ganas de crear productos que acompañen el día a día de las personas desde un lugar de bienestar y dedicación a uno mismo. Empecé con este proyecto en el 2024 y hoy somos un equipo de 5 personas creciendo cada día más!"
      },
      sustentabilidad: {
        title: "Sustentabilidad",
        content: "Nos comprometemos con prácticas sostenibles en todos nuestros procesos. Utilizamos materiales reciclados y reducimos nuestro impacto ambiental al mínimo."
      },
      tiendas: {
        title: "Nuestras Tiendas Exclusivas",
        content: "Contamos con tiendas físicas en las principales ciudades. Visítanos y experimenta nuestros productos en persona. Horario: Lunes a Sábado de 10:00 a 20:00."
      },
      trabajo: {
        title: "Trabaja con Nosotros",
        content: "¿Te gustaría unirte a nuestro equipo? Envía tu CV a lufpetruccelli@gmail.com y sé parte de esta gran familia."
      },
      cuidado: {
        title: "Cuidado del Producto",
        content: "Para prolongar la vida de tus velas, mantenlas alejadas de la luz solar directa y recorta la mecha antes de cada uso. Los aromatizadores funcionan mejor en espacios cerrados."
      },
      mayoristas: {
        title: "Mayoristas",
        content: "Ofrecemos precios especiales para compras al por mayor. Contáctanos a lufpetruccelli@gmail.com para más información sobre nuestros descuentos por volumen."
      },
      compra: {
        title: "Información para tu Compra",
        content: "Todos nuestros productos incluyen envío gratuito para compras superiores a $100.000. Procesamos los pedidos en un plazo de 24-48 horas."
      },
      terminos: {
        title: "Términos y Condiciones",
        content: "Al realizar una compra, aceptas nuestros términos y condiciones. Los productos pueden ser devueltos dentro de los 30 días posteriores a la compra si se encuentran en su estado original."
      },
      arrepentimiento: {
        title: "Botón de Arrepentimiento",
        content: "Si te arrepientes de tu compra, puedes cancelarla dentro de las 24 horas siguientes sin ningún costo. Contáctanos a lufpetruccelli@gmail.com"
      },
      aromatizadores: {
        title: "Aromatizadores Ultrasónicos",
        content: "Nuestros aromatizadores ultrasónicos utilizan tecnología de última generación para dispersar fragancias de manera uniforme en cualquier espacio. Incluyen modo automático y manual."
      },
      difusores: {
        title: "Difusores de ambiente",
        content: "Disfruta de una fragancia constante y duradera con nuestros difusores de cañas naturales. Cada unidad tiene una duración aproximada de 3 meses."
      },
      velas: {
        title: "Velas aromáticas cera de soja",
        content: "Elaboradas con cera de soja 100% natural, nuestras velas proporcionan una combustión limpia y una fragancia que perdura incluso apagadas. Tiempo de combustión: 40-50 horas."
      },
      productos: {
        title: "Todos los productos",
        content: "Explora nuestra completa gama de productos para el hogar. Desde velas y difusores hasta accesorios exclusivos, tenemos todo para crear el ambiente perfecto."
      }
    };

    if (contentMap[contentKey]) {
      setFloatingContent(contentMap[contentKey]);
      setShowFloatingDiv(true);
    }
  };

  const closeFloatingDiv = () => {
    setShowFloatingDiv(false);
    setFloatingContent(null);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      setEmailError("El correo electrónico es requerido");
      return;
    }
    
    if (!emailRegex.test(email)) {
      setEmailError("Por favor, ingresa un correo electrónico válido");
      return;
    }
    
    console.log("Subscribed with email:", email);
    setIsSubscribed(true);
    setEmailError("");
    setEmail("");
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const footerSections = [
    {
      title: "Nuestra Historia",
      url: "/nuestra-historia",
      key: "historia"
    },
    {
      title: "Sustentabilidad",
      url: "/sustentabilidad",
      key: "sustentabilidad"
    },
    {
      title: "Nuestras Tiendas Exclusivas",
      url: "/tiendas",
      key: "tiendas"
    },
    {
      title: "Trabaja con Nosotros",
      url: "/trabaja-con-nosotros",
      key: "trabajo"
    },
    {
      title: "Cuidado del Producto",
      url: "/cuidado-del-producto",
      key: "cuidado"
    }
  ];

  const footerContact = [
    {
      title: "Mayoristas",
      url: "/mayoristas",
      key: "mayoristas"
    },
    {
      title: "Información para tu Compra",
      url: "/informacion-compra",
      key: "compra"
    },
    {
      title: "Términos y Condiciones",
      url: "/terminos-condiciones",
      key: "terminos"
    },
    {
      title: "Botón de Arrepentimiento",
      url: "/arrepentimiento",
      key: "arrepentimiento"
    }
  ];

  const productCategories = [
    {
      title: "Aromatizadores Ultrasónicos",
      url: "/aromatizadores-ultrasonicos",
      key: "aromatizadores"
    },
    {
      title: "Difusores de ambiente",
      url: "/difusores-ambiente",
      key: "difusores"
    },
    {
      title: "Velas aromáticas cera de soja",
      url: "/velas-aromaticas",
      key: "velas"
    },
    {
      title: "Todos los productos",
      url: "/productos",
      key: "productos"
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook size={20} />, url: "https://facebook.com" },
    { icon: <FaInstagram size={20} />, url: "https://www.instagram.com/lu.petruccelli/" },
    
  ];

  return (
    <>
      {/* Div flotante para información adicional */}
      {showFloatingDiv && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{floatingContent?.title}</h3>
              <button 
                onClick={closeFloatingDiv}
                className="text-gray-500 hover:text-black"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700">{floatingContent?.content}</p>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button 
                onClick={closeFloatingDiv}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-black text-white px-4 sm:px-6 py-8 sm:py-12 font-sans relative">
        <div className="max-w-7xl mx-auto">
          {/* Newsletter Section */}
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="text-xl sm:text-2xl font-light mb-4">Recibí Novedades y Beneficios!</h2>
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  className="w-full px-4 py-2 bg-transparent border-b border-white text-white placeholder-gray-400 focus:outline-none focus:border-gray-400"
                  placeholder="Ingresa tu email"
                />
                {emailError && (
                  <p className="text-red-400 text-sm mt-1">{emailError}</p>
                )}
                {isSubscribed && (
                  <p className="text-green-400 text-sm mt-1">¡Gracias por suscribirte!</p>
                )}
              </div>
              <button
                type="submit"
                className="bg-white text-black px-6 py-2 text-sm uppercase tracking-wider hover:bg-gray-200 transition-colors duration-200"
              >
                Suscribirme
              </button>
            </form>
          </div>

          {/* Footer Links - Acordeón para móviles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Column 1 - Compañía */}
            <div className="border-b border-gray-800 md:border-none pb-4 md:pb-0">
              <div 
                className="flex justify-between items-center cursor-pointer md:cursor-auto"
                onClick={() => toggleSection('company')}
              >
                <h3 className="text-lg font-medium uppercase tracking-wider">Compañía</h3>
                <span className="md:hidden">
                  {openSections['company'] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              <div className={`${openSections['company'] ? 'block' : 'hidden'} md:block mt-4 md:mt-4`}>
                <ul className="space-y-2">
                  {footerSections.map((item, index) => (
                    <li key={index}>
                      <div 
                        onClick={() => handleFloatingContent(item.key)}
                        className="text-gray-300 hover:text-white transition-colors duration-200 block py-1 cursor-pointer"
                      >
                        {item.title}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2 - Contacto */}
            <div className="border-b border-gray-800 md:border-none pb-4 md:pb-0">
              <div 
                className="flex justify-between items-center cursor-pointer md:cursor-auto"
                onClick={() => toggleSection('contact')}
              >
                <h3 className="text-lg font-medium uppercase tracking-wider">Contacto</h3>
                <span className="md:hidden">
                  {openSections['contact'] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              <div className={`${openSections['contact'] ? 'block' : 'hidden'} md:block mt-4 md:mt-4`}>
                <ul className="space-y-2">
                  {footerContact.map((item, index) => (
                    <li key={index}>
                      <div 
                        onClick={() => handleFloatingContent(item.key)}
                        className="text-gray-300 hover:text-white transition-colors duration-200 block py-1 cursor-pointer"
                      >
                        {item.title}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 3 - Productos */}
            <div className="border-b border-gray-800 md:border-none pb-4 md:pb-0">
              <div 
                className="flex justify-between items-center cursor-pointer md:cursor-auto"
                onClick={() => toggleSection('products')}
              >
                <h3 className="text-lg font-medium uppercase tracking-wider">Productos</h3>
                <span className="md:hidden">
                  {openSections['products'] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              <div className={`${openSections['products'] ? 'block' : 'hidden'} md:block mt-4 md:mt-4`}>
                <ul className="space-y-2">
                  {productCategories.map((item, index) => (
                    <li key={index}>
                      <div 
                        onClick={() => handleFloatingContent(item.key)}
                        className="text-gray-300 hover:text-white transition-colors duration-200 block py-1 cursor-pointer"
                      >
                        {item.title}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-8 sm:mb-12">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors duration-200"
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Contact Email */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <a href="mailto:lufpetruccelli@gmail.com" className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
              <FaEnvelope className="mr-2" />
              lufpetruccelli@gmail.com
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-400 text-xs sm:text-sm">
            <p>© 2025 LUCIANA PETRUCCELLI –  Lifestyle Decoration. TODOS LOS DERECHOS RESERVADOS.</p>
            <p className="mt-1">DESIGNED & DEVELOPED BY EMPTY_DEVELOPMENT & <a className="bg-white text-black rounded hover:text-gray-300 transition-colors duration-200 m-2" href="https://www.linkedin.com/in/tomasmanazza/">Tomás Manazza  </a> | FULL STACK DEVELOPMENT EXPERTS</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;