import { useNavigate, Outlet } from "react-router-dom";

const ProductCart = ({ image, name, price, id }) => {
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
      <div className="relative group">
        <div className="flex flex-col w-72 h-96 bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          {/* Product Image Container */}
          <div className="relative h-64 bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span className="text-gray-400 text-sm">No image available</span>
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                className="bg-black text-white py-2 px-6 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors duration-200"
                onClick={() => navigate(`/product/${id}`)}
              >
                Ver Producto
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-light text-gray-900 mb-1 line-clamp-2">
              {name}
            </h3>
            <p className="text-sm text-gray-500 uppercase mb-2">ANI BEAUTY</p>
            <p className="mt-auto text-lg font-medium text-gray-900">
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