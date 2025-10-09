import { useState, useEffect, type FC } from "react";
import SponsorsCaroussel from "../components/SponsorsCaroussel";
import { FirestoreService } from "../firebase/firestore";
import type { Sponsor } from "../interfaces/Sponsor";
import Loader from "../components/Loader";
import { FaClock, FaExclamationTriangle } from "react-icons/fa";
import { PiHandshakeLight } from "react-icons/pi";

const SponsorsView: FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchSponsors = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const sponsorsData = await FirestoreService.getAll("sponsors");
      setSponsors(sponsorsData as Sponsor[]);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      setSponsors([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  return (
    <>
      <meta title="ROBLESMUN - Patrocinadores" />
      <meta
        name="description"
        content="Descubre nuestros patrocinadores y aliados en ROBLESMUN."
      />
      <title>ROBLESMUN - Patrocinadores</title>

      {isLoading && (
        <div className="flex justify-center items-center min-h-screen">
          <Loader message="Cargando patrocinadores..." />
        </div>
      )}

      {!isLoading && (
        <>
          <section className="text-[#f0f0f0] w-[90%] min-h-[80vh] sm:pt-32 flex justify-center">
            <div className="w-full max-w-[1200px] px-4">
              <h2 className="sm:text-[3.5em] text-[2.5em] my-4 font-montserrat-bold transition-all duration-500 ease-in-out">
                Patrocinadores
              </h2>

              {hasError ? (
                <div className="w-full max-w-[1200px] py-8">
                  <div className="bg-glass p-12 rounded-lg text-center">
                    <div className="mb-6">
                      <FaExclamationTriangle className="mx-auto h-24 w-24 text-red-400 mb-4" />
                    </div>
                    <h3 className="text-3xl font-montserrat-bold mb-4 text-red-300">
                      Error cargando patrocinadores
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      No se pudieron cargar los patrocinadores en este momento.
                      Por favor, verifica tu conexión e intenta nuevamente.
                    </p>
                    <button
                      onClick={fetchSponsors}
                      className="bg-[#d53137] text-white px-6 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors font-montserrat-bold flex items-center gap-2 mx-auto"
                    >
                      <FaClock />
                      Reintentar
                    </button>
                  </div>
                </div>
              ) : sponsors && sponsors.length > 0 ? (
                <div className="w-full max-w-[1200px] py-8 flex flex-col-reverse sm:flex-row gap-8">
                  <div className="sm:w-[30%] flex flex-col justify-center items-start bg-glass p-8 rounded-lg min-h-[350px]">
                    <h3 className="text-2xl font-montserrat-bold mb-4">
                      {sponsors[currentSlide]?.name || "Cargando..."}
                    </h3>
                    <p className="text-lg font-montserrat-light transition-all duration-300 max-h-[300px] overflow-y-auto">
                      {sponsors[currentSlide]?.description || "Cargando..."}
                    </p>
                  </div>

                  <div className="sm:w-[70%] flex flex-col justify-center items-center bg-glass p-8 rounded-lg min-h-[350px]">
                    <SponsorsCaroussel
                      sponsors={sponsors}
                      currentSlide={currentSlide}
                      setCurrentSlide={setCurrentSlide}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center bg-glass p-8 text-center">
                    <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full border border-orange-600 bg-orange-900/20">
                      <PiHandshakeLight className="text-orange-400 text-6xl" />
                    </div>
                    <h3 className="text-3xl text-orange-300 font-montserrat-bold mb-4">
                      Patrocinadores próximamente
                    </h3>
                    <div className="max-w-2xl space-y-4">
                      <p className="text-lg text-gray-300 font-montserrat-light mb-6 max-w-2xl mx-auto">
                        Estamos trabajando en establecer alianzas con empresas y
                        organizaciones que apoyen la{" "}
                        <strong className="text-[#d53137]">
                          XVII edición de ROBLESMUN
                        </strong>
                        .
                      </p>
                      <p className="text-base text-gray-400 font-montserrat-light mb-8">
                        Si tu empresa está interesada en ser patrocinador,
                        ¡contáctanos!
                      </p>
                    </div>
                  </div>

                  <div className="my-6 flex flex-col sm:flex-row gap-4 items-center">
                    <button
                      onClick={fetchSponsors}
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
            </div>
          </section>

          <section className="text-[#f0f0f0] w-full min-h-[50vh] flex justify-center items-center mb-16 px-4">
            <div className="w-full max-w-[1200px] mx-auto text-center bg-sponsors rounded-lg overflow-hidden">
              <div className="bg-black/55 w-full px-4 py-16 flex flex-col justify-center items-center">
                <h2 className="text-2xl sm:text-3xl font-montserrat-bold mb-4">
                  ¿Te gustaría ser patrocinador?
                </h2>
                <p className="text-lg sm:text-xl font-montserrat-light mb-6">
                  Invitamos a empresas y organizaciones a sumarse como
                  patrocinadores de nuestro evento. Tu apoyo es fundamental para
                  impulsar el desarrollo educativo y el liderazgo juvenil.
                  Juntos podemos crear un impacto positivo en la comunidad.
                </p>
                <a
                  href="mailto:mun@losroblesenlinea.com.ve"
                  className="inline-block bg-glass text-[#f0f0f0] font-montserrat-bold px-8 py-3 rounded-md"
                >
                  Contáctanos para más información
                </a>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default SponsorsView;
