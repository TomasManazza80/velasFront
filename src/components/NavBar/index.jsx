import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCartShopping,
  faXmark,
  faChevronDown,
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

  // Cerrar menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setToggle(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isHomePage) {
      const handleScroll = () => {
        const isScrolled = window.scrollY > 10;
        setScrolled(isScrolled);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setScrolled(true);
    }
  }, [isHomePage]);

  const signOutHandler = () => {
    localStorage.removeItem("token");
    authCtx.setToken(null);
    
    // Mostrar notificación de cierre de sesión
    const notificationEvent = new CustomEvent('showNotification', {
      detail: {
        message: 'Sesión cerrada correctamente',
        type: 'success'
      }
    });
    window.dispatchEvent(notificationEvent);
    
    closeNavbar();
  };

  const isAdmin = async (email) => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const response = await axios.get(`${API_URL}/role/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data == "admin";
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
  }, []);

  const toggleHandler = () => {
    setToggle(!toggle);
    if (toggle) {
      setIsExpanded(false);
    }
  };
  
  const closeNavbar = () => {
    setToggle(false);
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getNavbarStyle = () => {
    if (isHomePage && !scrolled) {
      return {
        header: "bg-transparent py-5",
        text: "text-white",
        hoverText: "text-gray-200 hover:text-white",
        border: "border-white",
        cartIcon: "text-white",
        cartBadge: "bg-white text-black",
        logo: logoWhite,
        mobileMenu: "bg-gray-900 bg-opacity-95",
        mobileText: "text-white",
        mobileHover: "hover:text-gray-200",
        mobileBorder: "border-gray-700",
        mobileButton: "text-white"
      };
    } else {
      return {
        header: "bg-white shadow-sm py-3",
        text: "text-black",
        hoverText: "text-gray-600 hover:text-black",
        border: "border-black",
        cartIcon: "text-gray-800",
        cartBadge: "bg-black text-white",
        logo: logo,
        mobileMenu: "bg-white",
        mobileText: "text-gray-800",
        mobileHover: "hover:text-black",
        mobileBorder: "border-gray-200",
        mobileButton: "text-gray-800"
      };
    }
  };

  const style = getNavbarStyle();

  // Animaciones
  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const expandVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  return (
    <>
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${style.header}`}
        ref={navbarRef}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Contenedor izquierdo: Logo y carrito (solo en móvil) */}
          <div className="flex items-center">
            <NavLink
              to="/"
              onClick={closeNavbar}
              className={`text-2xl font-light tracking-widest uppercase transition-colors ${style.text}`}
            >
              <img src={style.logo} className="w-16 " alt="Logo" />
            </NavLink>
            
            {/* Carrito en versión móvil - al lado del logo */}
            <NavLink to="/cart" className="relative ml-4 lg:hidden" onClick={closeNavbar}>
              <FontAwesomeIcon
                icon={faCartShopping}
            className={`text-lg ${style.cartIcon} ml-[300px] relative top-[38px]`}
              />
              {cartLength > 0 && (
                <span
                  className={`absolute -top-2 -right-2 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${style.cartBadge}`}
                >
                  {cartLength}
                </span>
              )}
            </NavLink>
          </div>

          {/* Navegación para desktop (oculta en móviles) */}
          <nav className=" hidden lg:flex items-right space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                ` text-xs font-medium tracking-widest uppercase transition-colors duration-200  ${
                  isActive
                    ? `${style.text}  border-b ${style.border}`
                    : style.hoverText
                }`
              }
              onClick={closeNavbar}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${
                  isActive
                    ? `${style.text} border-b ${style.border}`
                    : style.hoverText
                }`
              }
              onClick={closeNavbar}
            >
              Productos
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${
                  isActive
                    ? `${style.text} border-b ${style.border}`
                    : style.hoverText
                }`
              }
              onClick={closeNavbar}
            >
              Información
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${
                  isActive
                    ? `${style.text} border-b ${style.border}`
                    : style.hoverText
                }`
              }
              onClick={closeNavbar}
            >
              Contacto
            </NavLink>
            {role && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${
                    isActive
                      ? "text-purple-600 border-b border-purple-600"
                      : "text-purple-500 hover:text-purple-600"
                  }`
                }
                onClick={closeNavbar}
              >
                Admin
              </NavLink>
            )}
          </nav>

          {/* Contenedor derecho: Elementos de desktop y botón de menú móvil */}
          <div className="flex items-center">
            {/* Elementos de la derecha (carrito, login/logout) - ocultos en móviles */}
            <div className="hidden lg:flex items-center space-x-6">
              <NavLink to="/cart" className="relative" onClick={closeNavbar}>
                <FontAwesomeIcon
                  icon={faCartShopping}
                  className={`text-lg ${style.cartIcon}`}
                />
                {cartLength > 0 && (
                  <span
                    className={`absolute -top-2 -right-2 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${style.cartBadge}`}
                  >
                    {cartLength}
                  </span>
                )}
              </NavLink>

              {authCtx.token ? (
                <button
                  onClick={signOutHandler}
                  className={`text-xs font-medium tracking-widest uppercase hover:underline ${style.text}`}
                >
                  Logout
                </button>
              ) : (
                <NavLink
                  to="/login"
                  className={`text-xs font-medium tracking-widest uppercase hover:underline ${style.text}`}
                  onClick={closeNavbar}
                >
                  Login
                </NavLink>
              )}
            </div>

            {/* Botón de menú hamburguesa (solo visible en móviles) */}
            <motion.button 
              onClick={toggleHandler} 
              className="lg:hidden p-2 ml-4"
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon
                icon={toggle ? faXmark : faBars}
                className={`text-xl ${style.text}`}
              />
            </motion.button>
          </div>
        </div>

        {/* Menú desplegable para móviles con animaciones */}
        <AnimatePresence>
          {toggle && (
            <motion.div
              className={`lg:hidden overflow-hidden ${isHomePage && !scrolled ? 'bg-gray-900 bg-opacity-95' : 'bg-white'}`}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <nav className="container mx-auto px-4 py-3 flex flex-col">
                <motion.div variants={itemVariants} className="py-3">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `block text-sm font-medium tracking-widest uppercase transition-colors py-2 ${
                        isActive
                          ? `${isHomePage && !scrolled ? 'text-white' : 'text-black'} font-bold`
                          : isHomePage && !scrolled ? 'text-gray-200 hover:text-white' : 'text-gray-600 hover:text-black'
                      }`
                    }
                    onClick={closeNavbar}
                  >
                    INICIO
                  </NavLink>
                </motion.div>
                
                <motion.div variants={itemVariants} className="py-3">
                  <NavLink
                    to="/products"
                    className={({ isActive }) =>
                      `block text-sm font-medium tracking-widest uppercase transition-colors py-2 ${
                        isActive
                          ? `${isHomePage && !scrolled ? 'text-white' : 'text-black'} font-bold`
                          : isHomePage && !scrolled ? 'text-gray-200 hover:text-white' : 'text-gray-600 hover:text-black'
                      }`
                    }
                    onClick={closeNavbar}
                  >
                    PRODUCTOS
                  </NavLink>
                </motion.div>
                
                <motion.div variants={itemVariants} className="py-3">
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      `block text-sm font-medium tracking-widest uppercase transition-colors py-2 ${
                        isActive
                          ? `${isHomePage && !scrolled ? 'text-white' : 'text-black'} font-bold`
                          : isHomePage && !scrolled ? 'text-gray-200 hover:text-white' : 'text-gray-600 hover:text-black'
                      }`
                    }
                    onClick={closeNavbar}
                  >
                    INFORMACIÓN
                  </NavLink>
                </motion.div>
                
                <motion.div variants={itemVariants} className="py-3">
                  <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                      `block text-sm font-medium tracking-widest uppercase transition-colors py-2 ${
                        isActive
                          ? `${isHomePage && !scrolled ? 'text-white' : 'text-black'} font-bold`
                          : isHomePage && !scrolled ? 'text-gray-200 hover:text-white' : 'text-gray-600 hover:text-black'
                      }`
                    }
                    onClick={closeNavbar}
                  >
                    CONTACTO
                  </NavLink>
                </motion.div>

                {role && (
                  <motion.div variants={itemVariants} className="py-3">
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        `block text-sm font-medium tracking-widest uppercase transition-colors py-2 ${
                          isActive
                            ? "text-purple-600 font-bold"
                            : "text-purple-500 hover:text-purple-600"
                        }`
                      }
                      onClick={closeNavbar}
                    >
                      ADMIN
                    </NavLink>
                  </motion.div>
                )}

                {/* Sección expandible para elementos de cuenta */}
                <motion.div variants={itemVariants}>
                  <button 
                    onClick={toggleExpand}
                    className={`flex items-center justify-between w-full py-4 ${
                      isHomePage && !scrolled ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'
                    } border-t`}
                  >
                    <span className="text-sm font-medium tracking-widest uppercase">
                      MI CUENTA
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FontAwesomeIcon 
                        icon={faChevronDown} 
                        className={`text-sm ${isHomePage && !scrolled ? 'text-white' : 'text-gray-800'}`} 
                      />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={expandVariants}
                        className="overflow-hidden pl-4"
                      >
                        <motion.div variants={itemVariants} className="py-3">
                          {authCtx.token ? (
                            <button
                              onClick={signOutHandler}
                              className={`text-sm font-medium tracking-widest uppercase ${
                                isHomePage && !scrolled ? 'text-white hover:text-gray-200' : 'text-gray-800 hover:text-black'
                              }`}
                            >
                              CERRAR SESIÓN
                            </button>
                          ) : (
                            <NavLink
                              to="/login"
                              className={`text-sm font-medium tracking-widest uppercase ${
                                isHomePage && !scrolled ? 'text-white hover:text-gray-200' : 'text-gray-800 hover:text-black'
                              }`}
                              onClick={closeNavbar}
                            >
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

      <main className="pt-0">
        <Outlet />
      </main>
    </>
  );
}

export default Index;