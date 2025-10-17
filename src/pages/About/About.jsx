import React from "react";
import {
  CheckCircleIcon,
  LockClosedIcon,
  TruckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const About = () => {
  const features = [
    {
      id: 1,
      // Título optimizado
      title: "Velas Artesanales en Santa Fe",
      // Descripción optimizada
      description:
        "Explora nuestra colección exclusiva de velas aromáticas artesanales, hechas con cera de soja premium en el corazón de Santa Fe.",
      icon: <SparklesIcon className="h-10 w-10 text-gray-700" />,
    },
    {
      id: 2,
      title: "Personalización Única",
      description: "Combina fragancias y tamaños para crear tu vela perfecta. Ideal para regalos o eventos especiales en la ciudad.",
      icon: <CheckCircleIcon className="h-10 w-10 text-gray-700" />,
    },
    {
      id: 3,
      title: "Compra Segura y Local",
      description:
        "Proceso de pago encriptado con múltiples métodos de pago. ¡Soporta el comercio local de velas en Santa Fe!",
      icon: <LockClosedIcon className="h-10 w-10 text-gray-700" />,
    },
    {
      id: 4,
      title: "Envío Rápido y Protegido",
      // Descripción optimizada
      description:
        "Recibe tus velas en 24-48h dentro de Santa Fe y alrededores con embalaje protector especial.",
      icon: <TruckIcon className="h-10 w-10 text-gray-700" />,
    },
  ];

  return (
    <section className="relative bg-white py-24 px-6 sm:px-10 lg:px-16 overflow-hidden">
      {/* Fondo sutil minimalista */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#fafafa_1px,transparent_1px)] bg-[length:22px_22px]" />

      <div className="relative max-w-7xl mx-auto">
        
        {/* Encabezado y Bloque SEO: El texto clave */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-gray-900 mb-6">
            VELAS AROMÁTICAS EN SANTA FE
          </h2>
          {/* Este párrafo es el "Artículo" que Google necesita leer */}
          <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed tracking-wide mb-12">
            Si estás buscando **velas artesanales en Santa Fe**, has llegado al lugar indicado. En nuestra tienda, nos especializamos en la creación de **velas de cera de soja** premium, perfumadas con esencias importadas para garantizar una experiencia olfativa superior. Apoyamos la producción local en la provincia de Santa Fe, ofreciendo no solo productos de alta calidad sino también un servicio de **envío express** directo a tu hogar en la ciudad. Descubre la calidez y el estilo que solo nuestras velas pueden aportar a tus espacios.
          </p>
        </div>

        {/* Bloque de características ajustado */}
        <div className="text-center mb-20">
          <h3 className="text-3xl font-light tracking-[0.2em] text-gray-900 mb-6 border-t pt-10">
            NUESTRA PROMESA DE CALIDAD
          </h3>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed tracking-wide">
            Cada vela está creada con ingredientes naturales y esencias de alta calidad para transformar tus espacios.
          </p>
        </div>

        {/* Tarjetas estilo premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="relative bg-white p-10 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center group transition duration-500 hover:-translate-y-2 hover:shadow-xl"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-6 p-4 bg-gray-50 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              <h4 className="text-lg font-medium tracking-wider text-gray-900 mb-3 group-hover:text-gray-700 transition-colors duration-300 uppercase">
                {feature.title}
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed tracking-wide">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-24">
          <button className="px-12 py-4 bg-black text-white font-medium rounded-xl shadow-md hover:shadow-lg transform transition duration-300 hover:scale-105 tracking-widest text-sm uppercase">
            Explorar Colección
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;