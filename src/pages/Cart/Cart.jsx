import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Remove, Update } from "../../store/redux/cart/CartAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrashAlt, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import axios from "axios";
import emailjs from '@emailjs/browser';

const API_URL = import.meta.env.REACT_APP_API_URL;

function Cart() {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [error, setError] = useState("");
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [updatedCart, setUpdatedCart] = useState([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [address, setAddress] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setUpdatedCart(cart);
  }, [cart]);

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price || 0);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice).replace('ARS', '$');
  };

  const createPayment = async () => {
    try {
      const totalAmount = updatedCart.reduce((a, c) => a + c.price * c.quantity, 0);
      
      await Promise.all(
        updatedCart.map(async (item) => {
          await axios.post(`${API_URL}/boughtProduct/boughtProduct`, {
            nombre: item.title,
            precio: item.price,
            cantidad: item.quantity,
            marca: item.id || 'Marca Desconocida',
            categoria: item.category || 'Categoría Desconocida',
            talle: item.size || 'No posee Precio por Mayor',
          });
        })
      );
      enviarEmail();

      const response = await axios.post(`${API_URL}/payment/create_payment`, {
        product: {
          title: "Productos en el carrito",
          unit_price: totalAmount,
          quantity: 1,
        },
      });
      
      setError("");
      window.location.href = response.data.payment_url;
    } catch (error) {
      console.error("Error al crear el pago:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (isPaymentReady) {
      createPayment();
      setIsPaymentReady(false);
    }
  }, [isPaymentReady]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsPaymentReady(true);
  };

  const enviarEmail = () => {
    const templateParams = {
      user_email: email,
      user_cellphone: cellphone,
      user_address: address,
      message: `Productos en el carrito:\n${updatedCart.map(item => `Nombre: ${item.title}, Precio: ${item.price}, Cantidad: ${item.quantity}`).join('\n')}\n Esta es la información del usuario: \nCelular: ${cellphone}, Direccion: ${address}, Mensaje: ${message}`,
    };

    emailjs.send('service_nmujodf', 'template_3eofazh', templateParams, "K7qLi6I9SCwVn1oPA")
      .then((res) => {
        alert("Correo enviado correctamente.");
        console.log(res);
      }).catch((error) => {
        console.error("Error al enviar el correo:", error);
      });
  };

  const handleCheckout = () => {
    setShowForm(true);
  };

  const INCQuantityHandler = ({ id, quantity, price }) => {
    const newQuantity = quantity + 1;
    const item = { id, quantity: newQuantity, price };
    dispatch(Update(item));
  };

  const DECQuantityHandler = ({ id, quantity, price }) => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      const item = { id, quantity: newQuantity, price };
      dispatch(Update(item));
    } else {
      dispatch(Remove(id));
    }
  };

  const total = cart.reduce((a, c) => a + c.price * c.quantity, 0);

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <NavLink to="/" className="flex items-center text-gray-500 hover:text-black mb-4">
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
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="border-b border-gray-200 pb-4 mb-4 hidden md:grid grid-cols-12 gap-4">
                <div className="col-span-6 text-sm uppercase tracking-wider text-gray-500">Producto</div>
                <div className="col-span-2 text-sm uppercase tracking-wider text-gray-500">Precio</div>
                <div className="col-span-2 text-sm uppercase tracking-wider text-gray-500">Cantidad</div>
                <div className="col-span-2 text-sm uppercase tracking-wider text-gray-500">Total</div>
              </div>

              {cart.map((item) => (
                <div key={item.id} className="border-b border-gray-200 py-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Product Image */}
                  <div className="w-full md:w-1/4 lg:w-1/6">
                    <div className="bg-gray-50 p-4 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-32 object-contain mix-blend-multiply"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
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
                          onClick={() => DECQuantityHandler({
                            id: item.id,
                            quantity: item.quantity,
                            price: item.price,
                          })}
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-xs" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => INCQuantityHandler({
                            id: item.id,
                            quantity: item.quantity,
                            price: item.price,
                          })}
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between">
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      <button
                        onClick={() => dispatch(Remove(item.id))}
                        className="text-gray-400 hover:text-black"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
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
                    <span className="text-sm">Calculado en el checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
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

      {/* Checkout Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-light tracking-wide mb-6">COMPLETA TU PEDIDO</h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Celular</label>
                <input
                  type="tel"
                  value={cellphone}
                  onChange={(e) => setCellphone(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Dirección y Ciudad</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Mensaje (Opcional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black h-24"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-black text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors duration-200"
                >
                  Confirmar y Pagar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;