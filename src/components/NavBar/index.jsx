import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCartShopping,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import authContext from "../../store/store";
import { useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../../images/logo.png";


const API_URL = import.meta.env.VITE_API_URL;
// const API_URL = import.meta.env.VITE_API_URL;
function Index() {
  const [toggle, setToggle] = useState(false);
  const authCtx = useContext(authContext);
  const [role, setRole] = useState(null);
  const cartLength = useSelector((state) => state.cart.length);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === "/";

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
    alert("Sign-out successful.");
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

  const toggleHandler = () => setToggle(!toggle);
  const closeNavbar = () => setToggle(false);

  const getNavbarStyle = () => {
    if (isHomePage && !scrolled) {
      return {
        header: "bg-transparent py-5",
        text: "text-white",
        hoverText: "text-gray-200 hover:text-white",
        border: "border-white",
        cartIcon: "text-white",
        cartBadge: "bg-white text-black",
      };
    } else {
      return {
        header: "bg-white shadow-sm py-3",
        text: "text-black",
        hoverText: "text-gray-500 hover:text-black",
        border: "border-black",
        cartIcon: "text-gray-800",
        cartBadge: "bg-black text-white",
      };
    }
  };

  const style = getNavbarStyle();

  return (
    <>
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${style.header}`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <NavLink
            to="/"
            onClick={closeNavbar}
            className={`text-2xl font-light tracking-widest uppercase transition-colors ${style.text}`}
          >
            <img src={logo} className="w-16" alt="" />
          </NavLink>

          <nav className="hidden lg:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${
                  isActive
                    ? `${style.text} border-b ${style.border}`
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

          <button onClick={toggleHandler} className="lg:hidden p-2">
            <FontAwesomeIcon
              icon={toggle ? faXmark : faBars}
              className={`text-xl ${style.text}`}
            />
          </button>
        </div>

        {toggle && (
          <div
            className={`lg:hidden ${
              isHomePage && !scrolled ? "bg-gray-900 bg-opacity-90" : "bg-white"
            }`}
          >
            <nav className="container mx-auto px-4 py-3 flex flex-col space-y-3">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-sm font-medium tracking-widest uppercase py-3 transition-colors ${
                    isActive
                      ? `${style.text} border-b ${style.border}`
                      : isHomePage && !scrolled
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-500 hover:text-black"
                  }`
                }
                onClick={closeNavbar}
              >
                Inicio
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `text-sm font-medium tracking-widest uppercase py-3 transition-colors ${
                    isActive
                      ? `${style.text} border-b ${style.border}`
                      : isHomePage && !scrolled
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-500 hover:text-black"
                  }`
                }
                onClick={closeNavbar}
              >
                Productos
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-sm font-medium tracking-widest uppercase py-3 transition-colors ${
                    isActive
                      ? `${style.text} border-b ${style.border}`
                      : isHomePage && !scrolled
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-500 hover:text-black"
                  }`
                }
                onClick={closeNavbar}
              >
                Información
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-sm font-medium tracking-widest uppercase py-3 transition-colors ${
                    isActive
                      ? `${style.text} border-b ${style.border}`
                      : isHomePage && !scrolled
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-500 hover:text-black"
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
                    `text-sm font-medium tracking-widest uppercase py-3 transition-colors ${
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

              <div
                className={`flex items-center justify-between pt-4 ${
                  isHomePage && !scrolled
                    ? "border-t border-gray-700"
                    : "border-t border-gray-200"
                }`}
              >
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
                    className={`text-sm font-medium tracking-widest uppercase hover:underline ${style.text}`}
                  >
                    Logout
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    className={`text-sm font-medium tracking-widest uppercase hover:underline ${style.text}`}
                    onClick={closeNavbar}
                  >
                    Login
                  </NavLink>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-0">
        <Outlet />
      </main>
    </>
  );
}

export default Index;