import type { FC } from "react";
import { committees } from "../config/committees";
import { paymentInformation, additionalMessages } from "../config/paymentInfo";
import type { RegistrationForm } from "../interfaces/RegistrationForm";
import { FaCheck } from "react-icons/fa6";

interface CarousselProps {
  slides: number;
  currentStep: number;
  paymentMethods?: string[];
  formData: RegistrationForm;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationForm>>;
  setCurrentStep: (step: number) => void;
}

const Caroussel: FC<CarousselProps> = ({
  slides,
  currentStep,
  paymentMethods,
  formData,
  setFormData,
  setCurrentStep,
}) => {
  const handleSeatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seatsValue = parseInt(e.target.value) || 0;

    setFormData((prev) => ({
      ...prev,
      seats: seatsValue,
      independentDelegate: seatsValue === 1,
      isBigGroup: seatsValue >= 13,
    }));
  };

  const handleSeatSelection = (seat: string, isChecked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      seatsRequested: isChecked
        ? [...prev.seatsRequested, seat]
        : prev.seatsRequested.filter((s) => s !== seat),
    }));
  };

  const handlePaymentMethod = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const slideContent = [
    {
      title: "Seleccionar cupos",
      content: (
        <div className="text-center">
          <h3 className="text-xl mb-4">¿Cuántos cupos deseas reservar?</h3>
          <label aria-label="cupos" htmlFor="cupos">
            <input
              className="bg-glass p-4 text-4xl font-montserrat-bold text-center rounded-lg"
              type="number"
              id="cupos"
              min="1"
              max="30"
              value={formData.seats || ""}
              onChange={handleSeatsChange}
              placeholder="0"
            />
          </label>
          <p className="mt-2 text-sm text-gray-300">
            (Máximo 30 cupos por inscripción)
          </p>
        </div>
      ),
    },
    {
      title: "Seleccionar cupos",
      content: (
        <div className="w-full">
          <h3 className="text-xl mb-6 text-center">
            Solicita los cupos deseados
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto">
            {committees.map((committee) => (
              <div key={committee.name} className="bg-glass/50 p-4 rounded-lg">
                <img
                  src={committee.img}
                  alt={committee.name}
                  className="w-full h-32 object-contain mb-3"
                />
                <h4 className="text-sm font-montserrat-bold mb-3 text-center min-h-[40px] flex items-center justify-center">
                  {committee.name}
                </h4>

                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {committee.seatsList.map((seat, index) => (
                    <label
                      key={`${committee.name}-${seat}-${index}`}
                      className="flex items-center gap-2 text-xs cursor-pointer hover:bg-black/20 p-1 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        name={`${committee.name}-seats`}
                        value={seat}
                        checked={formData.seatsRequested.includes(seat)}
                        onChange={(e) =>
                          handleSeatSelection(seat, e.target.checked)
                        }
                        className="w-3 h-3 text-blue-600 bg-transparent border border-gray-400 rounded focus:ring-blue-500 focus:ring-1"
                      />
                      <span className="font-montserrat-light">{seat}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs text-gray-300">
                    Cupos disponibles: {committee.seats}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    {
      title: "Método de pago",
      content: (
        <div className="text-center">
          <h3 className="text-xl font-montserrat-light mb-4">
            ¿Cómo deseas pagar?
          </h3>
          <div className="space-y-4 flex flex-col items-center gap-4">
            {paymentMethods?.map((method) => (
              <button
                key={method}
                onClick={() => handlePaymentMethod(method)}
                className={`cursor-pointer relative block w-full max-w-sm px-4 py-3 rounded-lg transition-all duration-200 ${
                  formData.paymentMethod === method
                    ? "bg-[#f0f0f0] text-[#242424] font-montserrat-bold"
                    : "bg-glass"
                }`}
              >
                {formData.paymentMethod === method && (
                  <FaCheck className="absolute left-[5%] top-1/2 transform -translate-y-1/2 text-[#242424]" />
                )}
                {method}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Validar pago",
      content: (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-glass p-6 rounded-lg">
              <h4 className="font-montserrat-bold mb-4 text-lg">
                Información de pago
              </h4>

              {formData.paymentMethod ? (
                (() => {
                  const paymentInfo = paymentInformation.find(
                    (info) => info.method === formData.paymentMethod
                  );

                  if (!paymentInfo) return null;

                  return (
                    <div className="space-y-3 text-sm">
                      {Object.entries(paymentInfo.data).map(([key, value]) => (
                        <div key={key}>
                          <p className="font-montserrat-bold">{key}:</p>
                          <p className="text-gray-300">{value}</p>
                        </div>
                      ))}

                      <div
                        className={`mt-4 p-3 bg-${paymentInfo.messageColor}-500/20 rounded-lg`}
                      >
                        <p
                          className={`text-xs text-${paymentInfo.messageColor}-200`}
                        >
                          {paymentInfo.message}
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center text-gray-400">
                  <p>Selecciona un método de pago para ver los detalles</p>
                </div>
              )}
            </div>

            {/* Columna derecha - Datos del usuario/resumen */}
            <div className="bg-glass/30 p-6 rounded-lg">
              <h4 className="font-montserrat-bold mb-4 text-lg">
                Resumen de inscripción
              </h4>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-montserrat-bold">Cupos solicitados:</p>
                  <p className="text-gray-300">{formData.seats}</p>
                </div>

                <div>
                  <p className="font-montserrat-bold">
                    Asientos seleccionados:
                  </p>
                  <p className="text-gray-300">
                    {formData.seatsRequested.length} asientos
                  </p>
                </div>

                <div>
                  <p className="font-montserrat-bold">Método de pago:</p>
                  <p className="text-gray-300">
                    {formData.paymentMethod || "No seleccionado"}
                  </p>
                </div>

                <div>
                  <p className="font-montserrat-bold mb-2">
                    Lista de asientos:
                  </p>
                  <div className="max-h-32 overflow-y-auto bg-black/20 p-2 rounded">
                    {formData.seatsRequested.length > 0 ? (
                      <ul className="text-xs space-y-1">
                        {formData.seatsRequested.map((seat, index) => (
                          <li key={index} className="text-gray-300">
                            • {seat}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400">
                        No hay asientos seleccionados
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#282828]">
                  <div className="flex justify-between font-montserrat-bold">
                    <span>Total a pagar:</span>
                    <span className="text-green-400">
                      ${(formData.seatsRequested.length * 10).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">$10.00 por cupo</p>
                </div>
              </div>
            </div>
          </div>

          {formData.paymentMethod && (
            <div className="mt-6 text-center">
              <div className="bg-glass/20 p-4 rounded-lg max-w-2xl mx-auto">
                <p className="text-sm font-montserrat-light">
                  {
                    additionalMessages[
                      formData.paymentMethod as keyof typeof additionalMessages
                    ]
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Finalizado",
      content: (
        <div className="text-center">
          <h3 className="text-xl font-montserrat-bold mb-4 text-green-400">
            ¡Inscripción completada!
          </h3>
          <p className="font-montserrat-light">
            Revisa tu correo para más detalles.
          </p>
          <div className="mt-4 text-sm text-gray-300">
            <p>ID de transacción: {formData.transactionId || "Pendiente"}</p>
          </div>
        </div>
      ),
    },
  ];

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < slides) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="bg-glass w-full my-8 p-16 rounded-lg font-montserrat-light">
      <div className="min-h-[300px] flex flex-col justify-center items-center">
        <div
          className="w-full transition-all duration-500 ease-in-out"
          key={currentStep}
        >
          {slideContent[currentStep - 1]?.content}
        </div>
      </div>

      <div className="flex justify-between gap-4 mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="cursor-pointer px-6 py-2 bg-glass font-montserrat-light rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80"
        >
          Anterior
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === slides}
          className="cursor-pointer px-6 py-2 bg-glass font-montserrat-light rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-80"
        >
          {currentStep === slides ? "Finalizar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
};

export default Caroussel;
