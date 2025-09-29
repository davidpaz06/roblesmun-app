import { type FC } from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaUserCheck,
  FaCreditCard,
  FaReceipt,
  FaCheckCircle,
  FaWhatsapp,
} from "react-icons/fa";

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
  return (
    <>
      <section className="text-[#f0f0f0] w-[90%] sm:pt-32 flex justify-center font-montserrat-light">
        <div className="w-full max-w-[1200px] px-4">
          <h2 className="sm:text-[3.5em] text-[2.5em] my-4 font-montserrat-bold transition-all duration-500 ease-in-out">
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
                className="bg-glass rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105"
              >
                {step.icon}
                <h3 className="font-montserrat-bold text-lg mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-300 text-center">{step.desc}</p>
              </div>
            ))}
          </div>
          <Link
            to="/registrations/checkout"
            className="px-10 py-4 bg-[#d53137] text-white font-montserrat-bold rounded-xl shadow-lg transition-all duration-200 hover:bg-[#b71c1c] hover:scale-105"
          >
            Inscribirse ahora
          </Link>
        </div>
      </section>

      <section className="text-[#f0f0f0] w-full flex justify-center items-center font-montserrat-light py-12">
        <div className="w-full max-w-[900px] bg-glass rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-montserrat-bold mb-4 text-[#d53137]">
            ¿Tienes dudas?
          </h2>
          <p className="mb-6 text-base text-gray-300">
            Si tienes dudas, revisa la guía de inscripción o contáctanos por
            correo. Nuestro equipo está listo para ayudarte en cada paso del
            proceso.
          </p>
          <div className="flex gap-4">
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

// const RegistrationsView: FC = () => {
//   return (
//     <>
//       <section className="text-[#f0f0f0] w-full min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#242424] via-[#d53137]/10 to-[#101010] py-16">
//         <div className="w-full max-w-[1200px] px-4 flex flex-col items-center">
//           <h2 className="sm:text-[3.5em] text-[2.5em] my-4 font-montserrat-bold text-center transition-all duration-500 ease-in-out">
//             Inscripciones
//           </h2>
//           <p className="text-lg font-montserrat-light text-center max-w-2xl mb-8">
//             ¡Bienvenido al sistema de inscripciones en línea! Sigue estos pasos
//             para completar tu proceso de forma rápida y sencilla.
//           </p>
//           <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full mb-12">
//             {steps.map((step, idx) => (
//               <div
//                 key={idx}
//                 className="bg-glass rounded-xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105"
//               >
//                 {step.icon}
//                 <h3 className="font-montserrat-bold text-lg mb-2 text-center">
//                   {step.title}
//                 </h3>
//                 <p className="text-sm text-gray-300 text-center">{step.desc}</p>
//               </div>
//             ))}
//           </div>
//           <Link
//             to="/registrations/checkout"
//             className="px-10 py-4 bg-[#d53137] text-white font-montserrat-bold rounded-xl shadow-lg transition-all duration-200 hover:bg-[#b71c1c] hover:scale-105"
//           >
//             Inscribirse ahora
//           </Link>
//         </div>
//       </section>

//       <section className="text-[#f0f0f0] w-full flex justify-center items-center font-montserrat-light py-12">
//         <div className="w-full max-w-[900px] bg-glass rounded-xl p-8 shadow-lg">
//           <h2 className="text-2xl font-montserrat-bold mb-4 text-[#d53137]">
//             ¿Tienes dudas?
//           </h2>
//           <p className="mb-6 text-base text-gray-300">
//             Si tienes dudas, revisa la guía de inscripción o contáctanos por
//             correo. Nuestro equipo está listo para ayudarte en cada paso del
//             proceso.
//           </p>
//           <div className="flex gap-4">
//             <a
//               href="mailto:mun@losroblesenlinea.com.ve"
//               className="px-6 py-2 bg-[#d53137] text-white font-montserrat-bold rounded-lg transition-all duration-200 hover:bg-[#b71c1c]"
//             >
//               Contactar por correo
//             </a>
//             <Link
//               to="/press"
//               className="px-6 py-2 bg-glass text-[#d53137] font-montserrat-bold rounded-lg border border-[#d53137] transition-all duration-200 hover:bg-[#d53137] hover:text-white"
//             >
//               Ver guía de inscripción
//             </Link>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default RegistrationsView;
