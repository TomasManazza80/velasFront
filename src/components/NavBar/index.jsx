import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faCartShopping,
    faXmark,
    faChevronDown,
    faUser,
    faSignOutAlt,
    faMicrochip,
    faHouse,
    faMobileScreen,
    faCircleInfo,
    faEnvelope,
    faShieldHalved,
    faTerminal,
    faDollarSign,
    faWrench
} from "@fortawesome/free-solid-svg-icons";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import authContext from "../../store/store";
import { useContext, useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Mantengo tu import para no romper rutas, aunque usaremos tipografía para el logo
import logoWhite from "../../images/logoWhite.png";
import logoBlack from "../../images/logo.png"

import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

// =================================================================
// ESTILOS LU: MINIMALIST LUXURY
// =================================================================
const LuNavbarStyles = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lato:wght@300;400&family=Montserrat:wght@300;400;500&display=swap');

:root {
    --header-height: 80px;
    --lu-rose: #cba394;
    --lu-rose-dark: #b07d6b;
    --lu-dark: #333333;
    --lu-nude: #f9f3f2;
    --transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.navbar-header {
    position: fixed;
    width: 100%;
    z-index: 1000;
    transition: var(--transition);
}

.navbar-header.menu-open {
    z-index: 9999;
}

.lu-title { font-family: 'Montserrat', sans-serif; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; }
.lu-body { font-family: 'Lato', sans-serif; font-weight: 300; }
.lu-script { font-family: 'Great Vibes', cursive; }

/* HEADER STATES */
.header-transparent {
    background-color: transparent;
    padding: 15px 0;
    border-bottom: 1px solid transparent;
}

.header-solid {
    background-color: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(15px);
    border-bottom: 1px solid rgba(203, 163, 148, 0.15);
    padding: 0;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
}

.navbar-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 4rem;
    height: var(--header-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@media (max-width: 1024px) {
    .navbar-container { padding: 0 1.5rem; }
    :root { --header-height: 70px; }
    .header-solid { background-color: #ffffff; }
}

/* NAVIGATION LINKS */
.nav-link {
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--lu-dark);
    transition: all 0.4s ease;
    position: relative;
    padding: 0.4rem 0;
}

/* Color adaptativo cuando el header es transparente vs sólido */
.header-transparent .nav-link {
    color: var(--lu-dark); /* Ajusta a #ffffff si el hero de inicio es oscuro */
}

.nav-link:hover, .nav-link.active {
    color: var(--lu-rose-dark);
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 0;
    height: 1px;
    background: var(--lu-rose);
    transition: var(--transition);
    transform: translateX(-50%);
}

.nav-link.active::after, .nav-link:hover::after {
    width: 100%;
}

.admin-link {
    color: var(--lu-rose-dark) !important;
    position: relative;
    margin-left: 1rem;
}
.admin-link::before {
    content: '✦';
    position: absolute;
    left: -15px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 8px;
    color: var(--lu-rose);
}

/* ACCOUNT BUTTONS */
.account-button {
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    background: transparent;
    border: 1px solid var(--lu-rose);
    color: var(--lu-rose-dark);
    padding: 10px 24px;
    transition: all 0.4s ease;
    cursor: pointer;
    border-radius: 1px;
}

.account-button:hover {
    background: linear-gradient(135deg, #cba394 0%, #b07d6b 100%);
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(203, 163, 148, 0.2);
}

/* CART */
.cart-icon {
    font-size: 1rem;
    transition: var(--transition);
    color: var(--lu-dark);
    font-weight: 300;
}

.header-transparent .cart-icon {
    color: var(--lu-dark); 
}

.cart-icon:hover { color: var(--lu-rose); }

.cart-badge {
    position: absolute;
    top: 0px;
    right: 0px;
    background: var(--lu-nude);
    color: var(--lu-rose-dark);
    border: 1px solid var(--lu-rose);
    font-family: 'Montserrat', sans-serif;
    font-weight: 500;
    font-size: 8px;
    height: 16px;
    min-width: 16px;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

/* MOBILE DRAWER */
.mobile-drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    max-width: 320px;
    background: #ffffff;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    box-shadow: 10px 0 40px rgba(0, 0, 0, 0.05);
}

.drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(51, 51, 51, 0.2);
    backdrop-filter: blur(5px);
    z-index: 1999;
}

.mobile-item {
    border-bottom: 1px solid var(--lu-nude);
    padding: 1.2rem 2rem;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    transition: background 0.3s ease;
}

.mobile-item:hover {
    background: var(--lu-nude);
}

.mobile-link {
    font-family: 'Montserrat', sans-serif;
    font-weight: 300;
    font-size: 0.85rem;
    color: var(--lu-dark);
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    flex: 1;
}

.mobile-link.active { color: var(--lu-rose-dark); font-weight: 400; }

.mobile-icon {
    width: 16px;
    color: var(--lu-rose);
    opacity: 0.8;
}
`;

function Index() {
    const [toggle, setToggle] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const authCtx = useContext(authContext);
    const role = authCtx.role;
    const cartLength = useSelector((state) => state.cart.length);
    const [scrolled, setScrolled] = useState(false);
    const [categories, setCategories] = useState([]);
    const location = useLocation();
    const navbarRef = useRef(null);

    const isHomePage = location.pathname === "/";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/categories`);
                setCategories(res.data || []);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // BLOQUEO DE SCROLL AL ABRIR MENÚ
    useEffect(() => {
        if (toggle) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [toggle]);

    const signOutHandler = () => {
        localStorage.removeItem("token");
        authCtx.setToken(null);
        setToggle(false);
    };

    const NavItem = ({ to, label, isAdminLink = false, isMobile = false, icon = null }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `${isMobile ? "mobile-link" : "nav-link"}${isAdminLink ? " admin-link" : ""}${isActive ? ' active' : ''}`
            }
            onClick={() => setToggle(false)}
        >
            {isMobile && icon && (
                <FontAwesomeIcon icon={icon} className="mobile-icon" />
            )}
            {label}
        </NavLink>
    );

    const menuItems = [
        { label: "Colecciones", path: "/", icon: faHouse },
        { label: "Velas & Aromas", path: "/products", icon: faMobileScreen },
        { label: "Mayoristas", path: "/revendedores", icon: faMobileScreen },
        { label: "Personalizados", path: "/seccionReparaciones", icon: faTerminal },
        { label: "Nuestra Historia", path: "/about", icon: faCircleInfo },
        { label: "Contacto", path: "/contact", icon: faEnvelope },
    ];

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: LuNavbarStyles }} />
            <header className={`navbar-header ${isHomePage && !scrolled ? 'header-transparent' : 'header-solid'} ${toggle ? 'menu-open' : ''}`} ref={navbarRef}>
                <div className="navbar-container">

                    {/* MOBILE TOGGLE (HAMBURGER) */}
                    <button onClick={() => setToggle(!toggle)} className="lg:hidden text-[#333333] text-xl z-[2100] w-10 text-left transition-colors hover:text-[#cba394]">
                        <FontAwesomeIcon icon={toggle ? faXmark : faBars} className={toggle ? "text-[#cba394]" : ""} />
                    </button>

                    {/* LOGO SECTION */}
                    <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
                        <NavLink to="/" onClick={() => setToggle(false)} className="flex items-center">
                            <img src={logoBlack} alt="Logo Lu Petruccelli" className="h-10 md:h-12 w-auto object-contain" />
                        </NavLink>
                    </div>

                    {/* DESKTOP NAVIGATION */}
                    <nav className="hidden lg:flex items-center gap-8 mx-auto">
                        {menuItems.map((item) => (
                            <NavItem key={item.label} to={item.path} label={item.label} />
                        ))}
                        {role === 'tecnico' && <NavItem to="/servicioTecnico" label="Soporte" />}
                        {(role === 'vendedor' || role === 'ventas') && <NavItem to="/empleadoVentas" label="Terminal" />}
                        {role === 'admin' && <NavItem to="/admin" label="Boutique Panel" isAdminLink />}
                    </nav>

                    <div className="flex items-center justify-end gap-8 w-10 lg:w-auto">
                        {/* CART */}
                        <NavLink to="/cart" className="relative p-2 group" onClick={() => setToggle(false)}>
                            <FontAwesomeIcon icon={faCartShopping} className="cart-icon" />
                            {cartLength > 0 && <span className="cart-badge">{cartLength}</span>}
                        </NavLink>

                        {/* AUTH DESKTOP */}
                        <div className="hidden lg:block">
                            {authCtx.token ? (
                                <button onClick={signOutHandler} className="account-button">
                                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                                    Salir
                                </button>
                            ) : (
                                <NavLink to="/login" className="account-button">
                                    <FontAwesomeIcon icon={faUser} className="mr-3" />
                                    Acceso
                                </NavLink>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* MOBILE DRAWER */}
            <AnimatePresence>
                {toggle && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="drawer-backdrop"
                            className="drawer-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setToggle(false)}
                        />

                        {/* Drawer Content */}
                        <motion.div
                            key="drawer-content"
                            className="mobile-drawer"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", ease: "anticipate", duration: 0.5 }}
                        >
                            <div className="p-8 border-b border-[#f9f3f2] flex justify-between items-center bg-[#ffffff]">
                                <span className="lu-script text-2xl text-[#cba394]">Menú</span>
                                <button onClick={() => setToggle(false)} className="text-[#999999] hover:text-[#cba394] transition-colors text-lg">
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-[#ffffff]">
                                <div className="px-8 pt-8 pb-4">
                                    <p className="lu-title text-[9px] text-[#999999] tracking-[0.2em]">Descubrir</p>
                                </div>

                                {menuItems.map((item) => (
                                    <div key={item.label} className="mobile-item">
                                        <NavItem to={item.path} label={item.label} icon={item.icon} isMobile />
                                    </div>
                                ))}

                                {role === 'tecnico' && (
                                    <div className="mobile-item">
                                        <NavItem to="/servicioTecnico" label="SOPORTE" icon={faWrench} isMobile />
                                    </div>
                                )}

                                {(role === 'vendedor' || role === 'ventas') && (
                                    <div className="mobile-item">
                                        <NavItem to="/empleadoVentas" label="TERMINAL VENTAS" icon={faDollarSign} isMobile />
                                    </div>
                                )}

                                {role === 'admin' && (
                                    <div className="mobile-item bg-[#f9f3f2]/50">
                                        <NavItem to="/admin" label="BOUTIQUE PANEL" icon={faShieldHalved} isAdminLink isMobile />
                                    </div>
                                )}

                                {/* CATEGORÍAS MÓVIL - NUEVO */}
                                <div className="mt-8 px-8 pb-4">
                                    <p className="lu-title text-[9px] text-[#999999] tracking-[0.2em]">Categorías</p>
                                </div>
                                <div className="px-8 grid grid-cols-2 gap-3 mb-8">
                                    {categories.slice(0, 5).map((cat) => (
                                        <Link
                                            key={cat.id || cat.categoryName}
                                            to={`/products?category=${cat.categoryName}`}
                                            onClick={() => setToggle(false)}
                                            className="px-4 py-3 bg-[#f9f3f2] text-[#b07d6b] text-[10px] font-bold tracking-widest uppercase text-center rounded-sm hover:bg-[#cba394] hover:text-white transition-colors"
                                        >
                                            {cat.categoryName}
                                        </Link>
                                    ))}
                                    <Link
                                        to="/products"
                                        onClick={() => setToggle(false)}
                                        className="px-4 py-3 border border-[#f9f3f2] text-[#999999] text-[10px] font-bold tracking-widest uppercase text-center rounded-sm"
                                    >
                                        VER TODO
                                    </Link>
                                </div>

                                <div className="mt-8 px-8 pb-4">
                                    <p className="lu-title text-[9px] text-[#999999] tracking-[0.2em]">Mi Cuenta</p>
                                </div>

                                <div className="px-8 pb-8">
                                    {authCtx.token ? (
                                        <button onClick={signOutHandler} className="account-button w-full py-4 flex items-center justify-center gap-3">
                                            <FontAwesomeIcon icon={faSignOutAlt} />
                                            Cerrar Sesión
                                        </button>
                                    ) : (
                                        <NavLink to="/login" className="account-button w-full py-4 flex items-center justify-center gap-3 text-center" onClick={() => setToggle(false)}>
                                            <FontAwesomeIcon icon={faUser} />
                                            Iniciar Sesión
                                        </NavLink>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-[#f9f3f2] text-center mt-auto flex justify-center">
                                <img src={logoBlack} alt="Logo" className="h-6 w-auto object-contain opacity-50 grayscale" />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="pt-[80px] lg:pt-[80px]">
                <Outlet />
            </main>
        </>
    );
}

export default Index;