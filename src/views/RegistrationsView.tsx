import { type FC, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaUserCheck,
  FaCreditCard,
  FaReceipt,
  FaCheckCircle,
  FaWhatsapp,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { FirestoreService } from "../firebase/firestore";
import type { Committee } from "../interfaces/Committee";
import Loader from "../components/Loader";

const steps = [
  {
    icon: <FaClipboardList className="text-[#d53137] text-3xl mb-2" />,
    title: "Selecciona cupos",
    desc: "Elige la cantidad de cupos que deseas reservar para tu delegación.",
  },
  {
    icon: <FaUserCheck className="text-[#d53137] text-3xl mb-2" />,
    title: "Comités y cupos",
    desc: "Escoge los comités y asigna cupos principales y de respaldo.",
  },
  {
    icon: <FaCreditCard className="text-[#d53137] text-3xl mb-2" />,
    title: "Método de pago",
    desc: "Selecciona tu método de pago y realiza la transacción.",
  },
  {
    icon: <FaReceipt className="text-[#d53137] text-3xl mb-2" />,
    title: "Referencia",
    desc: "Ingresa el número de referencia o confirmación de pago.",
  },
  {
    icon: <FaCheckCircle className="text-[#d53137] text-3xl mb-2" />,
    title: "Confirmación",
    desc: "Confirma tu inscripción y revisa tu correo para más detalles.",
  },
];

const RegistrationsView: FC = () => {
  const { user } = useAuth();

  const [committees, setCommittees] = useState<Committee[]>([]);
  const [isLoadingCommittees, setIsLoadingCommittees] = useState<boolean>(true);
  const [committeesError, setCommitteesError] = useState<string>("");
  const [availableSeatsCount, setAvailableSeatsCount] = useState<number>(0);

  const fetchCommittees = async () => {
    setIsLoadingCommittees(true);
    setCommitteesError("");
    try {
      console.log("🔄 Verificando disponibilidad de comités...");
      const data = await FirestoreService.getAll<Committee>("committees");

      const availableCommittees = data.filter(
        (committee) =>
          committee.seatsList &&
          committee.seatsList.length > 0 &&
          committee.seatsList.some((seat) => seat.available)
      );

      const totalAvailableSeats = availableCommittees.reduce(
        (total, committee) => {
          return (
            total + committee.seatsList.filter((seat) => seat.available).length
          );
        },
        0
      );

      setCommittees(availableCommittees);
      setAvailableSeatsCount(totalAvailableSeats);

      console.log("✅ Comités disponibles:", availableCommittees.length);
      console.log("✅ Cupos disponibles:", totalAvailableSeats);
    } catch (error) {
      console.error("❌ Error cargando comités:", error);
      setCommitteesError("Error verificando la disponibilidad de comités");
    } finally {
      setIsLoadingCommittees(false);
    }
  };

  useEffect(() => {
    fetchCommittees();
  }, []);

  const areRegistrationsAvailable = () => {
    return committees.length > 0 && availableSeatsCount > 0;
  };

  const RegistrationStatusButton = () => {
    if (isLoadingCommittees) {
      return (
        <div className="px-10 py-4 bg-glass font-montserrat-bold rounded-xl shadow-lg text-center flex items-center gap-3">
          <Loader message="" />
          <span>Verificando disponibilidad...</span>
        </div>
      );
    }

    if (committeesError) {
      return (
        <div className="px-10 py-4 bg-red-900/20 border border-red-600 font-montserrat-bold rounded-xl shadow-lg text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <FaExclamationTriangle className="text-red-400" />
            <span className="text-red-300">
              Error verificando disponibilidad
            </span>
          </div>
          <button
            onClick={fetchCommittees}
            className="text-sm underline text-red-200 hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (!user) {
      return (
        <Link
          to="/login"
          className="px-10 py-4 bg-[#d53137] font-montserrat-bold rounded-xl shadow-lg transition-all duration-200 hover:bg-[#b71c1c] hover:scale-105"
        >
          Inicia sesión para inscribirse
        </Link>
      );
    }

    if (!areRegistrationsAvailable()) {
      return (
        <div className="w-full mt-4 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
          <h3 className="text-blue-300 font-montserrat-bold mb-2 flex items-center gap-2">
            <FaClock />
            Estado actual de las inscripciones
          </h3>
          <p className="text-sm text-blue-200 font-montserrat-light">
            {committees.length === 0
              ? "Los comités están siendo preparados por nuestro equipo académico. Una vez estén listos, podrás ver toda la información y realizar tu inscripción."
              : "Todos los cupos han sido asignados temporalmente. Algunos podrían liberarse, así que mantente atento a las actualizaciones."}
          </p>
        </div>
      );
    }

    if (user.isFaculty !== true) {
      return (
        <div className="px-10 py-4 bg-glass font-montserrat-bold rounded-xl shadow-lg text-center max-w-lg">
          <p className="text-base mb-2">
            Solo el Faculty puede inscribir a la delegación
          </p>
          <p className="text-sm text-gray-300 font-montserrat-light">
            Por favor, contacta a tu Faculty para continuar con el proceso de
            inscripción.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4">
        <Link
          to="/registrations/checkout"
          className="px-10 py-4 bg-[#d53137] font-montserrat-bold rounded-xl shadow-lg transition-all duration-200 hover:bg-[#b71c1c] hover:scale-105"
        >
          Inscríbete ahora
        </Link>
        <div className="text-center">
          <p className="text-sm text-green-400 font-montserrat-bold">
            ✅ {committees.length} comités disponibles
          </p>
          <p className="text-xs text-gray-400 font-montserrat-light">
            {availableSeatsCount} cupos disponibles en total
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <meta title="ROBLESMUN - Inscripciones" />
      <meta
        name="registrations"
        content="Inscripciones para XVII edición de ROBLESMUN"
      />
      <title>ROBLESMUN - Inscripciones</title>

      <section className="text-[#f0f0f0] w-[90%] sm:pt-32 flex justify-center font-montserrat-light">
        <div className="w-full max-w-[1200px] px-4">
          <h2 className="sm:text-[3.5em] text-[2em] my-4 font-montserrat-bold transition-all duration-500 ease-in-out">
            Inscripciones
          </h2>

          <p>
            Nos complace anunciar que para esta edición, contamos con un nuevo
            sistema de inscripciones en línea. Aquí podrás realizar tu proceso
            de inscripción de forma rápida y sencilla. A continuación te
            explicamos paso a paso cómo hacerlo:
          </p>
        </div>
      </section>

      <section className="text-[#f0f0f0] w-[90%] py-12 flex justify-center items-center font-montserrat-light">
        <div className="w-full max-w-[1200px] px-4 flex flex-col items-center">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full mb-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`bg-glass rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 ${
                  !areRegistrationsAvailable() && !isLoadingCommittees
                    ? "opacity-60"
                    : ""
                }`}
              >
                {step.icon}
                <h3 className="font-montserrat-bold text-lg mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-300 text-center">{step.desc}</p>
              </div>
            ))}
          </div>

          <RegistrationStatusButton />
        </div>
      </section>

      <section className="text-[#f0f0f0] mb-12 w-full flex justify-center items-center font-montserrat-light">
        <div className="w-[80%] sm:w-full max-w-[900px] sm:max-w-[1200px] bg-glass rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-montserrat-bold mb-4 text-[#d53137]">
            ¿Tienes dudas?
          </h2>
          <p className="mb-6 text-base text-gray-300">
            Si tienes dudas
            {areRegistrationsAvailable()
              ? ", revisa la guía de inscripción o"
              : ""}{" "}
            contáctanos por correo. Nuestro equipo está listo para ayudarte en
            cada paso del proceso
            {!areRegistrationsAvailable()
              ? " y te notificaremos cuando las inscripciones estén disponibles"
              : ""}
            .
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="mailto:mun@losroblesenlinea.com.ve"
              className="px-6 py-2 bg-[#d53137] text-white font-montserrat-bold rounded-lg transition-all duration-200 hover:bg-[#b71c1c]"
            >
              Contactar por correo
            </a>

            <a
              href="https://wa.me/584129968751"
              className="px-6 py-2 bg-[#25D366] text-white font-montserrat-bold rounded-lg transition-all duration-200 hover:bg-[#128C7E]"
            >
              <FaWhatsapp className="inline-block mr-2" size={24} />
              Contactar por Whatsapp
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegistrationsView;
