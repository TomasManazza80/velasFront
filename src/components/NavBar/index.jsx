import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCartShopping,
  faXmark,
  faChevronDown,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import authContext from "../../store/store";
import { useContext, useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../../images/logo.png";
import logoWhite from "../../images/logoWhite.png";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

// =================================================================
// CSS PURO PROFESIONAL (TODOS LOS ESTILOS ESTÉTICOS Y RESPONSIVOS)
// Ajustes para fuentes más finas y fondo transparente.
// =================================================================
const PureCssStyles = `
/* BASE PROFESIONAL Y RESET */
:root {
    --header-height: 68px;
    --primary-color: #333;
    --secondary-color: #f7f7f7;
    --text-color: #333;
    --text-light: #fefefe;
    --accent-color: #9c9a89ff; /* Color para active/admin */
    --transition-speed: 0.3s;
    --font-weight-regular: 400; /* Nuevo: Regular */
    --font-weight-medium: 500; /* Nuevo: Medium (para enlaces y botones) */
    --font-weight-semibold: 600; /* Nuevo: Semibold (para títulos/elementos más destacados) */
}

body {
    font-family: Arial, sans-serif;
    margin: 0;
}

/* 1. LAYOUT DEL HEADER Y NAVEGACIÓN (RESPONSIVIDAD CON MEDIA QUERIES) */

.navbar-header {
    position: fixed;
    width: 100%;
    z-index: 50;
    transition: background-color var(--transition-speed), box-shadow var(--transition-speed);
}

.navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    height: var(--header-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* LAYOUT: GRUPO IZQUIERDO (Logo + Nav) */
.nav-left-group {
    display: flex;
    align-items: center;
    gap: 3rem; /* Espacio entre Logo y Nav */
}

/* LAYOUT: OCULTAR ELEMENTOS POR DEFECTO (MÓVIL FIRST) */
.nav-menu-desktop,
.navbar-account-desktop {
    display: none;
}

.mobile-toggle-button {
    display: block; /* Mostrar botón hamburguesa */
    cursor: pointer;
    background: none;
    border: none;
    padding: 0.5rem;
    transition: color var(--transition-speed);
}

/* ---------------------------------------------------- */
/* MEDIA QUERY: DESKTOP (> 1024px) */
/* ---------------------------------------------------- */
@media (min-width: 1024px) {
    .nav-menu-desktop {
        display: flex;
        align-items: center;
        gap: 1.5rem; /* Espacio entre los items del menú */
    }

    .navbar-account-desktop {
        display: flex;
        align-items: center;
    }

    .mobile-toggle-button {
        display: none; /* Ocultar botón hamburguesa */
    }
}

/* 2. ESTILOS DE ENLACES Y BOTONES */

/* Estilo General del Nav Item */
.nav-link {
    font-size: 0.875rem; /* 14px */
    font-weight: var(--font-weight-medium); /* Más fino: Medium (500) */
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-decoration: none;
    padding-bottom: 0.375rem;
    border-bottom: 2px solid transparent;
    transition: all var(--transition-speed);
}

/* Estilo para el botón de Login/Logout en escritorio */
.account-button {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium); /* Más fino: Medium (500) */
    text-transform: uppercase;
    text-decoration: none;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    transition: all var(--transition-speed);
    cursor: pointer;
    border: none;
    background: none;
}

/* Estilo del Badge del Carrito */
.cart-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    font-size: 0.75rem;
    font-weight: var(--font-weight-semibold); /* Semibold para mantener visibilidad */
    border-radius: 50%;
    height: 1.25rem;
    width: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid currentColor;
    line-height: 1;
}

/* 3. ESTILOS DINÁMICOS DE ESTADO (Controlados por React) */

/* ESTADO SÓLIDO (Scroll o No-Home) */
.header-solid {
    background-color: var(--text-light);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* Sombra más sutil */
}
.header-solid .nav-link,
.header-solid .account-button {
    color: var(--text-color);
}
.header-solid .nav-link:hover,
.header-solid .account-button:hover {
    color: #000;
    border-color: rgba(0, 0, 0, 0.3);
}
.header-solid .nav-link.active {
    border-color: var(--text-color);
}
.header-solid .cart-icon {
    color: var(--text-color);
}
.header-solid .cart-badge {
    background-color: #dc3545;
    color: white;
}
.header-solid .mobile-toggle-button {
    color: var(--text-color);
}


/* ESTADO TRANSPARENTE (Home, Sin Scroll) */
.header-transparent {
    background-color: transparent; /* Fondo completamente transparente */
    box-shadow: none; /* Sin sombra */
}
.header-transparent .nav-link,
.header-transparent .account-button {
    color: var(--text-light);
}
.header-transparent .nav-link:hover,
.header-transparent .account-button:hover {
    color: white;
    border-color: rgba(255, 255, 255, 0.5);
}
.header-transparent .nav-link.active {
    border-color: var(--text-light);
}
.header-transparent .cart-icon {
    color: var(--text-light);
}
.header-transparent .cart-badge {
    background-color: #dc3545;
    color: white;
}
.header-transparent .mobile-toggle-button {
    color: var(--text-light);
}


/* 4. ESTILOS DEL MENÚ MÓVIL (Overlay) */
.mobile-menu-overlay {
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    height: calc(100vh - var(--header-height));
    overflow-y: auto;
    z-index: 55;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
/* Estilo de fondo para el menú móvil - siempre sólido para mejor lectura */
.mobile-menu-overlay.header-solid { /* Usa el color de fondo sólido */
    background-color: var(--text-light);
}
.mobile-menu-overlay.header-transparent { /* Si el header es transparente, el menú móvil sigue siendo sólido */
    background-color: var(--text-light); 
}

.mobile-nav-list {
    max-width: 1200px; /* Ancho máximo para el menú móvil, para centrar */
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}
.mobile-item {
    padding: 1rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.mobile-item:last-child {
    border-bottom: none;
}
.mobile-link {
    display: block;
    font-size: 1.125rem; /* 18px */
    font-weight: var(--font-weight-semibold); /* Semibold para mobile links */
    text-transform: uppercase;
    text-decoration: none;
    color: var(--text-color);
    transition: opacity var(--transition-speed);
}
.mobile-link.active {
    color: var(--accent-color);
}
.mobile-link:hover {
    opacity: 0.7;
}

/* Sub-menú Mi Cuenta */
.mobile-submenu-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem 0;
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    color: var(--text-color);
    background: none;
    border: none;
    cursor: pointer;
}
.mobile-submenu-links {
    overflow: hidden;
    padding-left: 1rem;
    border-left: 4px solid #ccc;
}
.mobile-submenu-link {
    display: flex;
    align-items: center;
    font-size: 1rem;
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    color: var(--text-color);
    opacity: 0.8;
    transition: opacity 0.3s;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    padding: 0.5rem 0;
    text-decoration: none; /* Para NavLink */
}
.mobile-submenu-link:hover {
    opacity: 1;
}


/* Control de Scroll */
body.mobile-menu-open {
    overflow: hidden;
}
`;
// =================================================================


function Index() {
  const [toggle, setToggle] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const authCtx = useContext(authContext);
  const [role, setRole] = useState(null);
  const cartLength = useSelector((state) => state.cart.length);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navbarRef = useRef(null);

  const isHomePage = location.pathname === "/";

  // --- LÓGICA DE FUNCIONAMIENTO (INMODIFICADA) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target) &&
        toggle
      ) {
        closeNavbar();
      }
    };
    
    if (toggle) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove('mobile-menu-open');
    };
  }, [toggle]);

  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        setScrolled(window.scrollY > 80);
      } else {
        setScrolled(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // --- LÓGICA DE AUTENTICACIÓN (INMODIFICADA) ---
  const isAdmin = async (email) => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const response = await axios.get(`${API_URL}/role/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data === "admin";
    } catch (error) {
      console.error(`Error retrieving user role: ${error}`);
      return false;
    }
  };

  const fetchUserRole = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const isAdminRole = await isAdmin(decoded.email);
      setRole(isAdminRole);
      authCtx.setToken(token);
    } catch (error) {
      console.error("Error decoding token or fetching role:", error);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [authCtx.token]);

  const signOutHandler = () => {
    localStorage.removeItem("token");
    authCtx.setToken(null);
    const notificationEvent = new CustomEvent("showNotification", {
      detail: { message: "Sesión cerrada correctamente", type: "success" },
    });
    window.dispatchEvent(notificationEvent);
    closeNavbar();
  };

  const closeNavbar = () => {
    setToggle(false);
    setIsExpanded(false);
  };

  const toggleHandler = () => {
    setToggle((prevToggle) => !prevToggle);
    setIsExpanded(false);
  };

  // --- OBTENER CLASES DE ESTADO (AHORA SOLO DEVUELVE CLASES CSS PURO) ---
  const getNavbarClass = () => {
    return isHomePage && !scrolled ? 'header-transparent' : 'header-solid';
  };

  const navbarClass = getNavbarClass();

  // --- Animaciones Framer Motion (INMODIFICADA) ---
  const menuVariants = {
    closed: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.07 },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const expandVariants = {
    collapsed: { height: 0, opacity: 0, transition: { duration: 0.2 } },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.05 },
    },
  };

  // --- Componente de Enlace de Navegación (USA CLASES CSS PURO) ---
  const NavItem = ({ to, label, isAdminLink = false, isMobile = false }) => {
    const baseClass = isMobile ? "mobile-link" : "nav-link";
    const adminClass = isAdminLink ? " admin-link" : "";

    return (
        <NavLink
          to={to}
          className={({ isActive }) =>
            `${baseClass}${adminClass}${isActive ? ' active' : ''}`
          }
          onClick={closeNavbar}
        >
          {label}
        </NavLink>
    );
  };

  return (
    <>
      {/* 💥 INYECCIÓN DEL CSS PURO con Media Queries y Estilos */}
      <style dangerouslySetInnerHTML={{ __html: PureCssStyles }} />

      <header
        className={`navbar-header ${navbarClass}`}
        ref={navbarRef}
      >
        <div className="navbar-container">
            
            {/* GRUPO IZQUIERDO: LOGO + NAVEGACIÓN PRINCIPAL */}
            <div className="nav-left-group">
                {/* SECCIÓN 1: LOGO */}
                <NavLink to="/" onClick={closeNavbar}>
                    <img src={navbarClass === 'header-transparent' ? logoWhite : logo} style={{ width: '80px', height: 'auto' }} alt="Logo de la tienda" />
                </NavLink>

                {/* SECCIÓN 2: NAVEGACIÓN CENTRAL (DESKTOP - Ahora alineada horizontalmente por CSS) */}
                <nav className={`nav-menu-desktop ml-[200px]`}> 
                    <NavItem to="/" label="Inicio" />
                    <NavItem to="/products" label="Productos" />
                    <NavItem to="/about" label="Información" />
                    <NavItem to="/contact" label="Contacto" />
                    {role && <NavItem to="/admin" label="Admin" isAdminLink />}
                </nav>
            </div>


            {/* GRUPO DERECHO: CARRITO + CUENTA + MENÚ MÓVIL */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                
                {/* ÍCONO DE CARRITO */}
                <NavLink to="/cart" style={{ position: 'relative', padding: '0.5rem', transition: 'background-color 0.3s' }} onClick={closeNavbar}>
                    <FontAwesomeIcon
                        icon={faCartShopping}
                        className="cart-icon" // Clase para estilo dinámico
                    />
                    {cartLength > 0 && (
                        <span
                            className="cart-badge" // Clase para estilo dinámico
                        >
                            {cartLength}
                        </span>
                    )}
                </NavLink>

                {/* ÍCONO DE CUENTA (SOLO DESKTOP) */}
                <div className="navbar-account-desktop ">
                    {authCtx.token ? (
                        <button
                            onClick={signOutHandler}
                            className="account-button" // Clase para estilo dinámico
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '0.5rem', fontSize: '1rem' }} />
                            Cerrar Sesión
                        </button>
                    ) : (
                        <NavLink
                            to="/login"
                            className="account-button" // Clase para estilo dinámico
                            onClick={closeNavbar}
                        >
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem', fontSize: '1rem' }} />
                            Iniciar Sesión
                        </NavLink>
                    )}
                </div>

                {/* BOTÓN DE MENÚ HAMBURGUESA (SOLO MÓVIL) */}
                <motion.button
                    onClick={toggleHandler}
                    className="mobile-toggle-button"
                    whileTap={{ scale: 0.95 }}
                >
                    <FontAwesomeIcon
                        icon={toggle ? faXmark : faBars}
                        style={{ fontSize: '1.5rem' }}
                    />
                </motion.button>
            </div>
        </div>

        {/* MENÚ DESPLEGABLE PARA MÓVILES */}
        <AnimatePresence>
          {toggle && (
            <motion.div
              className={`mobile-menu-overlay ${navbarClass}`} // Usa la clase del header para un fondo consistente
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <nav className="mobile-nav-list">
                {[
                  { to: "/", label: "INICIO" },
                  { to: "/products", label: "PRODUCTOS" },
                  { to: "/about", label: "INFORMACIÓN" },
                  { to: "/contact", label: "CONTACTO" },
                ].map((item, index) => (
                  <motion.div variants={itemVariants} key={index} className="mobile-item">
                    <NavItem to={item.to} label={item.label} isMobile={true} />
                  </motion.div>
                ))}

                {role && (
                  <motion.div variants={itemVariants} className="mobile-item">
                    <NavItem to="/admin" label="ADMIN" isAdminLink={true} isMobile={true} />
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="mobile-item" style={{ borderBottom: 'none' }}>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mobile-submenu-toggle"
                  >
                    <span>MI CUENTA</span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '0.875rem' }} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={expandVariants}
                        className="mobile-submenu-links"
                      >
                        <motion.div variants={itemVariants}>
                          {authCtx.token ? (
                            <button
                              onClick={signOutHandler}
                              className="mobile-submenu-link"
                            >
                              <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '0.75rem' }} />
                              CERRAR SESIÓN
                            </button>
                          ) : (
                            <NavLink
                              to="/login"
                              onClick={closeNavbar}
                              className="mobile-submenu-link"
                            >
                              <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.75rem' }} />
                              INICIAR SESIÓN
                            </NavLink>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main style={{ paddingTop: '0' }}>
        <Outlet />
      </main>
    </>
  );
}

export default Index;