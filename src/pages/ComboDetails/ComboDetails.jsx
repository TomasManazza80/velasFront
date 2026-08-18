import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { Add } from "../../store/redux/cart/CartAction";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faChevronLeft,
  faChevronRight,
  faCheck,
  faGift,
  faBagShopping,
  faTag,
  faZap,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

const LuStyles = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lato:wght@300;400&family=Montserrat:wght@300;400;500&display=swap');

.lu-title { font-family: 'Montserrat', sans-serif; text-transform: uppercase; letter-spacing: 0.15em; }
.lu-body { font-family: 'Lato', sans-serif; font-weight: 300; }
.lu-script { font-family: 'Inter', sans-serif; font-size: 2.5rem; color: #cba394; }

.lu-card {
    background-color: #f9f3f2;
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.lu-gradient-btn {
    background: linear-gradient(135deg, #cba394 0%, #b07d6b 100%);
    transition: opacity 0.3s ease;
}

.lu-gradient-btn:hover {
    opacity: 0.9;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const formatPrice = (price) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace("ARS", "$");
};

function ComboDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [combo, setCombo] = useState(null);
  const [otherCombos, setOtherCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchComboData = async () => {
      try {
        setLoading(true);
        // Obtener el detalle del combo por ID
        const res = await axios.get(`${API_URL}/api/combos/${id}`);
        setCombo(res.data);

        // Obtener otros combos activos para recomendaciones
        const allRes = await axios.get(`${API_URL}/api/combos?onlyActive=true`);
        const filtered = (allRes.data || []).filter((c) => String(c.id) !== String(id));
        setOtherCombos(filtered);
      } catch (error) {
        console.error("Error al cargar el detalle del combo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComboData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const handleAddToCart = () => {
    if (!combo) return;
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
        quantity: quantity,
        color: "Combo Promocional",
        storage: "Único",
      })
    );

    Swal.fire({
      title: "COMBO AGREGADO A LA BOLSA",
      text: combo.nombre,
      icon: "success",
      background: "#f9f3f2",
      color: "#333333",
      confirmButtonColor: "#cba394",
      showConfirmButton: false,
      timer: 1600,
    });
  };

  if (loading) {
    return (
      <div className="bg-[#ffffff] min-h-screen pt-24 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#cba394] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="lu-title text-xs text-[#999999] tracking-widest">Cargando Combo Promocional...</span>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="bg-[#ffffff] min-h-screen pt-24 pb-20 text-center container mx-auto px-4">
        <h2 className="lu-title text-2xl text-[#333333] mb-4">Combo No Encontrado</h2>
        <p className="lu-body text-sm text-[#999999] mb-8">El combo solicitado no está disponible o ha finalizado su promoción.</p>
        <Link
          to="/"
          className="inline-block bg-[#333333] text-white px-8 py-3 rounded-full lu-title text-xs tracking-widest hover:bg-[#b07d6b] transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const currentPrice = Number(combo.precio) || 0;
  const origPrice = Number(combo.precioOriginal) || 0;
  const hasDiscount = origPrice > currentPrice;
  const savings = hasDiscount ? origPrice - currentPrice : 0;
  const discountPercent = hasDiscount ? Math.round(((origPrice - currentPrice) / origPrice) * 100) : 0;

  const itemsList = Array.isArray(combo.productosIncluidos)
    ? combo.productosIncluidos
    : typeof combo.productosIncluidos === "string"
    ? combo.productosIncluidos.split("\n").filter(Boolean)
    : [];

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Quisiera consultar sobre el combo promocional: "${combo.nombre}" (Precio: ${formatPrice(currentPrice)})`
  );

  return (
    <div className="bg-[#ffffff] min-h-screen text-[#333333] lu-body antialiased pb-32 md:pb-20">
      <style dangerouslySetInnerHTML={{ __html: LuStyles }} />

      <div className="container mx-auto max-w-6xl px-4 pt-4 md:pt-10">
        
        {/* NAVEGACIÓN BREADCRUMB */}
        <nav className="flex items-center mt-[20px] gap-3 mb-8 md:mb-12 lu-title text-[10px] text-[#999999]">
          <Link to="/" className="hover:text-[#b07d6b] transition-colors truncate">
            LUPETRUCCELLI
          </Link>
          <div className="w-1 h-1 rotate-45 border border-[#cba394]"></div>
          <Link to="/" className="hover:text-[#b07d6b] transition-colors truncate">
            COMBOS PROMOCIONALES
          </Link>
          <div className="w-1 h-1 rotate-45 border border-[#cba394]"></div>
          <span className="text-[#b07d6b] truncate">{combo.nombre}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* SECCIÓN A: VISUALIZADOR DEL COMBO (IMAGEN DESTACADA + BADGES) */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square lu-card rounded-2xl md:rounded-[2rem] overflow-hidden flex items-center justify-center p-6 md:p-10 shadow-sm border border-[#e0d7cc]/60">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={combo.imagen || "https://via.placeholder.com/600x600?text=Combo+Promocional"}
                alt={combo.nombre}
                className="w-full h-full object-contain drop-shadow-md"
              />

              {/* OVERLAYS BADGES */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                {combo.badge && (
                  <span className="bg-[#333333] text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md">
                    {combo.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-[#b07d6b] text-white text-[11px] font-extrabold uppercase px-3.5 py-1.5 rounded-full shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {hasDiscount && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-[#cba394]/40 text-[#b07d6b] text-xs font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faTag} />
                  <span>¡Ahorrás {formatPrice(savings)} en este combo!</span>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN B: DETALLES Y ACCIONES DEL COMBO */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <header className="mb-6 md:mb-8 text-center lg:text-left">
              <span className="lu-script block mb-2 text-[#cba394] text-3xl">
                Promoción Exclusiva
              </span>

              <h1 className="lu-title text-2xl sm:text-3xl md:text-4xl font-light text-[#333333] leading-tight mb-3">
                {combo.nombre}
              </h1>

              {combo.subtitulo && (
                <p className="lu-body text-sm md:text-base text-gray-500 italic mb-4">
                  {combo.subtitulo}
                </p>
              )}

              {/* SECCIÓN DE PRECIOS */}
              <div className="flex flex-col gap-2 items-center lg:items-start pt-2 border-t border-gray-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-[#b07d6b]">
                    {formatPrice(currentPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg md:text-xl text-gray-400 line-through font-medium">
                      {formatPrice(origPrice)}
                    </span>
                  )}
                </div>

                <div className="lu-title text-[10px] flex items-center gap-2 text-[#cba394]">
                  <FontAwesomeIcon icon={faZap} />
                  <span>PRECIO ESPECIAL POR TIEMPO LIMITADO</span>
                </div>
              </div>
            </header>

            {/* LISTA DE PRODUCTOS INCLUIDOS EN EL COMBO */}
            {itemsList.length > 0 && (
              <div className="mb-8 p-5 bg-[#f9f3f2] rounded-2xl border border-[#cba394]/30">
                <div className="flex items-center gap-2 mb-3">
                  <FontAwesomeIcon icon={faGift} className="text-[#b07d6b]" />
                  <span className="lu-title text-xs font-bold text-[#333333] tracking-wider uppercase">
                    Productos Incluidos en este Combo:
                  </span>
                </div>

                <div className="space-y-2.5">
                  {itemsList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs md:text-sm text-gray-800 font-medium">
                      <div className="w-5 h-5 rounded-full bg-[#cba394]/20 flex items-center justify-center text-[#b07d6b] flex-shrink-0">
                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DESCRIPCIÓN ADICIONAL DEL COMBO */}
            {combo.descripcion && (
              <div className="mb-8 text-center lg:text-left">
                <span className="lu-title text-[10px] text-gray-400 block mb-2">DETALLES Y FRAGANCIAS</span>
                <p className="lu-body text-xs md:text-sm text-gray-600 leading-relaxed">
                  {combo.descripcion}
                </p>
              </div>
            )}

            {/* CONTROLES DE CANTIDAD Y BOTÓN DE AGREGAR AL CARRITO */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                
                {/* SELECTOR DE CANTIDAD */}
                <div className="flex items-center border border-[#cba394]/40 rounded-full bg-[#f9f3f2] p-1 h-12">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-[#333333] transition-colors"
                  >
                    <FontAwesomeIcon icon={faMinus} className="text-xs" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-[#333333]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-[#333333] transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                  </button>
                </div>

                {/* BOTÓN PRINCIPAL DE AGREGAR AL CARRITO */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 w-full h-12 rounded-full bg-[#333333] hover:bg-[#b07d6b] text-white lu-title text-xs tracking-widest flex items-center justify-center gap-3 shadow-lg transition-all"
                >
                  <FontAwesomeIcon icon={faBagShopping} />
                  <span>AGREGAR COMBO AL CARRITO</span>
                </button>
              </div>

              {/* BOTÓN DE CONSULTA WHATSAPP */}
              <button
                onClick={() => window.open(`https://wa.me/+543425937358?text=${whatsappMessage}`, "_blank")}
                className="w-full h-12 rounded-full border border-[#cba394]/40 text-[#b07d6b] hover:bg-[#f9f3f2] lu-title text-xs tracking-widest flex items-center justify-center gap-3 transition-colors"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-lg text-emerald-600" />
                <span>CONSULTAR POR WHATSAPP</span>
              </button>
            </div>

          </div>
        </div>

        {/* SECCIÓN C: OTROS COMBOS RECOMENDADOS */}
        {otherCombos.length > 0 && (
          <div className="mt-24 pt-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <span className="lu-script block mb-2 text-[#cba394] text-2xl">Otras Promociones</span>
              <h2 className="lu-title text-2xl md:text-3xl text-[#333333] tracking-[0.15em] uppercase">
                COMBOS RELACIONADOS
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherCombos.slice(0, 3).map((item) => {
                const itemPrice = Number(item.precio) || 0;
                const itemOrigPrice = Number(item.precioOriginal) || 0;
                const itemHasDiscount = itemOrigPrice > itemPrice;

                return (
                  <Link
                    key={item.id}
                    to={`/combo/${item.id}`}
                    className="bg-[#f9f3f2] rounded-2xl overflow-hidden border border-[#e0d7cc]/60 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="relative aspect-square bg-white overflow-hidden p-4">
                      <img
                        src={item.imagen || "https://via.placeholder.com/400"}
                        alt={item.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.badge && (
                        <span className="absolute top-3 left-3 bg-[#333333] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <span className="lu-title text-[9px] text-[#999999] block mb-1">COMBO PROMOCIONAL</span>
                      <h3 className="lu-title text-sm font-bold text-[#333333] truncate group-hover:text-[#b07d6b] transition-colors">
                        {item.nombre}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="lu-title text-base font-bold text-[#333333]">
                          {formatPrice(itemPrice)}
                        </span>
                        {itemHasDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(itemOrigPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ComboDetails;
