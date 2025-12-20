import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, faMinus, faTrashAlt, faArrowLeft, 
  faChevronRight, faShoppingBag, faCreditCard, faTag, faCheckCircle 
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const cartActions = {
  update: (item) => ({ type: "UPDATE_CART_QUANTITY", payload: item }),
  remove: (id) => ({ type: "REMOVE_FROM_CART", payload: id }),
  clear: () => ({ type: "CLEAR_CART" }),
};

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [nombre, setNombre] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [shippingOption, setShippingOption] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para el cupón y animación
  const [couponInput, setCouponInput] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);
  const DISCOUNT_CODE = "velahermosa2839";

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 0
    }).format(price).replace('ARS', '$');
  };

  const handleQuantity = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty > 0) dispatch(cartActions.update({ ...item, quantity: newQty }));
  };

  const handleShippingChange = (e) => {
    const option = e.target.value;
    setShippingOption(option);
    const costs = { pickup: 0, capital: 4000, surroundings: 10000, other: 16000 };
    setShippingCost(costs[option] || 0);
  };

  // Lógica de Descuento
  const totalProductos = cart.reduce((a, c) => a + c.price * c.quantity, 0);
  const discountAmount = isCouponApplied ? totalProductos * 0.15 : 0;
  const totalFinal = (totalProductos - discountAmount) + shippingCost;

  const applyCoupon = () => {
    if (couponInput.trim() === DISCOUNT_CODE) {
      setIsCouponApplied(true);
      setShowCouponSuccess(true);
      setCouponInput("");
      // Ocultar notificación después de 4 segundos
      setTimeout(() => setShowCouponSuccess(false), 4000);
    } else {
      alert("Código de cupón inválido");
      setIsCouponApplied(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const pedidoData = {
      nombre,
      celular: cellphone,
      opcionEnvio: shippingOption === "pickup" ? "Retiro en tienda" : "Envío a domicilio",
      calleDireccion: shippingOption === "pickup" ? "Retiro en Local" : address,
      ciudad: city || "Santa Fe",
      provincia: province || "Santa Fe",
      costoEnvio: shippingCost.toString(),
      descuento: discountAmount.toString(),
      totalPagado: totalFinal.toString(),
      productos: cart.map(item => ({
        nombre: item.title,
        cantidad: item.quantity,
        precio: item.price.toString()
      }))
    };

    try {
      await axios.post('https://velasback.onrender.com/enviarPedidoWhatsapp/enviar', pedidoData);
      const response = await axios.post(`${API_URL}/payment/create_payment`, {
        product: { title: "Pedido Web", unit_price: totalFinal, quantity: 1 }
      });
      dispatch(cartActions.clear());
      window.location.href = response.data.payment_url;
    } catch (err) {
      alert("Error al procesar el pedido");
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10 relative">
      
      {/* NOTIFICACIÓN ANIMADA DE CUPÓN */}
      <AnimatePresence>
        {showCouponSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed left-1/2 z-[100] bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-green-400"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <FontAwesomeIcon icon={faCheckCircle} className="text-xl text-white" />
            </div>
            <div>
              <p className="font-bold leading-tight">¡Código Aplicado!</p>
              <p className="text-xs opacity-90 text-green-50">Se ha descontado el 15% de tu compra</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 pt-10">
        <NavLink to="/" className="flex items-center text-gray-500 hover:text-black mb-6 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          <span className="text-sm uppercase tracking-widest">Seguir Comprando</span>
        </NavLink>

        <h1 className="text-3xl font-light mb-8">MI CARRITO ({cart.length})</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border">
            <FontAwesomeIcon icon={faShoppingBag} className="text-5xl text-gray-200 mb-4" />
            <p className="text-gray-500 uppercase tracking-widest">No hay productos en tu bolsa</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LISTA DE PRODUCTOS */}
            <div className="lg:w-2/3 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <img src={item.image} alt={item.title} className="w-20 h-20 object-contain bg-gray-50 rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center border rounded-lg bg-gray-50">
                        <button onClick={() => handleQuantity(item, -1)} className="px-3 py-1 hover:bg-gray-200 transition-colors"><FontAwesomeIcon icon={faMinus} className="text-xs" /></button>
                        <span className="px-3 font-semibold text-sm">{item.quantity}</span>
                        <button onClick={() => handleQuantity(item, 1)} className="px-3 py-1 hover:bg-gray-200 transition-colors"><FontAwesomeIcon icon={faPlus} className="text-xs" /></button>
                      </div>
                      <button onClick={() => dispatch(cartActions.remove(item.id))} className="text-red-400 hover:text-red-600 text-sm"><FontAwesomeIcon icon={faTrashAlt} /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* RESUMEN LATERAL */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-10">
                <h2 className="text-xl font-bold mb-6 border-b pb-4">Resumen</h2>
                
                {/* SECCIÓN DE CUPÓN */}
                <div className="mb-6">
                  <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">¿Tienes un cupón?</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Código" 
                      value={couponInput}
                      disabled={isCouponApplied}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none transition-all ${isCouponApplied ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'focus:border-black'}`}
                    />
                    <button 
                      onClick={applyCoupon}
                      disabled={isCouponApplied}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isCouponApplied ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                      {isCouponApplied ? <FontAwesomeIcon icon={faTag} /> : "Aplicar"}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(totalProductos)}</span></div>
                  
                  {isCouponApplied && (
                    <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex justify-between text-green-600 font-medium">
                      <span>Descuento 15% aplicado</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-between text-gray-600"><span>Envío estimado</span><span className="text-blue-600">{shippingCost > 0 ? formatPrice(shippingCost) : "A elegir"}</span></div>
                  <div className="border-t pt-4 flex justify-between font-bold text-2xl"><span>Total</span><span>{formatPrice(totalFinal)}</span></div>
                </div>
                <button onClick={() => setShowForm(true)} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 flex items-center justify-center gap-2 transition-transform active:scale-95">
                  Continuar con los datos <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FORMULARIO FINAL */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2 text-center uppercase tracking-tighter">Confirmar Pedido</h2>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <input type="text" placeholder="Nombre Completo *" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full p-4 border rounded-xl outline-none focus:border-black" />
                <input type="tel" placeholder="Celular (ej: 549342...)*" required value={cellphone} onChange={(e) => setCellphone(e.target.value)} className="w-full p-4 border rounded-xl outline-none focus:border-black" />
                
                <select value={shippingOption} onChange={handleShippingChange} required className="w-full p-4 border rounded-xl bg-white outline-none focus:border-black">
                  <option value="">Selecciona Método de Envío</option>
                  <option value="pickup">Retiro en Local - Gratis</option>
                  <option value="capital">Santa Fe Capital - $4.000</option>
                  <option value="surroundings">Alrededores - $10.000</option>
                  <option value="other">Resto del País - $16.000</option>
                </select>

                {shippingOption !== "pickup" && shippingOption !== "" && (
                  <div className="space-y-4">
                    <input type="text" placeholder="Dirección *" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-4 border rounded-xl outline-none focus:border-black" />
                  </div>
                )}

                <div className="bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-300 mt-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Subtotal productos:</span>
                    <span>{formatPrice(totalProductos)}</span>
                  </div>
                  {isCouponApplied && (
                    <div className="flex justify-between text-sm text-green-600 mb-1">
                      <span>Descuento (15%):</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-500 mb-3 border-b pb-2">
                    <span>Costo de envío:</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-black">
                    <span>TOTAL A PAGAR:</span>
                    <span>{formatPrice(totalFinal)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button type="submit" disabled={isProcessing} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faCreditCard} />
                    {isProcessing ? "Procesando..." : "Confirmar y Pagar Ahora"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="w-full text-gray-400 text-sm hover:text-black transition-colors">
                    Corregir Carrito
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cart;