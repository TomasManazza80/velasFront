import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PencilSquareIcon, VideoCameraIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

// =================================================================
// CONFIGURACIÓN ESTILOS LUPETRUCCELLI
// =================================================================
const STYLES = {
  title: "font-['Montserrat'] font-light uppercase tracking-widest text-[#333333]",
  accent: "font-['Inter'] text-[#cba394] text-xl md:text-2xl",
  body: "font-sans font-light text-[13px] md:text-[14px] text-[#333333]",
};

// Helper para convertir cualquier link de YouTube (watch, short, embed) a URL embed válida
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
};

const About = () => {
  const [videoUrl, setVideoUrl] = useState(() => {
    return localStorage.getItem("lupetruccelli_about_video_url") || "";
  });
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userStr = localStorage.getItem("user");
    let isUserAdmin = role === "admin";
    if (!isUserAdmin && userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.role === "admin") isUserAdmin = true;
      } catch (e) {}
    }
    // Permite al admin editar si tiene rol admin o token activo
    setIsAdmin(isUserAdmin || !!localStorage.getItem("token"));
  }, []);

  const handleSaveVideoUrl = (e) => {
    e.preventDefault();
    const cleanUrl = inputUrl.trim();
    setVideoUrl(cleanUrl);
    localStorage.setItem("lupetruccelli_about_video_url", cleanUrl);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <section className="relative py-32 bg-[#ffffff] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Encabezado LuPetruccelli */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className={STYLES.accent + " mb-6 block"}>
            Nuestra filosofía
          </span>
          <h2 className={STYLES.title + " text-3xl md:text-5xl mb-8 leading-relaxed"}>
            LuPetruccelli
          </h2>
          <p className={STYLES.body + " max-w-2xl mx-auto leading-loose opacity-80"}>
            Liderando la vanguardia en Santa Fe: Calidad certificada,
            innovación constante y un respaldo técnico de excelencia para tus dispositivos.
          </p>

          {/* Divisor Minimalista Rose Gold */}
          <div className="flex items-center justify-center gap-4 mt-12 opacity-70">
            <div className="h-[1px] w-12 bg-[#cba394]"></div>
            <span className="text-[#cba394] text-[10px]">✦</span>
            <div className="h-[1px] w-12 bg-[#cba394]"></div>
          </div>
        </motion.div>

        {/* SECCIÓN DE VIDEO HORIZONTAL - HISTORIA DE LA EMPRESA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto mb-20 relative"
        >
          {/* Cabecera del Video */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div>
              <span className="text-[#cba394] text-xs font-['Montserrat'] tracking-[0.2em] uppercase font-light">
                Nuestra Historia
              </span>
              <h3 className="text-[#333333] text-lg font-['Montserrat'] font-light uppercase tracking-wider mt-1">
                Conocé la trayectoria de LuPetruccelli
              </h3>
            </div>

            {/* Botón Admin para Cambiar/Agregar Video */}
            {isAdmin && (
              <button
                onClick={() => {
                  setInputUrl(videoUrl);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 text-xs font-['Montserrat'] uppercase tracking-widest text-[#cba394] hover:text-[#b07d6b] border border-[#cba394]/40 hover:border-[#cba394] px-4 py-2 transition-all duration-300 rounded-sm bg-[#f9f3f2]/50"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>{videoUrl ? "Editar Link de Video" : "Cargar Link de Video"}</span>
              </button>
            )}
          </div>

          {/* Toast de confirmación */}
          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-['Montserrat'] rounded flex items-center gap-2"
            >
              <CheckIcon className="w-4 h-4 text-emerald-600" />
              <span>¡El link del video se guardó correctamente!</span>
            </motion.div>
          )}

          {/* Reproductor Horizontal (Aspect Ratio 16:9) */}
          <div className="relative w-full aspect-video bg-[#1a1a1a] rounded-sm overflow-hidden border border-[#cba394]/30 shadow-[0_15px_35px_rgba(0,0,0,0.08)] group">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="Historia de la Empresa - LuPetruccelli"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#f9f3f2]/60 text-center border border-dashed border-[#cba394]/50">
                <VideoCameraIcon className="w-16 h-16 text-[#cba394] mb-4 stroke-[1]" />
                <h4 className="font-['Montserrat'] uppercase tracking-widest text-[#333333] text-sm mb-2 font-medium">
                  Video Institucional
                </h4>
                <p className="font-sans font-light text-xs text-[#333333]/70 max-w-md mb-6">
                  {isAdmin
                    ? "Aún no has configurado el video de la historia de la empresa. Hacé clic en 'Cargar Link de Video' arriba para ingresar el enlace de YouTube."
                    : "Próximamente podrás conocer nuestra historia a través de nuestro video institucional."}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setInputUrl(videoUrl);
                      setIsEditing(true);
                    }}
                    className="bg-[#cba394] hover:bg-[#b07d6b] text-white font-['Montserrat'] text-[11px] uppercase tracking-[0.2em] px-6 py-3 transition-colors duration-300 rounded-sm"
                  >
                    Cargar Link de YouTube
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal de edición para Admin */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white max-w-lg w-full p-8 rounded-sm shadow-2xl border border-[#cba394]/30 relative"
              >
                <button
                  onClick={() => setIsEditing(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <VideoCameraIcon className="w-7 h-7 text-[#cba394]" strokeWidth={1.5} />
                  <h3 className="font-['Montserrat'] uppercase tracking-widest text-[#333333] font-medium text-base">
                    Configurar Video de YouTube
                  </h3>
                </div>

                <p className="text-xs text-gray-600 mb-6 font-sans leading-relaxed">
                  Pegá el enlace directo del video de YouTube de la empresa (por ejemplo: <span className="font-mono text-[#cba394]">https://www.youtube.com/watch?v=...</span> o <span className="font-mono text-[#cba394]">https://youtu.be/...</span>).
                </p>

                <form onSubmit={handleSaveVideoUrl} className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-['Montserrat'] uppercase tracking-wider text-[#333333] mb-2 font-medium">
                      Link de YouTube
                    </label>
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                      className="w-full px-4 py-3 border border-[#cba394]/40 rounded-sm text-xs font-sans text-[#333333] focus:outline-none focus:border-[#cba394] focus:ring-1 focus:ring-[#cba394]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 text-xs font-['Montserrat'] uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#cba394] hover:bg-[#b07d6b] text-white text-xs font-['Montserrat'] uppercase tracking-[0.2em] transition-colors rounded-sm shadow-sm"
                    >
                      Guardar Link
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA LuPetruccelli */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-center mt-24"
        >
          <button className="group relative overflow-hidden bg-gradient-to-r from-[#ffffff] to-[#f9f3f2] border border-[#cba394]/30 px-14 py-5 transition-all duration-500 hover:border-[#cba394]/60 hover:shadow-[0_8px_30px_rgba(203,163,148,0.1)]">
            <span className="relative z-10 text-[#333333] font-['Montserrat'] font-light text-[11px] tracking-[0.25em] uppercase transition-colors duration-500 group-hover:text-[#cba394]">
              Explorar Servicios
            </span>
          </button>
          <p className="mt-8 font-sans font-light text-[10px] text-[#333333]/40 uppercase tracking-[0.2em]">
            Authorized Service Provider ✦ Quality Guaranteed
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;