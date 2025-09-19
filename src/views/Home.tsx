import type { FC } from "react";

const Home: FC = () => {
  const board = [
    {
      img: "src/assets/img/fazio.png",
      name: "Juan Miranda",
      role: "Secretario General",
    },
    {
      img: "src/assets/img/fazio.png",
      name: "Samuel Morr",
      role: "Secretario General",
    },
    {
      img: "src/assets/img/fazio.png",
      name: "Christian Ramírez",
      role: "Director Académico",
    },
    {
      img: "src/assets/img/fazio.png",
      name: "Tomás Luzardo",
      role: "Director Ejecutivo",
    },
    {
      img: "src/assets/img/fazio.png",
      name: "Benjamín Salazar",
      role: "Faculty Advisor",
    },
  ];

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
              “Queremos cambiar el mundo, pero hemos de comenzar por cambiar
              nuestro propio corazón y el ambiente que nos rodea.”
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

      <section className=" w-[90%] my-4 flex flex-col justify-start">
        <h2 className="text-[3.5em] font-montserrat-bold transition-all duration-500 ease-in-out">
          DIRECTIVA
        </h2>

        <p className="font-montserrat-light mb-8">
          Conoce a los miembros de la directiva que harán posible esta edición
          de ROBLESMUN.
        </p>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-16">
          {board.map((person, idx) => (
            <div className="flex flex-col font-montserrat-light" key={idx}>
              <div className="rounded-xl flex flex-col items-center">
                <img
                  src={person.img}
                  alt={person.name}
                  className="h-[320px] w-auto object-cover rounded-xl shadow-lg mb-8"
                />
              </div>
              <h2 className="text-xl text-center underline underline-offset-6">
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

export default Home;
