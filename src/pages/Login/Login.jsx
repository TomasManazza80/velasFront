import { useContext, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import * as Yup from "yup";
import authContext from "../../store/store";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();
  const authCtx = useContext(authContext);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("*Formato de email inválido")
      .required("*El email es requerido"),
    password: Yup.string().required("*La contraseña es requerida"),
  });

  const onSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const data = {
        email: values.email,
        password: values.password,
      };

      const response = await axios.post(`${API_URL}/login`, data);
      // alert(`¡Bienvenido de nuevo, ${response.data.nombre}!`);
      authCtx.setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (error) {
      setStatus({
        error: error.response?.data?.message || "Credenciales inválidas. Intenta de nuevo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    authCtx.setToken(token);
    if (token) {
      navigate("/");
    }
  }, [authCtx, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Encabezado */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-gray-800 mb-2">Fashion Designer</h1>
          <p className="text-gray-500">Envíos a todo el país</p>
        </div>

        {/* Tarjeta de Login */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-normal text-gray-800 mb-8 text-center">
            Iniciar Sesión
          </h2>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-6">
                {/* Campo Email */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    className="w-full pl-10 pr-3 py-2 border-b border-gray-300 focus:border-black focus:outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Correo electrónico"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Campo Contraseña */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    className="w-full pl-10 pr-3 py-2 border-b border-gray-300 focus:border-black focus:outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Contraseña"
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Recordar contraseña */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Recordarme
                    </label>
                  </div>

                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-gray-500 hover:text-gray-700"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                </div>

                {/* Mensaje de error */}
                {status && status.error && (
                  <p className="text-red-500 text-sm text-center">{status.error}</p>
                )}

                {/* Botón de Login */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    "Iniciando sesión..."
                  ) : (
                    <>
                      Continuar <FiArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o</span>
              </div>
            </div>
          </div>

          {/* Registro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <NavLink
                to="/signup"
                className="font-medium text-gray-700 hover:text-black"
              >
                Regístrate
              </NavLink>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Fashion Designer. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;