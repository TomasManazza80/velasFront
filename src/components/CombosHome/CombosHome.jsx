import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { Add } from "../../store/redux/cart/CartAction";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const formatPrice = (price) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace("ARS", "$");
};

const CombosHome = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/combos?onlyActive=true`);
        setCombos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching home combos:", error);
        setCombos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [combos]);

  // MOVIMIENTO CONTINUO AUTOMÁTICO DE DERECHA A IZQUIERDA (Adaptado para Móvil y Desktop)
  useEffect(() => {
    if (loading || combos.length <= 1 || isPaused) return;

    let animationId;
    let lastTime = performance.now();
    const speed = 0.5; // Velocidad para deslizamiento constante y elegante

    const step = (now) => {
      const delta = now - lastTime;
      lastTime = now;

      if (scrollRef.current) {
        const el = scrollRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;

        if (el.scrollLeft >= maxScroll - 2) {
          el.scrollLeft = 0; // Loop continuo
        } else {
          el.scrollLeft += speed * (delta / 16);
        }
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationId);
  }, [combos, loading, isPaused]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = window.innerWidth < 640 ? 220 : 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleAddToCart = (combo, e) => {
    e.preventDefault();
    e.stopPropagation();
    const comboPrice = Number(combo.precio) || 0;

    dispatch(
      Add({
        ProductId: combo.productId || `combo-${combo.id}`,
        id: `combo-${combo.id}`,
        title: `[COMBO] ${combo.nombre}`,
        price: comboPrice,
        precioAlPublico: comboPrice,
        precioMayorista: comboPrice,
        image: combo.imagen || "https://via.placeholder.com/400",
        quantity: 1,
        color: "Combo Promocional",
        storage: "Único",
      })
    );

    Swal.fire({
      title: "COMBO AGREGADO",
      text: combo.nombre,
      icon: "success",
      background: "#f9f3f2",
      color: "#333333",
      confirmButtonColor: "#cba394",
      showConfirmButton: false,
      timer: 1600,
    });
  };

  if (!loading && combos.length === 0) {
    return null;
  }

  // Duplicamos el array si hay varios elementos para garantizar un scroll horizontal continuo infinito
  const displayCombos = combos.length > 2 ? [...combos, ...combos] : combos;

  return (
    <section className="w-full py-4 md:py-8 bg-white border-t border-b border-[#e0d7cc]/40 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .lu-title { font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 300; }
        .lu-script { font-family: 'Inter', sans-serif; color: #cba394; }
        .lu-card { background-color: #f9f3f2; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .lu-card:hover { box-shadow: 0 15px 40px rgba(203, 163, 148, 0.15); transform: translateY(-4px); }
        .touch-scroll-x { -webkit-overflow-scrolling: touch; touch-action: pan-x; }
      ` }} />
      
      <div className="container mx-auto px-3 sm:px-6 md:px-8 max-w-7xl relative z-10">
        
        {/* Encabezado Adaptado a Pantallas Móviles */}
        <div className="flex items-end justify-between mb-3 sm:mb-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="lu-script block text-sm sm:text-xl text-[#cba394] mb-0.5 font-light">
              Promociones
            </span>
            <h2 className="lu-title text-lg sm:text-2xl md:text-3xl text-[#333333] font-light tracking-[0.1em] sm:tracking-[0.15em] uppercase">
              COMBOS
            </h2>
          </motion.div>

          {/* Flechas de Navegación Manual */}
          {!loading && combos.length > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Anterior combo"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#333333]/20 flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? "bg-white text-[#333333] hover:bg-[#333333] hover:text-white shadow-sm cursor-pointer"
                    : "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-40"
                }`}
              >
                <FiChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Siguiente combo"
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#333333]/20 flex items-center justify-center transition-all ${
                  canScrollRight
                    ? "bg-white text-[#333333] hover:bg-[#333333] hover:text-white shadow-sm cursor-pointer"
                    : "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-40"
                }`}
              >
                <FiChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Loading State Adaptado */}
        {loading ? (
          <div className="flex flex-nowrap gap-3 sm:gap-4 overflow-x-auto py-1 w-full scrollbar-none">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[190px] min-w-[190px] sm:w-[240px] sm:min-w-[240px] h-[300px] bg-gray-100 rounded-[1.5rem] sm:rounded-[1.8rem] animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        ) : (
          /* Contenedor Carrusel Automático Horizontal Estricto con flex-nowrap */
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex flex-nowrap items-stretch gap-3 sm:gap-5 overflow-x-auto overflow-y-hidden py-2 px-1 touch-scroll-x scrollbar-none w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style dangerouslySetInnerHTML={{ __html: `.scrollbar-none::-webkit-scrollbar { display: none; }` }} />

            {displayCombos.map((combo, idx) => {
              const currentPrice = Number(combo.precio) || 0;
              const origPrice = Number(combo.precioOriginal) || 0;
              const hasDiscount = origPrice > currentPrice;
              const discountPercent = hasDiscount
                ? Math.round(((origPrice - currentPrice) / origPrice) * 100)
                : 0;

              const itemsList = Array.isArray(combo.productosIncluidos)
                ? combo.productosIncluidos
                : typeof combo.productosIncluidos === "string"
                ? combo.productosIncluidos.split("\n").filter(Boolean)
                : [];

              return (
                <Link
                  to={`/combo/${combo.id}`}
                  key={`${combo.id}-${idx}`}
                  className="w-[190px] min-w-[190px] xs:w-[210px] xs:min-w-[210px] sm:w-[240px] sm:min-w-[240px] lg:w-[260px] lg:min-w-[260px] flex-shrink-0 lu-card flex flex-col relative overflow-hidden rounded-[1.5rem] sm:rounded-[1.8rem] shadow-sm hover:shadow-md transition-shadow group bg-white cursor-pointer"
                >
                  {/* IMAGEN DE LA TARJETA (Aspect Square idéntico al catálogo) */}
                  <div className="relative w-full aspect-square bg-white overflow-hidden">
                    <img
                      src={combo.imagen || "https://via.placeholder.com/600x400?text=Combo+Especial"}
                      alt={combo.nombre}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* OVERLAYS SUPERIORES */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex justify-between items-start z-10">
                      <div className="flex items-center gap-1 flex-wrap">
                        {discountPercent > 0 && (
                          <span className="bg-white/90 backdrop-blur-sm text-[#333333] text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
                            -{discountPercent}%
                          </span>
                        )}
                        {combo.badge && (
                          <span className="bg-[#b07d6b] text-white text-[8px] sm:text-[9px] font-bold uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
                            {combo.badge}
                          </span>
                        )}
                      </div>

                      <div className="bg-white/70 backdrop-blur-sm p-1 sm:p-1.5 rounded-full text-red-500 shadow-sm flex items-center justify-center">
                        <FontAwesomeIcon icon={faHeart} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </div>
                    </div>

                    {/* VARIANTES / PRODUCTOS INCLUIDOS EN PÍLDORA INFERIOR */}
                    {itemsList.length > 0 && (
                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-10 flex items-center bg-white/80 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm border border-white/60">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#fcd34d] border border-white z-30"></div>
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#333333] border border-white -ml-1 z-20"></div>
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#93c5fd] border border-white -ml-1 z-10"></div>
                        <span className="text-[8px] sm:text-[9px] text-[#333333] font-semibold ml-1 sm:ml-1.5">
                          {itemsList.length} ítems
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PARTE INFERIOR DE LA TARJETA (Fondo Nude #f9f3f2) */}
                  <div className="flex flex-col px-3 sm:px-4 pt-2.5 sm:pt-3 pb-3.5 sm:pb-5 bg-[#f9f3f2] flex-1 justify-between relative">
                    <div>
                      <span className="lu-title text-[8px] sm:text-[9px] text-black font-bold mb-0.5 block tracking-[0.15em]">
                        COMBO PROMOCIONAL
                      </span>
                      <h3 className="lu-title text-[11px] sm:text-xs md:text-sm text-black font-extrabold tracking-tight leading-tight truncate mt-0.5">
                        {combo.nombre}
                      </h3>
                      <p className="lu-body text-[10px] sm:text-[11px] text-black font-medium mt-0.5 truncate w-full italic">
                        {combo.subtitulo || "LuPetruccelli"}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1.5 sm:gap-2 mt-2 sm:mt-3 pr-8 sm:pr-10">
                      <span className="lu-title text-sm sm:text-base lg:text-lg font-extrabold text-black">
                        {formatPrice(currentPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[9px] sm:text-[10px] text-gray-700 line-through font-bold">
                          {formatPrice(origPrice)}
                        </span>
                      )}
                    </div>

                    {/* BOTÓN CIRCULAR DE AGREGAR AL CARRITO (Fijo abajo a la derecha) */}
                    <button
                      onClick={(e) => handleAddToCart(combo, e)}
                      aria-label="Agregar al carrito"
                      className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-black hover:bg-[#b07d6b] text-white rounded-full flex justify-center items-center shadow-md hover:scale-110 active:scale-95 transition-all z-30"
                    >
                      <FontAwesomeIcon icon={faCartPlus} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>

                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CombosHome;
