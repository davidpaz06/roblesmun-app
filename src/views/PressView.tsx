import type { FC } from "react";
import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { FaExclamationTriangle, FaClock, FaPlay } from "react-icons/fa";
import { FirestoreService } from "../firebase/firestore";
import type { PressItem } from "../interfaces/PressItem";

const PressView: FC = () => {
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState<string>("XVII");
  const [availableEditions, setAvailableEditions] = useState<string[]>([]);

  const fetchPressItems = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      console.log("🔄 Cargando contenido de prensa desde Firestore...");
      const data = await FirestoreService.getAll<PressItem>("press");
      console.log("✅ Contenido obtenido:", data);

      setPressItems(data);

      // Obtener ediciones únicas
      const editions = Array.from(
        new Set(data.map((item) => item.edition))
      ).sort((a, b) => b.localeCompare(a));
      setAvailableEditions(editions);

      if (editions.length > 0 && !editions.includes(selectedEdition)) {
        setSelectedEdition(editions[0]);
      }
    } catch (error) {
      console.error("❌ Error cargando contenido de prensa:", error);
      setHasError(true);
      setPressItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPressItems();
  }, []);

  // Filtrar por edición seleccionada
  const filteredItems = pressItems.filter(
    (item) => item.edition === selectedEdition
  );

  // Agrupar por sección
  const groupedBySection = filteredItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, PressItem[]>);

  return (
    <>
      <meta title="ROBLESMUN - Prensa" />
      <meta
        name="description"
        content="Explora la galería de videos y fotos de ROBLESMUN."
      />
      <title>ROBLESMUN - Prensa</title>

      {isLoading && (
        <div className="flex justify-center items-center min-h-screen">
          <Loader message="Cargando galería..." />
        </div>
      )}

      {!isLoading && (
        <section className="text-[#f0f0f0] w-[90%] min-h-[100vh] sm:pt-32 flex justify-center">
          <div className="w-full max-w-[1200px] px-4">
            <h2 className="sm:text-[3.5em] text-[2em] my-4 font-montserrat-bold transition-all duration-500 ease-in-out">
              Prensa
            </h2>

            {hasError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FaExclamationTriangle className="text-red-400 text-6xl mb-6" />
                <h3 className="text-2xl font-montserrat-bold mb-4 text-red-300">
                  Error cargando galería
                </h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  No se pudieron cargar las fotos y los videos en este momento.
                  Por favor, verifica tu conexión e intenta nuevamente.
                </p>
                <button
                  onClick={fetchPressItems}
                  className="bg-[#d53137] text-white px-6 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors font-montserrat-bold flex items-center gap-2"
                >
                  <FaClock />
                  Reintentar
                </button>
              </div>
            ) : pressItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center bg-glass p-8 text-center">
                <div className="bg-orange-900/20 border border-orange-600 rounded-full p-6 mb-6">
                  <FaClock className="text-orange-400 text-6xl" />
                </div>
                <h3 className="text-3xl font-montserrat-bold mb-4 text-orange-300">
                  Contenido próximamente
                </h3>
                <p className="text-lg text-gray-300 font-montserrat-light leading-relaxed max-w-2xl">
                  Estamos preparando la galería de fotos y videos de la{" "}
                  <strong className="text-[#d53137]">
                    XVII edición de ROBLESMUN
                  </strong>
                  .
                </p>
                <button
                  onClick={fetchPressItems}
                  className="mt-6 bg-[#d53137] text-white cursor-pointer px-6 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors font-montserrat-bold flex items-center gap-2"
                >
                  <FaClock />
                  Verificar nuevamente
                </button>
              </div>
            ) : (
              <>
                {/* Filtro de ediciones */}
                {availableEditions.length > 1 && (
                  <div className="flex gap-4 mb-8 flex-wrap">
                    <span className="text-gray-300 font-montserrat-bold">
                      Edición:
                    </span>
                    {availableEditions.map((edition) => (
                      <button
                        key={edition}
                        onClick={() => setSelectedEdition(edition)}
                        className={`px-4 py-2 rounded-lg transition-colors font-montserrat-bold ${
                          selectedEdition === edition
                            ? "bg-[#d53137] text-white"
                            : "bg-glass text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {edition}
                      </button>
                    ))}
                  </div>
                )}

                {/* Contenido agrupado por sección */}
                {Object.keys(groupedBySection).length > 0 ? (
                  Object.entries(groupedBySection).map(([section, items]) => (
                    <div key={section} className="mb-12">
                      <h3 className="text-2xl font-montserrat-bold mb-6 text-[#d53137]">
                        {section}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item, index) => (
                          <div
                            key={item.id || index}
                            className="bg-glass rounded-lg overflow-hidden shadow-lg"
                          >
                            {item.type === "video" ? (
                              <div className="relative">
                                <video
                                  className="w-full h-48 object-cover"
                                  controls
                                  src={item.url}
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <FaPlay className="text-white text-4xl opacity-70" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={item.url}
                                alt={item.title}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPgo=";
                                }}
                              />
                            )}
                            <div className="p-4">
                              <h4 className="font-montserrat-bold text-sm line-clamp-2">
                                {item.title}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    No hay contenido disponible para la edición{" "}
                    {selectedEdition}
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default PressView;
