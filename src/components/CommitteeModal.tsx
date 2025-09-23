import type { FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import XButton from "./XButton";
import type { Committee } from "../interfaces/Committee";

const CommitteeModal: FC<{
  committee: Committee;
  onClose: () => void;
}> = ({ committee, onClose }) => {
  return (
    <motion.div
      className="bg-[#101010] w-[95vw] md:w-[80vw] max-w-6xl text-black rounded-lg p-4 relative flex flex-col md:flex-row max-h-[95vh] md:max-h-[90vh] overflow-y-auto md:overflow-hidden"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        className="absolute top-4 left-4 z-10"
        aria-label="Cerrar comité"
        onClick={onClose}
      >
        <XButton size={40} />
      </button>

      <div className="text-[#f0f0f0] flex flex-col items-center font-montserrat-light rounded-lg p-4 md:p-8 w-full md:w-1/2 md:overflow-y-auto">
        <img
          className="w-full max-w-sm h-auto rounded-lg mb-4"
          src={committee.img}
          alt={committee.name}
        />
        <h1 className="font-montserrat-bold text-2xl md:text-4xl text-center mb-4">
          {committee.name}
        </h1>

        <div className="w-full space-y-2 mb-4">
          <p className="text-sm md:text-base">
            <span className="font-montserrat-bold">Tema:</span>{" "}
            {committee.topic}
          </p>
          <p className="text-sm md:text-base">
            <span className="font-montserrat-bold">Cupos:</span>{" "}
            {committee.seats}
          </p>
        </div>

        {committee.description && (
          <div className="w-full">
            <h3 className="text-lg font-montserrat-bold mb-2">Descripción</h3>
            <p className="text-sm md:text-base text-left leading-relaxed">
              {committee.description}
            </p>
          </div>
        )}
      </div>

      <div className="text-[#f0f0f0] w-full md:w-1/2 flex flex-col p-4 md:p-8 md:overflow-y-auto">
        <video
          className="w-full rounded-lg shadow-lg cursor-pointer mb-6"
          controls
          src="/videos/XVI ROBLESMUN INAUGURACION.mp4"
        />

        <div className="space-y-6">
          <div>
            <Link
              className="inline-block my-4 px-6 py-3 w-full text-center bg-glass font-montserrat-bold rounded transition-colors duration-200 hover:bg-opacity-80"
              to="/registrations"
            >
              Inscribirse
            </Link>

            <h3 className="text-lg font-montserrat-bold mb-3">
              Guía de estudio
            </h3>
            {committee.studyGuide ? (
              <a
                className="text-sm font-montserrat-light underline break-words hover:text-blue-300 transition-colors"
                href={committee.studyGuide}
                target="_blank"
                rel="noopener noreferrer"
              >
                {committee.studyGuide}
              </a>
            ) : (
              <p className="text-sm text-gray-300">¡Próximamente disponible!</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-montserrat-bold mb-3">
              Basamentos jurídicos
            </h3>
            {committee.legalFramework ? (
              <ul className="list-disc list-inside">
                {committee.legalFramework.map((link, index) => (
                  <li key={index}>
                    <a
                      className="text-sm font-montserrat-light underline break-words hover:text-blue-300 transition-colors"
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-300">¡Próximamente disponible!</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommitteeModal;
