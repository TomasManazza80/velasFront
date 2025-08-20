import BuySteps from "../../components/BuyStepsCard/BuySteps.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Hero from "../../components/Hero/Hero.jsx";
import ProductsHome from "../Products/productsHome.jsx";

const HOME = () => {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Hero section con integración de navbar */}
      <div className="relative w-full">
        <Hero />
      </div>
      
      <div className="w-full px-4 md:px-8 lg:px-16">
        <ProductsHome />
        
        <button 
          onClick={() => window.location.href = '/products'}
          className="block mx-auto px-8 py-3 bg-black text-white font-light text-sm tracking-wider hover:bg-gray-800 transition-colors duration-300 rounded my-8"
        >
          Ver Todos los Productos
        </button>
        
        <BuySteps />
      </div>
      
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
};

export default HOME;