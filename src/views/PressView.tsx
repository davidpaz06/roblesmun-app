import type { FC } from "react";
import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import {
  FaExclamationTriangle,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FirestoreService } from "../firebase/firestore";
import type { PressItem } from "../interfaces/PressItem";
import XButton from "../components/XButton";
import MediaGallery from "../components/MediaGallery";

const ITEMS_PER_PAGE = 6; // ✅ Cambiado de 9 a 6

const PressView: FC = () => {
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState<string>("XVII");
  const [availableEditions, setAvailableEditions] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<PressItem | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});

  const fetchPressItems = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      console.log(
        "🔄 Cargando contenido de prensa desde Firestore (paginado)..."
      );

      // ✅ Carga paginada inicial - solo primeros 50 items
      const { data, hasMore } = await FirestoreService.getPaginated<PressItem>(
        "press",
        50,
        null,
        "createdAt",
        "desc"
      );

      console.log(
        `✅ ${data.length} items cargados inicialmente, hay más: ${hasMore}`
      );

      setPressItems(data);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMediaClick = (item: PressItem) => {
    setSelectedMedia(item);
    setShowMediaModal(true);
  };

  const handleCloseModal = () => {
    setShowMediaModal(false);
    setSelectedMedia(null);
  };

  const handleDownload = async () => {
    if (!selectedMedia) return;

    try {
      const response = await fetch(selectedMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const extension = selectedMedia.type === "video" ? "mp4" : "jpg";
      link.download = `${selectedMedia.title.replace(
        /\s+/g,
        "-"
      )}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error al descargar el archivo");
    }
  };

  const filteredItems = pressItems.filter(
    (item) => item.edition === selectedEdition
  );

  const groupedBySection = filteredItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, PressItem[]>);

  // ✅ Función para obtener items paginados por sección (SOLO los 6 de la página actual)
  const getPaginatedItems = (section: string, items: PressItem[]) => {
    const page = currentPage[section] || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  };

  // ✅ Función para cambiar de página
  const handlePageChange = (section: string, newPage: number) => {
    setCurrentPage((prev) => ({ ...prev, [section]: newPage }));

    const sectionElement = document.getElementById(`section-${section}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
              <>
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
                </div>

                <div className="my-6 flex flex-col sm:flex-row gap-4 items-center">
                  <button
                    onClick={fetchPressItems}
                    className="bg-[#d53137] text-white cursor-pointer px-6 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors font-montserrat-bold flex items-center gap-2"
                  >
                    <FaClock />
                    Verificar nuevamente
                  </button>

                  <p className="text-xs text-gray-500 font-montserrat-light">
                    Mantente atento a nuestras redes sociales para las últimas
                    actualizaciones
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Filtro de ediciones */}
                {availableEditions.length > 0 && (
                  <div className="flex gap-4 mb-8 flex-wrap">
                    <span className="text-gray-300 text-center font-montserrat-bold">
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

                {Object.keys(groupedBySection).length > 0 ? (
                  Object.entries(groupedBySection).map(([section, items]) => {
                    const page = currentPage[section] || 1;
                    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
                    const paginatedItems = getPaginatedItems(section, items);

                    return (
                      <div
                        key={section}
                        id={`section-${section}`}
                        className="mb-12"
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-montserrat-bold text-[#d53137]">
                            {section}
                          </h3>
                          <span className="text-sm text-gray-400">
                            {items.length} archivo
                            {items.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <MediaGallery
                          items={paginatedItems}
                          onMediaClick={handleMediaClick}
                        />

                        {/* Controles de paginación */}
                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                              onClick={() =>
                                handlePageChange(section, page - 1)
                              }
                              disabled={page === 1}
                              className="px-4 py-2 bg-glass rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <FaChevronLeft />
                              Anterior
                            </button>

                            <div className="flex gap-2">
                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                              ).map((pageNum) => (
                                <button
                                  key={pageNum}
                                  onClick={() =>
                                    handlePageChange(section, pageNum)
                                  }
                                  className={`px-4 py-2 rounded-lg transition-colors ${
                                    page === pageNum
                                      ? "bg-[#d53137] text-white"
                                      : "bg-glass hover:bg-gray-700"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() =>
                                handlePageChange(section, page + 1)
                              }
                              disabled={page === totalPages}
                              className="px-4 py-2 bg-glass rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              Siguiente
                              <FaChevronRight />
                            </button>
                          </div>
                        )}

                        {/* Indicador de página */}
                        {totalPages > 1 && (
                          <p className="text-center text-sm text-gray-400 mt-4">
                            Mostrando {(page - 1) * ITEMS_PER_PAGE + 1} -{" "}
                            {Math.min(page * ITEMS_PER_PAGE, items.length)} de{" "}
                            {items.length}
                          </p>
                        )}
                      </div>
                    );
                  })
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

      {/* Modal de visualización */}
      {showMediaModal && selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-6xl w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-glass rounded-lg overflow-hidden max-h-[90vh] flex flex-col relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-10 p-2"
                aria-label="Cerrar"
              >
                <XButton size={48} thickness="normal" />
              </button>

              <button
                onClick={handleDownload}
                className="absolute top-4 left-4 z-10 py-2 px-4 bg-glass cursor-pointer rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                aria-label="Descargar"
              >
                <span className="text-white font-montserrat-light text-md">
                  Descargar
                </span>
              </button>

              <div className="flex-shrink-0 overflow-hidden">
                {selectedMedia.type === "video" ? (
                  <video
                    className="w-full max-h-[70vh] object-contain"
                    controls
                    autoPlay
                    src={selectedMedia.url}
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    className="w-full max-h-[70vh] object-contain"
                  />
                )}
              </div>
              <div className="p-6 bg-[#181818] font-montserrat-bold flex-shrink-0">
                <h3 className="text-2xl mb-2">{selectedMedia.title}</h3>
                <div className="flex gap-2 text-sm text-gray-400">
                  <span className="bg-[#d53137] px-2 py-1 rounded">
                    {selectedMedia.edition}
                  </span>
                  <span className="bg-blue-600 px-2 py-1 rounded">
                    {selectedMedia.section}
                  </span>
                  <span className="bg-gray-700 px-2 py-1 rounded">
                    {selectedMedia.type === "photo" ? "Foto" : "Video"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PressView;
