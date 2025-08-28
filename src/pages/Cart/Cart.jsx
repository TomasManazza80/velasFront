import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrashAlt, faArrowLeft, faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { useForm } from "@formspree/react";
import axios from "axios";

// Definimos las acciones del carrito
const cartActions = {
  add: (item) => ({ type: "ADD_TO_CART", payload: item }),
  remove: (id) => ({ type: "REMOVE_FROM_CART", payload: id }),
  update: (item) => ({ type: "UPDATE_CART_QUANTITY", payload: item }),
  clear: () => ({ type: "CLEAR_CART" }),
};

const API_URL = import.meta.env.VITE_API_URL;
const FORMSPREE_FORM_ID = "xjkekaqa";

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

  const [formspreeState, formspreeHandleSubmit] = useForm(FORMSPREE_FORM_ID);

  useEffect(() => {
    // Si Formspree tuvo éxito, iniciamos el proceso de pago
    if (formspreeState.succeeded) {
      createPayment();
    }
  }, [formspreeState.succeeded]);

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
      alert("Por favor, seleccione una opción de envío.");
      return;
    }
    if (!cellphone) {
      alert("Por favor, ingrese su número de celular.");
      return;
    }
    if (shippingOption !== "pickup" && (!address || !city || !province)) {
      alert("Por favor, complete sus datos de envío.");
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

      window.location.href = response.data.payment_url;
      setPaymentSuccess(true);
      dispatch(cartActions.clear());
      setError("");

    } catch (err) {
      console.error("Error al crear el pago:", err);
      setError("Hubo un error al procesar el pago. Por favor, intente de nuevo.");
      setIsProcessing(false);
    }
  };

  const handleCheckout = () => {
    setShowForm(true);
  };

  const INCQuantityHandler = (item) => {
    const newQuantity = item.quantity + 1;
    dispatch(cartActions.update({ id: item.id, quantity: newQuantity, price: item.price }));
  };

  const DECQuantityHandler = (item) => {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      dispatch(cartActions.update({ id: item.id, quantity: newQuantity, price: item.price }));
    } else {
      dispatch(cartActions.remove(item.id));
    }
  };

  const total = cart.reduce((a, c) => a + c.price * c.quantity, 0);
  const finalTotal = total + shippingCost;
  
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <NavLink to="/" className="mt-16 flex items-center text-gray-500 hover:text-black mb-4">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            <span className="text-sm uppercase tracking-wider">Continuar comprando</span>
          </NavLink>
          <h1 className="text-3xl font-light tracking-wide mb-2">TU CARRITO</h1>
          <div className="w-16 h-px bg-gray-300"></div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 uppercase tracking-wider">Tu carrito está vacío</p>
            <NavLink 
              to="/products" 
              className="inline-block mt-6 px-6 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors duration-200"
            >
              Ver productos
            </NavLink>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3">
              <div className="border-b border-gray-200 pb-4 mb-4 hidden md:grid grid-cols-12 gap-4">
                <div className="col-span-6 text-sm uppercase tracking-wider text-gray-500">Producto</div>
                <div className="col-span-2 text-sm uppercase tracking-wider text-gray-500">Precio</div>
                <div className="col-span-2 text-sm uppercase tracking-wider text-gray-500">Cantidad</div>
                <div className="col-span-2 text-sm uppercase tracking-wider text-gray-500">Total</div>
              </div>
              {cart.map((item) => (
                <div key={item.id} className="border-b border-gray-200 py-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-full md:w-1/4 lg:w-1/6">
                    <div className="bg-gray-50 p-4 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-32 object-contain mix-blend-multiply"
                      />
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-11 gap-4">
                    <div className="md:col-span-5">
                      <h3 className="font-light text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500">Precio Por Mayor: {item.size || 'Único'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-medium">{formatPrice(item.price)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center border border-gray-300 rounded w-fit">
                        <button
                          onClick={() => DECQuantityHandler(item)}
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-xs" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => INCQuantityHandler(item)}
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between">
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      <button
                        onClick={() => dispatch(cartActions.remove(item.id))}
                        className="text-gray-400 hover:text-black"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:w-1/3">
              <div className="bg-gray-50 p-6">
                <h2 className="text-xl font-light tracking-wide mb-6">RESUMEN DE COMPRA</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span>{shippingOption ? formatPrice(shippingCost) : "Seleccione opción"}</span>
                  </div>
                  {shippingOption && (
                    <div className="text-sm text-gray-500 italic">
                      {shippingNote}
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                    <span>Total</span>
                    <span>{shippingOption ? formatPrice(finalTotal) : formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 px-6 uppercase tracking-wider text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  Proceder al pago
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && !paymentSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-8 rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-light tracking-wide mb-6">COMPLETA TU PEDIDO</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
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
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                  placeholder="+54 342 1234567"
                />
              </div>
              <div>
                <label htmlFor="shipping" className="block text-sm text-gray-600 mb-1">Tipo de Envío *</label>
                <select
                  id="shipping"
                  name="Tipo de Envio"
                  value={shippingOption}
                  onChange={handleShippingChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                >
                  <option value="">Seleccione una opción</option>
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
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black"
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
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black"
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
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black"
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
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                      placeholder="Código postal (opcional)"
                    />
                  </div>
                </>
              )}
              <div className="pt-2">
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="font-medium">Costo de envío:</span>
                  <span className="font-medium">{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-medium">{formatPrice(finalTotal)}</span>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-black text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors duration-200"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isProcessing || formspreeState.submitting}
                >
                  {isProcessing || formspreeState.submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    "Confirmar y Pagar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mensaje de éxito de pago, si aplica */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-5xl mb-4" />
            <h3 className="text-xl font-semibold mb-2">¡Pedido y Pago Exitoso!</h3>
            <p className="text-gray-600 mb-6">
              Tu pedido ha sido registrado y el pago procesado correctamente. En breve nos pondremos en contacto contigo.
            </p>
            <NavLink 
              to="/" 
              className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700"
            >
              Volver al inicio
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;