import { useNavigate, Outlet } from "react-router-dom";

const ProductCart = ({ image, name, price, id, imageClass }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice).replace('ARS', '$');
  };

  return (
    <>
      {/* Contenedor Principal: Efecto de elevación y zoom al hacer hover/tocar. */}
      <div className="relative group transform transition-all duration-300 hover:scale-[1.03] sm:hover:scale-[1.05] z-10 hover:z-20"> 
        <div 
          className="flex flex-col w-full h-full bg-white shadow-lg sm:shadow-2xl rounded-lg overflow-hidden transition-all duration-300 border border-gray-100 
                     group-hover:shadow-2xl group-hover:shadow-black/20 sm:group-hover:shadow-3xl sm:group-hover:shadow-black/30 cursor-pointer"
          onClick={() => navigate(`/product/${id}`)}
        >
          
          {/* Contenedor de la Imagen del Producto: Usa la clase enviada (h-40 en móvil). */}
          <div className={`relative ${imageClass || 'h-40 sm:h-56'} bg-gray-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden`}>
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <span className="text-gray-400 text-xs sm:text-sm">No image available</span>
            )}
            
            {/* Overlay al hacer hover */}
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                className="bg-black text-white py-1.5 px-4 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors duration-200"
                onClick={(e) => { e.stopPropagation(); navigate(`/product/${id}`); }}
              >
                VER DETALLES
              </button>
            </div>
          </div>

          {/* Información del Producto */}
          <div className="p-3 sm:p-4 flex flex-col flex-grow">
            {/* Nombre de producto más pequeño en móvil (text-sm) */}
            <h3 className="text-sm sm:text-lg font-light text-black mb-0.5 line-clamp-2">
              {name}
            </h3>
            {/* Categoría/Marca: Sutil y compacta */}
            <p className="text-xs text-gray-500 uppercase mb-1">ANI BEAUTY</p>
            
            {/* Precio más pequeño en móvil (text-lg) */}
            <p className="mt-auto text-lg sm:text-xl font-medium text-black">
              {formatPrice(price)}
            </p>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default ProductCart;