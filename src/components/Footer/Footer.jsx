import React, { useState } from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";

// =================================================================
// ESTILOS LU: MINIMALIST LUXURY (FOOTER)
// =================================================================
const LuFooterStyles = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lato:wght@300;400&family=Montserrat:wght@300;400;500&display=swap');

.lu-title { font-family: 'Montserrat', sans-serif; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; }
.lu-body { font-family: 'Lato', sans-serif; font-weight: 300; }
.lu-script { font-family: 'Great Vibes', cursive; }

.lu-gradient-btn {
    background: linear-gradient(135deg, #cba394 0%, #b07d6b 100%);
    box-shadow: 0 4px 15px rgba(203, 163, 148, 0.2);
    transition: all 0.4s ease;
}

.lu-gradient-btn:hover {
    opacity: 0.9;
    box-shadow: 0 6px 20px rgba(203, 163, 148, 0.3);
    transform: translateY(-2px);
}

.lu-footer-input {
    background-color: transparent;
    border: none;
    border-bottom: 1px solid rgba(203, 163, 148, 0.4);
    color: #333333;
    transition: all 0.3s ease;
}

.lu-footer-input:focus {
    border-bottom-color: #b07d6b;
    outline: none;
}

/* Modal Scrollbar */
.lu-modal-scroll::-webkit-scrollbar {
    width: 4px;
}
.lu-modal-scroll::-webkit-scrollbar-track {
    background: #f9f3f2; 
}
.lu-modal-scroll::-webkit-scrollbar-thumb {
    background: #cba394; 
    border-radius: 10px;
}
`;

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
        { title: "Nuestra Historia", url: "/nuestra-historia", key: "historia" },
        { title: "Sustentabilidad", url: "/sustentabilidad", key: "sustentabilidad" },
        { title: "Nuestras Tiendas Exclusivas", url: "/tiendas", key: "tiendas" },
        { title: "Trabaja con Nosotros", url: "/trabaja-con-nosotros", key: "trabajo" },
        { title: "Cuidado del Producto", url: "/cuidado-del-producto", key: "cuidado" }
    ];

    const footerContact = [
        { title: "Mayoristas", url: "/mayoristas", key: "mayoristas" },
        { title: "Información para tu Compra", url: "/informacion-compra", key: "compra" },
        { title: "Términos y Condiciones", url: "/terminos-condiciones", key: "terminos" },
        { title: "Botón de Arrepentimiento", url: "/arrepentimiento", key: "arrepentimiento" }
    ];

    const productCategories = [
        { title: "Aromatizadores Ultrasónicos", url: "/aromatizadores-ultrasonicos", key: "aromatizadores" },
        { title: "Difusores de ambiente", url: "/difusores-ambiente", key: "difusores" },
        { title: "Velas aromáticas cera de soja", url: "/velas-aromaticas", key: "velas" },
        { title: "Todos los productos", url: "/productos", key: "productos" }
    ];

    const socialLinks = [
        { icon: <FaFacebook size={18} />, url: "https://facebook.com" },
        { icon: <FaInstagram size={18} />, url: "https://www.instagram.com/lu.petruccelli/" },
    ];

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: LuFooterStyles }} />

            {/* Div flotante / Modal de Información */}
            {showFloatingDiv && (
                <div className="fixed inset-0 bg-[#333333]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#ffffff] text-[#333333] rounded-sm max-w-lg w-full max-h-[85vh] shadow-2xl overflow-hidden flex flex-col transform transition-all">
                        <div className="flex justify-between items-center p-8 border-b border-[#f9f3f2]">
                            <h3 className="lu-title text-[12px] text-[#b07d6b] tracking-widest">{floatingContent?.title}</h3>
                            <button
                                onClick={closeFloatingDiv}
                                className="text-[#999999] hover:text-[#cba394] transition-colors"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto lu-modal-scroll flex-1">
                            <p className="lu-body text-[14px] leading-relaxed text-[#666666] text-center">{floatingContent?.content}</p>
                        </div>
                        <div className="p-8 bg-[#f9f3f2]/50 flex justify-center">
                            <button
                                onClick={closeFloatingDiv}
                                className="px-10 py-3 lu-title text-[10px] tracking-widest border border-[#cba394] text-[#cba394] hover:bg-[#cba394] hover:text-white transition-colors rounded-sm"
                            >
                                VOLVER
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER PRINCIPAL */}
            <footer className="bg-[#f9f3f2] text-[#333333] px-6 sm:px-12 pt-20 pb-10 relative">
                <div className="max-w-6xl mx-auto">

                    {/* Newsletter Section */}
                    <div className="mb-20 text-center">
                        <h2 className="lu-script text-4xl md:text-5xl text-[#cba394] mb-4">Novedades & Beneficios</h2>
                        <p className="lu-body text-[13px] text-[#666666] mb-8">Suscríbete a nuestro newsletter para recibir acceso anticipado y colecciones exclusivas.</p>

                        <form onSubmit={handleSubscribe} className="max-w-md mx-auto relative">
                            <div className="mb-6">
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError("");
                                    }}
                                    className="lu-footer-input w-full px-4 py-3 text-center lu-body text-[14px] placeholder-[#999999]"
                                    placeholder="Tu correo electrónico"
                                />
                                {emailError && (
                                    <p className="text-[#b07d6b] lu-title text-[9px] mt-3 tracking-wider">{emailError}</p>
                                )}
                                {isSubscribed && (
                                    <p className="text-[#cba394] lu-title text-[9px] mt-3 tracking-wider">¡Bienvenida a nuestra comunidad!</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full lu-gradient-btn text-white px-8 py-4 lu-title text-[10px] tracking-widest rounded-sm"
                            >
                                SUSCRIBIRME
                            </button>
                        </form>
                    </div>

                    <div className="w-full h-[1px] bg-[#cba394]/20 mb-16"></div>

                    {/* Footer Links - Acordeón para móviles / Grid para Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 mb-16 text-center md:text-left">

                        {/* Column 1 - Compañía */}
                        <div className="border-b border-[#cba394]/20 md:border-none pb-6 md:pb-0">
                            <div
                                className="flex justify-between items-center cursor-pointer md:cursor-auto"
                                onClick={() => toggleSection('company')}
                            >
                                <h3 className="lu-title text-[11px] text-[#b07d6b] tracking-[0.2em] w-full md:w-auto text-center md:text-left">Compañía</h3>
                                <span className="md:hidden text-[#cba394]">
                                    {openSections['company'] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                </span>
                            </div>
                            <div className={`${openSections['company'] ? 'block' : 'hidden'} md:block mt-6`}>
                                <ul className="space-y-4">
                                    {footerSections.map((item, index) => (
                                        <li key={index}>
                                            <button
                                                onClick={() => handleFloatingContent(item.key)}
                                                className="lu-body text-[13px] text-[#666666] hover:text-[#cba394] transition-colors duration-300 w-full md:w-auto text-center md:text-left"
                                            >
                                                {item.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Column 2 - Contacto */}
                        <div className="border-b border-[#cba394]/20 md:border-none pb-6 md:pb-0">
                            <div
                                className="flex justify-between items-center cursor-pointer md:cursor-auto"
                                onClick={() => toggleSection('contact')}
                            >
                                <h3 className="lu-title text-[11px] text-[#b07d6b] tracking-[0.2em] w-full md:w-auto text-center md:text-left">Contacto & Ayuda</h3>
                                <span className="md:hidden text-[#cba394]">
                                    {openSections['contact'] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                </span>
                            </div>
                            <div className={`${openSections['contact'] ? 'block' : 'hidden'} md:block mt-6`}>
                                <ul className="space-y-4">
                                    {footerContact.map((item, index) => (
                                        <li key={index}>
                                            <button
                                                onClick={() => handleFloatingContent(item.key)}
                                                className="lu-body text-[13px] text-[#666666] hover:text-[#cba394] transition-colors duration-300 w-full md:w-auto text-center md:text-left"
                                            >
                                                {item.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Column 3 - Productos */}
                        <div className="border-b border-[#cba394]/20 md:border-none pb-6 md:pb-0">
                            <div
                                className="flex justify-between items-center cursor-pointer md:cursor-auto"
                                onClick={() => toggleSection('products')}
                            >
                                <h3 className="lu-title text-[11px] text-[#b07d6b] tracking-[0.2em] w-full md:w-auto text-center md:text-left">Colecciones</h3>
                                <span className="md:hidden text-[#cba394]">
                                    {openSections['products'] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                </span>
                            </div>
                            <div className={`${openSections['products'] ? 'block' : 'hidden'} md:block mt-6`}>
                                <ul className="space-y-4">
                                    {productCategories.map((item, index) => (
                                        <li key={index}>
                                            <button
                                                onClick={() => handleFloatingContent(item.key)}
                                                className="lu-body text-[13px] text-[#666666] hover:text-[#cba394] transition-colors duration-300 w-full md:w-auto text-center md:text-left"
                                            >
                                                {item.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-8 border-t border-[#cba394]/20">
                        {/* Social Links */}
                        <div className="flex space-x-8 mb-8">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#cba394] hover:text-[#b07d6b] transition-colors duration-300 transform hover:scale-110"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>

                        {/* Contact Email */}
                        <div className="mb-10">
                            <a href="mailto:lufpetruccelli@gmail.com" className="flex items-center lu-body text-[12px] text-[#666666] hover:text-[#cba394] transition-colors duration-300">
                                <FaEnvelope className="mr-3 text-[#cba394]" />
                                lufpetruccelli@gmail.com
                            </a>
                        </div>

                        {/* Copyright & Créditos */}
                        <div className="text-center">
                            <p className="lu-title text-[8px] tracking-[0.2em] text-[#999999] mb-3">
                                © 2026 LUCIANA PETRUCCELLI – LIFESTYLE DECORATION. TODOS LOS DERECHOS RESERVADOS.
                            </p>
                            <p className="lu-title text-[7px] tracking-[0.15em] text-[#b07d6b]/60">
                                DESIGNED & DEVELOPED BY EMPTY_DEVELOPMENT &{' '}
                                <a
                                    className="text-[#cba394] hover:text-[#b07d6b] transition-colors duration-200 ml-1"
                                    href="https://www.linkedin.com/in/tomasmanazza/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    TOMÁS MANAZZA
                                </a>
                                {' '} | FULL STACK DEVELOPMENT EXPERTS
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;