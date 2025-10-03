import { useState, useCallback, useEffect, type FC } from "react";
import SponsorsCaroussel from "../components/SponsorsCaroussel";
import { FirestoreService } from "../firebase/firestore";
import type { Sponsor } from "../interfaces/Sponsor";
import Loader from "../components/Loader";

const SponsorsView: FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSponsors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await FirestoreService.getAll<Sponsor>("sponsors");
      setSponsors(data.length > 0 ? data : []);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      setSponsors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
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
              <h3>{sponsors[currentSlide]?.name || "Cargando..."}</h3>
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
