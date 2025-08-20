import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUser, FiPhone, FiMail, FiLock, FiCheck } from "react-icons/fi";
import authContext from "../../store/store";
import { useContext, useEffect } from "react";

const API_URL = "http://localhost:3000";

function SignUp() {
  const authCtx = useContext(authContext);
  const navigate = useNavigate();

  const initialValues = {
    name: "",
    number: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAndConditions: false,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .required("Nombre requerido"),
    number: Yup.string()
      .matches(/^[0-9]+$/, "Solo números permitidos")
      .min(8, "El teléfono debe tener al menos 8 dígitos")
      .required("Teléfono requerido"),
    email: Yup.string()
      .email("Formato de email inválido")
      .required("Email requerido"),
    password: Yup.string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .required("Contraseña requerida"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden")
      .required("Confirma tu contraseña"),
    termsAndConditions: Yup.boolean()
      .oneOf([true], "Debes aceptar los términos y condiciones")
      .required("Debes aceptar los términos y condiciones"),
  });

  const onSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const data = {
        name: values.name,
        number: values.number,
        email: values.email,
        password: values.password,
      };

      const response = await axios.post(`${API_URL}/createuser`, data);
      console.log(response);
      navigate("/login");
    } catch (error) {
      setStatus(error.response?.data?.message || "Error al registrar. Intenta nuevamente.");
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

        {/* Tarjeta de Registro */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-normal text-gray-800 mb-8 text-center">
            Crear Cuenta
          </h2>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-4">
                {/* Campo Nombre */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <Field
                    type="text"
                    name="name"
                    id="name"
                    className="w-full pl-10 pr-3 py-2 border-b border-gray-300 focus:border-black focus:outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Nombre completo"
                  />
                  <ErrorMessage
                    name="name"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Campo Teléfono */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <Field
                    type="tel"
                    name="number"
                    id="number"
                    className="w-full pl-10 pr-3 py-2 border-b border-gray-300 focus:border-black focus:outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Teléfono"
                  />
                  <ErrorMessage
                    name="number"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

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

                {/* Campo Confirmar Contraseña */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <Field
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="w-full pl-10 pr-3 py-2 border-b border-gray-300 focus:border-black focus:outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Confirmar contraseña"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Términos y condiciones */}
                <div className="flex items-start mt-4">
                  <div className="flex items-center h-5">
                    <Field
                      type="checkbox"
                      name="termsAndConditions"
                      id="termsAndConditions"
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="termsAndConditions"
                      className="text-sm text-gray-700"
                    >
                      Acepto los{' '}
                      <a href="#" className="text-gray-500 hover:text-gray-700 underline">
                        términos y condiciones
                      </a>
                    </label>
                    <ErrorMessage
                      name="termsAndConditions"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                {/* Mensaje de error */}
                {status && (
                  <p className="text-red-500 text-sm text-center">{status}</p>
                )}

                {/* Botón de Registro */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300 disabled:opacity-50 mt-6"
                >
                  {isSubmitting ? "Registrando..." : "Registrarse"}
                </button>
              </Form>
            )}
          </Formik>

          {/* Enlace a Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <NavLink
                to="/login"
                className="font-medium text-gray-700 hover:text-black"
              >
                Iniciar sesión
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

export default SignUp;