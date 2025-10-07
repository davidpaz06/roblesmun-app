import { useState, useEffect, type FC } from "react";
import SponsorsCaroussel from "../components/SponsorsCaroussel";
import { FirestoreService } from "../firebase/firestore";
import type { Sponsor } from "../interfaces/Sponsor";
import Loader from "../components/Loader";

const SponsorsView: FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const sponsorsData = await FirestoreService.getAll("sponsors");
        setSponsors(sponsorsData as Sponsor[]);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
        setSponsors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader message="Cargando patrocinadores..." />
      </div>
    );
  }

  // Agregar esta validación para mostrar mensaje cuando no hay patrocinadores
  if (!sponsors || sponsors.length === 0) {
    return (
      <section className="text-[#f0f0f0] w-[90%] min-h-[80vh] sm:pt-32 flex justify-center items-center">
        <div className="w-full max-w-[1200px] px-4 text-center">
          <div className="bg-glass p-12 rounded-lg">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 21V5a2 2 0 012-2h8a2 2 0 012 2v16"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-montserrat-bold mb-4">
              Patrocinadores próximamente
            </h2>
            <p className="text-lg text-gray-300 font-montserrat-light mb-6 max-w-2xl mx-auto">
              Estamos trabajando en establecer alianzas con empresas y
              organizaciones que apoyen la{" "}
              <strong className="text-[#d53137]">
                XVII edición de ROBLESMUN
              </strong>
              .
            </p>
            <p className="text-base text-gray-400 font-montserrat-light mb-8">
              Si tu empresa está interesada en ser patrocinador, ¡contáctanos!
            </p>
            <a
              href="mailto:mun@losroblesenlinea.com.ve"
              className="inline-block bg-[#d53137] text-white font-montserrat-bold px-8 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors"
            >
              Contáctanos para ser patrocinador
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="text-[#f0f0f0] w-[90%] min-h-[80vh] sm:pt-32 flex justify-center">
        <div className="w-full max-w-[1200px] px-4">
          <h2 className="sm:text-[3.5em] text-[2.5em] my-4 font-montserrat-bold transition-all duration-500 ease-in-out">
            Patrocinadores
          </h2>
          <div className="w-full max-w-[1200px] py-8 flex flex-col-reverse sm:flex-row gap-8">
            <div className="sm:w-[30%] flex flex-col justify-center items-start bg-glass p-8 rounded-lg min-h-[350px]">
              <h3 className="text-2xl font-montserrat-bold mb-4">
                {sponsors[currentSlide]?.name || "Cargando..."}
              </h3>
              <p className="text-lg font-montserrat-light transition-all duration-300">
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
              impulsar el desarrollo educativo y el liderazgo juvenil. Juntos
              podemos crear un impacto positivo en la comunidad.
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
  );
};

export default SponsorsView;
