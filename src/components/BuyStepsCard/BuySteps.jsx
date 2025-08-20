import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, 
  faBoxOpen, 
  faCreditCard,
  faTruck
} from "@fortawesome/free-solid-svg-icons";

const BuySteps = () => {
  const steps = [
    {
      icon: faSearch,
      title: "1. Descubre tu Estilo",
      description: "Explora nuestra colección exclusiva y encuentra piezas que definan tu look.",
      color: "from-pink-100 to-pink-50"
    },
    {
      icon: faBoxOpen,
      title: "2. Personaliza tu Pedido",
      description: "Selecciona talla, color y cantidades para cada artículo seleccionado.",
      color: "from-purple-100 to-purple-50"
    },
    {
      icon: faCreditCard,
      title: "3. Pago Seguro",
      description: "Proceso de pago encriptado con múltiples métodos de pago disponibles.",
      color: "from-blue-100 to-blue-50"
    },
    {
      icon: faTruck,
      title: "4. Envío Express",
      description: "Recibe tu pedido en 24-48h con nuestro servicio premium de envíos.",
      color: "from-teal-100 to-teal-50"
    }
  ];

  // Animaciones
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">
            Fashion Designer
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-6">
            Envíos a todo el país
          </p>
          <div className="w-16 h-px bg-gray-300 mx-auto"></div>
        </motion.div>

        {/* Pasos */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {steps.map((step, index) => (
            <motion.article 
              key={index}
              variants={item}
              className="group"
            >
              <div className={`h-full bg-gradient-to-br ${step.color} p-6 rounded-lg transition-all duration-300 group-hover:shadow-md`}>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                  <FontAwesomeIcon 
                    icon={step.icon} 
                    className="text-lg text-gray-700" 
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Llamada a la acción */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <button className="px-8 py-3 bg-black text-white font-light text-sm tracking-wider rounded-none hover:bg-gray-800 transition-colors duration-300">
            COMPRAR AHORA
          </button>
          <p className="mt-4 text-xs text-gray-500">
            Descubre nuestra colección exclusiva
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BuySteps;