import type { FC } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import CommitteeModal from "../components/CommitteeModal";
import type { Committee } from "../interfaces/Committee";

const CommitteesView: FC = () => {
  const committees: Committee[] = [
    {
      name: "Tribunal de Distrito de los Estados Unidos para el Distrito Sur de Nueva York",
      topic: "Caso de Sean Combs (P. Diddy)",
      img: "src/assets/img/2.png",
      color: "purple-900",
      seats: 15,
      description:
        "El Tribunal de Distrito de los Estados Unidos para el Distrito Sur de Nueva York es un tribunal federal que tiene jurisdicción sobre casos civiles y penales en el distrito sur del estado de Nueva York. Este tribunal es conocido por manejar casos de alto perfil, incluyendo aquellos relacionados con delitos financieros, crimen organizado y terrorismo. En este comité, los delegados asumirán el papel de jueces y abogados en un caso ficticio basado en el juicio real de Sean Combs, también conocido como P. Diddy, quien fue acusado de posesión ilegal de armas y conducta desordenada tras un tiroteo en un club nocturno en 1999. Los delegados deberán analizar las pruebas presentadas, escuchar los argumentos de ambas partes y emitir un veredicto basado en la ley y los hechos del caso.",
      studyGuide: "https://www.nysd.uscourts.gov/",
      legalFramework: [
        "https://es.wikipedia.org/wiki/Sean_Combs#Incidentes_legales",
        "https://www.nytimes.com/2001/05/25/nyregion/diddy-is-acquitted-in-shooting-at-club.html",
      ],
    },
    {
      name: "Asamblea General",
      topic: "Genocidio de Camboya (1979)",
      img: "src/assets/img/ag.png",
      color: "red-900",
      seats: 193,
      description:
        "La Asamblea General de las Naciones Unidas es uno de los seis órganos principales de la ONU y está compuesta por todos los estados miembros. Cada estado tiene un voto, independientemente de su tamaño o poder económico. La Asamblea General se reúne anualmente para discutir y coordinar políticas internacionales en una amplia gama de temas, incluyendo la paz y la seguridad, el desarrollo económico y social, los derechos humanos y el derecho internacional. En este comité, los delegados representarán a sus respectivos países y debatirán sobre el genocidio de Camboya, que ocurrió entre 1975 y 1979 bajo el régimen de los Jemeres Rojos. Los delegados deberán analizar las causas y consecuencias del genocidio, así como proponer medidas para prevenir futuros actos de genocidio y promover la justicia y la reconciliación en Camboya.",
      studyGuide: "https://www.un.org/en/ga/",
      legalFramework: [
        "https://es.wikipedia.org/wiki/Genocidio_camboyano",
        "https://www.un.org/en/genocideprevention/cambodia.shtml",
      ],
    },
    {
      name: "Cabinet of the United Kingdom",
      topic: "London Bombing (2005)",
      img: "src/assets/img/3.png",
      color: "gray-900",
      seats: 20,
      description:
        "El Gabinete del Reino Unido es el principal órgano de toma de decisiones del gobierno británico y está compuesto por los ministros más importantes, incluyendo al Primer Ministro y a los jefes de los departamentos gubernamentales. El Gabinete se reúne regularmente para discutir y coordinar políticas en una amplia gama de temas, incluyendo la economía, la seguridad nacional, la salud y la educación. En este comité, los delegados asumirán el papel de miembros del Gabinete y debatirán sobre los atentados de Londres que ocurrieron el 7 de julio de 2005. Estos ataques terroristas coordinados tuvieron como objetivo el sistema de transporte público de Londres y resultaron en la muerte de 52 personas y cientos de heridos. Los delegados deberán analizar las causas y consecuencias de los atentados, así como proponer medidas para mejorar la seguridad nacional y prevenir futuros actos de terrorismo en el Reino Unido.",
    },
    {
      name: "Consejo de Seguridad",
      topic: "Tercera Guerra Mundial (2050)",
      img: "src/assets/img/4.png",
      color: "yellow-900",
      seats: 15,
      description:
        "El Consejo de Seguridad de las Naciones Unidas es uno de los seis órganos principales de la ONU y es responsable de mantener la paz y la seguridad internacionales. Está compuesto por 15 miembros, incluyendo cinco miembros permanentes con derecho a veto (Estados Unidos, Rusia, China, Francia y el Reino Unido) y diez miembros no permanentes elegidos por la Asamblea General por un período de dos años. El Consejo de Seguridad tiene la autoridad para tomar decisiones vinculantes sobre cuestiones relacionadas con la paz y la seguridad, incluyendo la imposición de sanciones, el establecimiento de misiones de mantenimiento de la paz y la autorización del uso de la fuerza militar. En este comité, los delegados representarán a sus respectivos países y debatirán sobre un escenario ficticio de una Tercera Guerra Mundial en el año 2050. Los delegados deberán analizar las causas y consecuencias del conflicto, así como proponer medidas para resolver la crisis y promover la paz y la seguridad internacionales.",
    },
    {
      name: "Cumbre para la reestructuración política global",
      topic: "Nuevo Orden Mundial (2050)",
      img: "src/assets/img/5.png",
      color: "gray-900",
      seats: 50,
    },
    {
      name: "Organización Mundial de la Salud",
      topic: "Rebrote de la Peste Negra (2050)",
      img: "src/assets/img/6.png",
      color: "green-900",
      seats: 194,
    },
    {
      name: "Laboratorio Nacional de Los Álamos",
      topic: "Proyecto Manhattan",
      img: "src/assets/img/7.png",
      color: "orange-900",
      seats: 10,
    },
  ];

  // const [committees, setCommittees] = useState<Committee[]>(committees),
  const [selectedCommittee, setSelectedCommittee] = useState<
    null | (typeof committees)[0]
  >(null);

  return (
    <>
      <section className="text-[#f0f0f0] w-[90%] min-h-[80vh] pt-40 flex justify-center">
        <div className="w-full max-w-[1200px] px-4">
          <h2 className="text-[4em] my-4 font-montserrat-bold transition-all duration-500 ease-in-out">
            COMITÉS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {committees.map((committee) => (
              <div
                key={committee.name}
                className={`bg-glass p-2 rounded-lg overflow-hidden shadow-lg cursor-pointer`}
                onClick={() => setSelectedCommittee(committee)}
              >
                <img
                  src={committee.img}
                  alt={committee.name}
                  className="w-full h-48 object-contain"
                />
                <div className="p-4">
                  <h3 className="text-lg font-montserrat-bold mb-2">
                    {committee.name}
                  </h3>
                  <p className="text-xs font-montserrat-light">
                    {committee.topic}
                  </p>
                  <p className="text-xs font-montserrat-bold">
                    Cupos: {committee.seats}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
