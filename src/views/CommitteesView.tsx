import type { FC } from "react";
import type { Committee } from "../interfaces/Committee";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CommitteeModal from "../components/CommitteeModal";
import { FirestoreService } from "../firebase/firestore";
import Loader from "../components/Loader";
import { FaClock, FaExclamationTriangle } from "react-icons/fa";

const CommitteesView: FC = () => {
  const [committeesInfo, setCommittees] = useState<Committee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    null
  );

  const fetchCommittees = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      console.log("🔄 Cargando comités desde Firestore...");
      const data = await FirestoreService.getAll<Committee>("committees");
      console.log("✅ Comités obtenidos:", data);

      setCommittees(data);
    } catch (error) {
      console.error("❌ Error cargando comités:", error);
      setHasError(true);
      setCommittees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommittees();
  }, [fetchCommittees]);

  return (
    <>
      <meta title="ROBLESMUN - Comités" />
      <meta name="description" content="Descubre los comités de ROBLESMUN." />
      <title>ROBLESMUN - Comités</title>

      {isLoading && (
        <div className="flex justify-center items-center min-h-screen">
          <Loader message="Cargando comités..." />
        </div>
      )}

      {!isLoading && (
        <section className="text-[#f0f0f0] w-[90%] min-h-[100vh] sm:pt-32 flex justify-center">
          <div className="w-full max-w-[1200px] px-4">
            <h2 className="sm:text-[3.5em] text-[2em] my-4 font-montserrat-bold transition-all duration-500 ease-in-out">
              Comités
            </h2>

            {hasError && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FaExclamationTriangle className="text-red-400 text-6xl mb-6" />
                <h3 className="text-2xl font-montserrat-bold mb-4 text-red-300">
                  Error cargando comités
                </h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  No se pudieron cargar los comités en este momento. Por favor,
                  verifica tu conexión e intenta nuevamente.
                </p>
                <button
                  onClick={fetchCommittees}
                  className="bg-[#d53137] text-white px-6 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors font-montserrat-bold"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!hasError && committeesInfo.length === 0 && (
              <>
                <div className="flex flex-col items-center justify-center bg-glass p-8 text-center">
                  <div className="bg-orange-900/20 border border-orange-600 rounded-full p-6 mb-6">
                    <FaClock className="text-orange-400 text-6xl" />
                  </div>

                  <h3 className="text-3xl font-montserrat-bold mb-4 text-orange-300">
                    Comités próximamente
                  </h3>

                  <div className="max-w-2xl space-y-4">
                    <p className="text-lg text-gray-300 font-montserrat-light leading-relaxed">
                      Los comités de la{" "}
                      <strong className="text-[#d53137]">
                        XVII edición de ROBLESMUN
                      </strong>{" "}
                      están siendo preparados por nuestro equipo académico.
                    </p>
                  </div>
                </div>

                <div className="my-6 flex flex-col sm:flex-row gap-4 items-center">
                  <button
                    onClick={fetchCommittees}
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
            )}

            {!hasError && committeesInfo.length > 0 && (
              <>
                <p className="text-gray-400 mb-8 font-montserrat-light">
                  Explora los {committeesInfo.length} comités disponibles para
                  la XVII edición de ROBLESMUN. Haz clic en cualquier comité
                  para ver más detalles.
                </p>

                <div className="grid grid-cols-1 my-8 md:grid-cols-2 gap-8">
                  {committeesInfo.map((committee) => (
                    <div
                      key={committee.name}
                      className={`bg-glass p-2 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105 hover:border-[#d53137] border border-transparent`}
                      onClick={() => setSelectedCommittee(committee)}
                    >
                      <img
                        src={committee.img}
                        alt={committee.name}
                        className="w-full h-48 object-contain bg-[#101010] rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA9TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Nic0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPgo=";
                        }}
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-montserrat-bold mb-2 line-clamp-2 min-h-[3rem]">
                          {committee.name}
                        </h3>
                        <p className="text-sm font-montserrat-light text-gray-300 line-clamp-2 mb-2">
                          <strong>Tópico:</strong> {committee.topic}
                        </p>

                        {committee.president && (
                          <p className="text-sm text-blue-300 mb-2">
                            <strong>Presidente:</strong> {committee.president}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-sm font-montserrat-bold text-green-400">
                            {committee.seats} cupos totales
                          </p>

                          {committee.seatsList && (
                            <p className="text-xs text-gray-400">
                              {
                                committee.seatsList.filter(
                                  (seat) => seat.available
                                ).length
                              }{" "}
                              disponibles
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <AnimatePresence>
        {selectedCommittee && (
          <motion.div
            className="text-[#f0f0f0] fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CommitteeModal
              committee={selectedCommittee}
              onClose={() => setSelectedCommittee(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommitteesView;
