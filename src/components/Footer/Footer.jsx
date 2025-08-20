import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

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
      url: "/nuestra-historia"
    },
    {
      title: "Sustentabilidad",
      url: "/sustentabilidad"
    },
    {
      title: "Nuestras Tiendas Exclusivas",
      url: "/tiendas"
    },
    {
      title: "Trabaja con Nosotros",
      url: "/trabaja-con-nosotros"
    },
    {
      title: "Cuidado del Producto",
      url: "/cuidado-del-producto"
    }
  ];

  const footerContact = [
    {
      title: "Mayoristas",
      url: "/mayoristas"
    },
    {
      title: "Información para tu Compra",
      url: "/informacion-compra"
    },
    {
      title: "Términos y Condiciones",
      url: "/terminos-condiciones"
    },
    {
      title: "Botón de Arrepentimiento",
      url: "/arrepentimiento"
    }
  ];

  const productCategories = [
    {
      title: "Aromatizadores Ultrasónicos",
      url: "/aromatizadores-ultrasonicos"
    },
    {
      title: "Difusores de ambiente",
      url: "/difusores-ambiente"
    },
    {
      title: "Velas aromáticas cera de soja",
      url: "/velas-aromaticas"
    },
    {
      title: "Todos los productos",
      url: "/productos"
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook size={20} />, url: "https://facebook.com" },
    { icon: <FaInstagram size={20} />, url: "https://instagram.com" },
    { icon: <FaTwitter size={20} />, url: "https://twitter.com" }
  ];

  return (
    <footer className="bg-black text-white px-6 py-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Section */}
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-light mb-4">Recibí Novedades y Beneficios!</h2>
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

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h3 className="text-lg font-medium mb-4 uppercase tracking-wider">Compañía</h3>
            <ul className="space-y-2">
              {footerSections.map((item, index) => (
                <li key={index}>
                  <a href={item.url} className="text-gray-300 hover:text-white transition-colors duration-200">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-lg font-medium mb-4 uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-2">
              {footerContact.map((item, index) => (
                <li key={index}>
                  <a href={item.url} className="text-gray-300 hover:text-white transition-colors duration-200">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-lg font-medium mb-4 uppercase tracking-wider">Productos</h3>
            <ul className="space-y-2">
              {productCategories.map((item, index) => (
                <li key={index}>
                  <a href={item.url} className="text-gray-300 hover:text-white transition-colors duration-200">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-12">
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
        <div className="flex justify-center mb-8">
          <a href="mailto:info@thecandleshop.com" className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
            <FaEnvelope className="mr-2" />
            info@thecandleshop.com
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-sm">
          <p>© 2024 THE CANDLE SHOP – AIR BEAUTY. TODOS LOS DERECHOS RESERVADOS.</p>
          <p className="mt-1">DESIGNED & DEVELOPED BY INNOVATE GROUP | SHOPIFY EXPERTS</p>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  // Puedes definir PropTypes si es necesario
};

export default Footer;