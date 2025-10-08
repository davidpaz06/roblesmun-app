import { useState, useEffect, type FC } from "react";
import { SupabaseStorage } from "../supabase/storage";
import Loader from "../components/Loader";

interface BoardMember {
  img: string;
  name: string;
  role: string;
  fileName?: string;
}

// ✅ Mover initialBoard fuera del componente (datos estáticos)
const initialBoard: BoardMember[] = [
  {
    img: "",
    name: "Juan Miranda",
    role: "Secretario General",
    fileName: "jm.jpg",
  },
  {
    img: "",
    name: "Samuel Morr",
    role: "Secretario General",
    fileName: "sm.jpg",
  },
  {
    img: "",
    name: "Christian Ramírez",
    role: "Director Académico",
    fileName: "cr.jpg",
  },
  {
    img: "",
    name: "Tomás Luzardo",
    role: "Director Ejecutivo",
    fileName: "tl.jpg",
  },
];

const Home: FC = () => {
  const [board, setBoard] = useState<BoardMember[]>([]);

  useEffect(() => {
    const loadBoardImages = () => {
      try {
        const boardWithImages = initialBoard.map((person) => ({
          ...person,
          img: person.fileName
            ? SupabaseStorage.getPublicImageUrl(person.fileName, "general")
            : "",
        }));

        setBoard(boardWithImages);
        console.log("✅ URLs de imágenes generadas desde Supabase");
      } catch (error) {
        console.error("Error loading board images:", error);
        setBoard(
          initialBoard.map((person) => ({
            ...person,
            img: `src/assets/img/${person.fileName}`,
          }))
        );
      }
    };

    loadBoardImages();
  }, []);

  return (
    <>
      <section className="text-[#f0f0f0] w-full min-h-[100vh] bg-home">
        <div className="bg-black/55 w-full h-[100vh] flex flex-col justify-center items-center">
          <h2 className="sm:text-[12em] text-[8em] font-montserrat-bold transition-all duration-500 ease-in-out">
            XVII
          </h2>
          <h1 className="sm:text-[3.5em] text-[3em] leading-[0.1] font-montserrat-light transition-all duration-500 ease-in-out">
            ROBLESMUN
          </h1>
        </div>
      </section>

      <section className="sm:h-72 min-h-54 w-full font-montserrat-light flex justify-end items-end">
        <div className="bg-[#d53137] min-h-32 w-full flex sm:flex-row flex-col justify-center items-center relative">
          <div className="py-8 pl-12 flex flex-col items-center sm:items-start">
            <p className="w-[60%] montserrat-italic text-xl">
              "Queremos cambiar el mundo, pero hemos de comenzar por cambiar
              nuestro propio corazón y el ambiente que nos rodea."
            </p>
            <p className="font-montserrat-bold self-start mt-4 pl-22 sm:pl-0">
              - Mariano Fazio
            </p>
          </div>

          <img
            className="sm:max-w-[260px] sm:w-[30%] max-w-[320px] sm:absolute bottom-0 sm:right-18 right-8 transition-all duration-500 ease-in-out"
            src="/fazio.png"
            alt=""
          />
        </div>
      </section>

      <section className="w-full relative flex items-center justify-center text-[#f0f0f0] font-montserrat-light bg-delegation">
        <div className="absolute inset-0 bg-black/65"></div>

        <div className="relative w-[90%] max-w-[1200px] py-8 text-center">
          <h2 className="text-[2.5em] sm:text-[4.5em] font-montserrat-bold mb-8 transition-all duration-500 ease-in-out">
            ¿Qué es ROBLESMUN?
          </h2>

          <div className="max-w-[1200px] mx-auto space-y-6 text-lg sm:text-xl leading-relaxed text-left">
            <p className="mb-6">
              <strong className="text-[#d53137] font-montserrat-bold">
                ROBLESMUN
              </strong>{" "}
              es el Modelo de Naciones Unidas organizado por el Liceo Los
              Robles, un evento académico que simula el funcionamiento de la
              Organización de las Naciones Unidas. Durante tres días intensos,
              estudiantes de variadas instituciones educativas se convierten en
              líderes de diferentes de países del mundo, debatiendo sobre temas
              de actualidad internacional y buscando soluciones a los grandes
              desafíos globales.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                <h3 className="text-2xl text-center font-montserrat-bold text-[#d53137] mb-4">
                  Formación Académica
                </h3>
                <p className="text-base">
                  Desarrollamos habilidades de debate, negociación, oratoria y
                  pensamiento crítico a lo largo de nuestras sesiones de debate.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                <h3 className="text-2xl text-center font-montserrat-bold text-[#d53137] mb-4">
                  Conciencia Global
                </h3>
                <p className="text-base">
                  Fomentamos el entendimiento intercultural y la conciencia
                  sobre los problemas que afectan a nuestra sociedad global.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                <h3 className="text-2xl text-center font-montserrat-bold text-[#d53137] mb-4">
                  Liderazgo
                </h3>
                <p className="text-base">
                  Preparamos a los líderes del mañana, fortaleciendo su
                  capacidad de comunicación y trabajo en equipo.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                <h3 className="text-2xl text-center font-montserrat-bold text-[#d53137] mb-4">
                  Excelencia
                </h3>
                <p className="text-base">
                  17 años de tradición formando jóvenes comprometidos con la
                  construcción de un mundo mejor.
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-[#d53137]/20 backdrop-blur-sm rounded-xl border border-[#d53137]/30">
              <p className="text-lg font-montserrat-bold text-[#d53137] mb-2">
                ¡Únete a esta experiencia transformadora!
              </p>
              <p className="text-base">
                Sé parte de la XVII edición de ROBLESMUN y vive una experiencia
                que cambiará tu perspectiva del mundo. Prepárate para delegar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-[90%] my-4 flex flex-col justify-start text-lg sm:text-xl">
        <h2 className="text-[2.75em] sm:text-[4.5em] font-montserrat-bold mb-8 transition-all duration-500 ease-in-out">
          DIRECTIVA
        </h2>

        <p className="font-montserrat-light mb-8 ">
          Conoce al equipo detrás de ROBLESMUN, comprometido con la excelencia
          de nuestro evento y la formación de futuros líderes.
        </p>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
          {(board.length > 0 ? board : initialBoard).map((person, idx) => (
            <div className="flex flex-col font-montserrat-light" key={idx}>
              <div className="rounded-xl overflow-hidden flex flex-col items-center">
                <BoardMemberImage
                  src={board.length > 0 ? person.img : ""}
                  alt={person.name}
                  className="h-[320px] w-auto object-cover rounded-xl shadow-lg mb-8 scale-125"
                />
              </div>
              <h2 className="text-xl text-center mt-4 font-montserrat-bold underline underline-offset-6">
                {person.name}
              </h2>
              <h3 className="text-base text-center">{person.role}</h3>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

const BoardMemberImage: FC<{
  src: string;
  alt: string;
  className: string;
}> = ({ src, alt, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative">
      {src && !imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-glass rounded-xl">
          <Loader size="sm" message="" />
        </div>
      )}

      {src && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            console.warn(`Failed to load image: ${src}`);
          }}
        />
      )}

      {(!src || imageError) && (
        <div className="h-[320px] w-full bg-glass rounded-xl flex items-center justify-center mb-8">
          <span className="text-gray-400 text-sm">
            {!src ? "Cargando imagen..." : "Imagen no disponible"}
          </span>
        </div>
      )}
    </div>
  );
};

export default Home;
