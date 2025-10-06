import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrashAlt, faArrowLeft, faCheckCircle, faTruck, faMapMarkerAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { useForm } from "@formspree/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Definimos las acciones del carrito
const cartActions = {
  add: (item) => ({ type: "ADD_TO_CART", payload: item }),
  remove: (id) => ({ type: "REMOVE_FROM_CART", payload: id }),
  update: (item) => ({ type: "UPDATE_CART_QUANTITY", payload: item }),
  clear: () => ({ type: "CLEAR_CART" }),
};

const API_URL = import.meta.env.VITE_API_URL;
const FORMSPREE_FORM_ID = "xjkekaqa";

// Animaciones
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

const itemAnimation = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function Cart() {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [cellphone, setCellphone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [shippingOption, setShippingOption] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingNote, setShippingNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const [formspreeState, formspreeHandleSubmit] = useForm(FORMSPREE_FORM_ID);

  useEffect(() => {
    // Si Formspree tuvo éxito, iniciamos el proceso de pago
    if (formspreeState.succeeded) {
      createPayment();
    }
  }, [formspreeState.succeeded]);

  // Mostrar notificación
  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price || 0);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice).replace('ARS', '$');
  };

  const handleShippingChange = (e) => {
    const option = e.target.value;
    setShippingOption(option);
    switch (option) {
      case "pickup":
        setShippingCost(0);
        setShippingNote("Retiro en tienda - San Lorenzo 4522, Santa Fe");
        break;
      case "capital":
        setShippingCost(4000);
        setShippingNote("Envío dentro de Santa Fe Capital");
        break;
      case "surroundings":
        setShippingCost(10000);
        setShippingNote("Envío a alrededores de Santa Fe");
        break;
      case "other":
        setShippingCost(16000);
        setShippingNote("Envío a otras localidades (costo base, puede variar)");
        break;
      default:
        setShippingCost(0);
        setShippingNote("");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!shippingOption) {
      showNotification("Por favor, seleccione una opción de envío.", "warning");
      return;
    }
    if (!cellphone) {
      showNotification("Por favor, ingrese su número de celular.", "warning");
      return;
    }
    if (shippingOption !== "pickup" && (!address || !city || !province)) {
      showNotification("Por favor, complete sus datos de envío.", "warning");
      return;
    }

    // Validar formato de teléfono
    const phoneRegex = /^(\+?54)?\s?(9)?\s?(\d{2,4})\s?(\d{6,8})$/;
    if (!phoneRegex.test(cellphone.replace(/\s/g, ''))) {
      showNotification("Por favor, ingrese un número de celular válido.", "warning");
      return;
    }

    // Generamos la lista de productos y otros datos para el email
    const productsString = cart.map(item =>
      ` - ${item.title} (${item.quantity} uds.) = ${formatPrice(item.price * item.quantity)}`
    ).join('\n');

    const totalAmount = cart.reduce((a, c) => a + c.price * c.quantity, 0) + shippingCost;

    const dataToSubmit = {
      "Celular": cellphone,
      "Tipo de Envio": shippingOption,
      "Direccion": address,
      "Ciudad": city,
      "Provincia": province,
      "Codigo Postal": postalCode,
      "Productos": productsString,
      "Costo de Envio": formatPrice(shippingCost),
      "Total Final": formatPrice(totalAmount),
    };

    // Primero, enviamos el formulario a Formspree
    await formspreeHandleSubmit(dataToSubmit);
    // El useEffect se encargará del resto si el envío fue exitoso.
  };

  const createPayment = async () => {
    setIsProcessing(true);
    try {
      const totalAmount = cart.reduce((a, c) => a + c.price * c.quantity, 0) + shippingCost;

      const response = await axios.post(`${API_URL}/payment/create_payment`, {
        product: {
          title: "Productos en el carrito",
          unit_price: totalAmount,
          quantity: 1,
        },
      });

      // Limpiar carrito después de un breve delay para que la animación se complete
      setTimeout(() => {
        dispatch(cartActions.clear());
        window.location.href = response.data.payment_url;
        setPaymentSuccess(true);
        setError("");
      }, 1000);

    } catch (err) {
      console.error("Error al crear el pago:", err);
      setError("Hubo un error al procesar el pago. Por favor, intente de nuevo.");
      showNotification("Error al procesar el pago. Intente nuevamente.", "error");
      setIsProcessing(false);
    }
  };

  const handleCheckout = () => {
    setShowForm(true);
  };

  const total = cart.reduce((a, c) => a + c.price * c.quantity, 0);
  const finalTotal = total + shippingCost;
  
  return (
    <div className=" bg-white min-h-screen">
      {/* Notificación toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, transition: { duration: 0.2 } }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "error" 
                ? "bg-red-100 text-red-800 border border-red-200" 
                : notification.type === "warning"
                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                : notification.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            <div className="flex items-center">
              {notification.type === "success" && (
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              )}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className=" container mx-auto px-4 py-6">
        {/* Header móvil */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-6">
            <NavLink to="/" className="text-gray-500 hover:text-black transition-colors duration-300">
              <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            </NavLink>
            <h1 className=" mt-[50px] text-xl font-semibold text-center flex-1 mr-4">CARRITO DE COMPRAS</h1>
          </div>
        </div>

        {/* Header desktop */}
        <motion.div 
          className="hidden md:block mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <NavLink to="/" className="mt-8 flex items-center text-gray-500 hover:text-black mb-4 transition-colors duration-300">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            <span className="text-sm uppercase tracking-wider">Continuar comprando</span>
          </NavLink>
          <h1 className="text-2xl font-light tracking-wide mb-2">TU CARRITO</h1>
          <div className="w-16 h-px bg-gray-300"></div>
        </motion.div>

        {cart.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial="hidden"
            animate="visible"
            variants={scaleIn}
          >
            <p className="text-gray-500 uppercase tracking-wider mb-6">Tu carrito está vacío</p>
            <NavLink 
              to="/products" 
              className="inline-block px-6 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              Ver productos
            </NavLink>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              {/* Lista de productos - Versión móvil */}
              <div className="md:hidden space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <span className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">PERFUMADA</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cantidad: {item.quantity}</span>
                      <button className="text-red-500 flex items-center">
                        <FontAwesomeIcon icon={faTrashAlt} className="mr-1 text-xs" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Lista de productos - Versión desktop */}
              <div className="hidden md:block">
                <div className="border-b border-gray-300 pb-4 mb-6 grid grid-cols-12 gap-4">
                  <div className="col-span-5 text-sm uppercase tracking-wider text-gray-600 font-medium">Producto</div>
                  <div className="col-span-2 text-sm uppercase tracking-wider text-gray-600 font-medium text-center">Precio</div>
                  <div className="col-span-2 text-sm uppercase tracking-wider text-gray-600 font-medium text-center">Cantidad</div>
                  <div className="col-span-2 text-sm uppercase tracking-wider text-gray-600 font-medium text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>
                
                <motion.div variants={stagger}>
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div 
                        key={item.id} 
                        className="border-b border-gray-200 py-6 flex flex-row items-center gap-6"
                        variants={itemAnimation}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                        layout
                      >
                        <div className="w-1/5">
                          <div className="bg-gray-50 p-3 flex items-center justify-center rounded-lg overflow-hidden h-24">
                            <motion.img
                              src={item.image}
                              alt={item.title}
                              className="h-full object-contain mix-blend-multiply"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-4">
                            <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-500">Precio Por Mayor: {item.size || 'Único'}</p>
                          </div>
                          
                          <div className="col-span-2 text-center">
                            <p className="font-medium">{formatPrice(item.price)}</p>
                          </div>
                          
                          <div className="col-span-2 flex justify-center">
                            <div className="flex items-center border border-gray-300 rounded-md w-fit overflow-hidden">
                              <motion.button
                                className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-400 cursor-not-allowed"
                                type="button"
                                disabled
                              >
                                <FontAwesomeIcon icon={faMinus} className="text-xs" />
                              </motion.button>
                              <span className="w-10 text-center font-medium">{item.quantity}</span>
                              <motion.button
                                className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-400 cursor-not-allowed"
                                type="button"
                                disabled
                              >
                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                              </motion.button>
                            </div>
                          </div>
                          
                          <div className="col-span-2 text-right">
                            <p className="font-medium text-lg">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                          
                          <div className="col-span-1 flex justify-center">
                            <motion.button
                              className="text-gray-300 cursor-not-allowed p-2"
                              aria-label="Eliminar producto"
                              type="button"
                              disabled
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
            
            {/* Resumen de compra - Versión móvil */}
            <div className="md:hidden">
              <div className=" bg-white border-t border-b border-gray-200 py-4 px-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-sm text-blue-600">Se calculará después</span>
                </div>
              </div>
              
              <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">{formatPrice(total)}</span>
                </div>
                
                <div className="text-sm text-gray-500 mb-4 text-center">
                  El costo de envío se calculará en el siguiente paso
                </div>
                
                <div className=" space-y-3">
                  <NavLink 
                    to="/products"
                    className=" block w-full py-3 text-center border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >


    
                    Seguir comprando
                  </NavLink>
                  
                  <motion.button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                    whileTap={{ scale: 0.98 }}
                  >
                    Iniciar compra
                    <FontAwesomeIcon icon={faChevronRight} className="ml-2 text-sm" />
                  </motion.button>
                </div>
              </div>
              
              <div className="bg-white p-4 mt-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold flex items-center mb-3">
                  <FontAwesomeIcon icon={faTruck} className="mr-2 text-gray-600" />
                  Opciones de envío
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Podrás seleccionar el método de envío y ver el costo final en el próximo paso.
                </p>
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Envío a todo el país</p>
                  <p>Retiro en tienda disponible en San Lorenzo 4522, Santa Fe</p>
                </div>
              </div>
            </div>
            
            {/* Resumen de compra - Versión desktop */}
            <motion.div 
              className="hidden md:block lg:w-1/3"
              initial="hidden"
              animate="visible"
              variants={slideUp}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4">
                <h2 className="text-xl font-light tracking-wide mb-4 border-b pb-3 border-gray-300">RESUMEN DE COMPRA</h2>
                <div className="space-y-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span>{shippingOption ? formatPrice(shippingCost) : "Seleccione en formulario"}</span>
                  </div>
                  {shippingOption && (
                    <div className="text-xs text-gray-500 italic bg-gray-100 p-2 rounded-md">
                      {shippingNote}
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{shippingOption ? formatPrice(finalTotal) : formatPrice(total)}</span>
                  </div>
                </div>
                
                <motion.button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-3 px-6 uppercase tracking-wider text-sm font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] rounded-md flex items-center justify-center gap-2"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                >
                  <FontAwesomeIcon icon={faTruck} className="text-sm" />
                  PROCEDER AL PAGO
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && !paymentSuccess && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white p-6 rounded-lg max-w-md w-full max-h-screen overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <h2 className="text-xl font-light tracking-wide mb-4">COMPLETA TU PEDIDO</h2>
              {error && <p className="text-red-500 mb-4 bg-red-50 p-2 rounded text-sm">{error}</p>}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="cellphone" className="block text-sm text-gray-600 mb-1">Celular *</label>
                  <input
                    id="cellphone"
                    type="tel"
                    name="Celular"
                    value={cellphone}
                    onChange={(e) => setCellphone(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="+54 342 1234567"
                  />
                </div>
                
                <div>
                  <label htmlFor="shipping" className="block text-sm text-gray-600 mb-1">Opción de envío *</label>
                  <select
                    id="shipping"
                    name="Tipo de Envio"
                    value={shippingOption}
                    onChange={handleShippingChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="">Seleccione opción</option>
                    <option value="pickup">Retiro en tienda (San Lorenzo 4522, Santa Fe) - Gratis</option>
                    <option value="capital">Santa Fe Capital - $4.000</option>
                    <option value="surroundings">Alrededores de Santa Fe - $10.000</option>
                    <option value="other">Otras localidades - $16.000 (costo base)</option>
                  </select>
                  {shippingNote && (
                    <p className="text-xs text-gray-500 mt-1">
                      {shippingNote}
                    </p>
                  )}
                </div>
                
                {shippingOption !== "pickup" && (
                  <>
                    <div>
                      <label htmlFor="address" className="block text-sm text-gray-600 mb-1">Dirección completa *</label>
                      <input
                        id="address"
                        type="text"
                        name="Direccion"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required={shippingOption !== "pickup"}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Calle, número, departamento, etc."
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm text-gray-600 mb-1">Ciudad *</label>
                      <input
                        id="city"
                        type="text"
                        name="Ciudad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required={shippingOption !== "pickup"}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Nombre de la ciudad"
                      />
                    </div>
                    <div>
                      <label htmlFor="province" className="block text-sm text-gray-600 mb-1">Provincia *</label>
                      <input
                        id="province"
                        type="text"
                        name="Provincia"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        required={shippingOption !== "pickup"}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Nombre de la provincia"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalcode" className="block text-sm text-gray-600 mb-1">Código Postal</label>
                      <input
                        id="postalcode"
                        type="text"
                        name="Codigo Postal"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Código postal (opcional)"
                      />
                    </div>
                  </>
                )}
                <div className="pt-2">
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="font-medium text-sm">Costo de envío:</span>
                    <span className="font-medium text-sm">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-medium text-sm">Total:</span>
                    <span className="font-medium text-sm">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 border border-black text-sm uppercase tracking-wider hover:bg-gray-100 transition-all duration-300"
                    disabled={isProcessing}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex-1 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={isProcessing || formspreeState.submitting || !shippingOption}
                    whileHover={{ y: -2, backgroundColor: "#1a1a1a" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing || formspreeState.submitting ? (
                      "Procesando..."
                    ) : (
                      "Confirmar y Pagar"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje de éxito de pago, si aplica */}
      <AnimatePresence>
        {paymentSuccess && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-85 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="bg-white rounded-lg w-full max-w-md p-6 text-center"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">¡Pedido y Pago Exitoso!</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Tu pedido ha sido registrado y el pago procesado correctamente. En breve nos pondremos en contacto contigo.
              </p>
              <NavLink 
                to="/" 
                className="inline-block bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 text-sm"
              >
                Volver al inicio
              </NavLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cart;