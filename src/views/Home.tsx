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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBoardImages = async () => {
      setIsLoading(true);
      try {
        // Generar URLs públicas desde Supabase
        const boardWithImages = initialBoard.map((person) => ({
          ...person,
          img: person.fileName
            ? SupabaseStorage.getPublicImageUrl(person.fileName, "general")
            : "",
        }));

        setBoard(boardWithImages);

        // ✅ Usar callback para tracking de progreso
        let loadedCount = 0;
        const totalImages = boardWithImages.filter(
          (person) => person.img
        ).length;

        await Promise.all(
          boardWithImages.map((person) =>
            person.img
              ? preloadImage(person.img, () => {
                  loadedCount++;
                  console.log(
                    `Imágenes cargadas: ${loadedCount}/${totalImages}`
                  );
                })
              : Promise.resolve()
          )
        );

        console.log(`✅ Todas las imágenes cargadas: ${totalImages}`);
      } catch (error) {
        console.error("Error loading board images:", error);
        setBoard(
          initialBoard.map((person) => ({
            ...person,
            img: `src/assets/img/${person.fileName}`,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBoardImages();
  }, []);

  // ✅ Función para precargar imágenes con callback
  const preloadImage = (
    src: string,
    onLoadCallback?: () => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        onLoadCallback?.(); // Ejecutar callback si existe
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader message="Cargando directiva..." />
      </div>
    );
  }

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

      <section className="sm:h-72 min-h-54 mb-8 w-full font-montserrat-light flex justify-end items-end">
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
            src="src/assets/img/fazio.png"
            alt=""
          />
        </div>
      </section>

      <section className="w-[90%] my-4 flex flex-col justify-start">
        <h2 className="text-[3.5em] font-montserrat-bold transition-all duration-500 ease-in-out">
          DIRECTIVA
        </h2>

        <p className="font-montserrat-light mb-8">
          Conoce a los miembros de la directiva que harán posible esta edición
          de ROBLESMUN.
        </p>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
          {board.map((person, idx) => (
            <div className="flex flex-col font-montserrat-light" key={idx}>
              <div className="rounded-xl overflow-hidden flex flex-col items-center">
                <BoardMemberImage
                  src={person.img}
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
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-glass rounded-xl">
          <Loader size="sm" message="" />
        </div>
      )}

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

      {imageError && (
        <div className="h-[320px] w-full bg-glass rounded-xl flex items-center justify-center mb-8">
          <span className="text-gray-400 text-sm">Imagen no disponible</span>
        </div>
      )}
    </div>
  );
};

export default Home;
