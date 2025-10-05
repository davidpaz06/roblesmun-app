import { useState, type FC } from "react";
import { useAuth } from "../context/AuthContext";
import ProgressBar from "../components/ProgressBar";
import Caroussel from "../components/Caroussel";
import type { RegistrationForm } from "../interfaces/RegistrationForm";

const RegistrationsView: FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<RegistrationForm>({
    userEmail: user?.email || "",
    userInstitution: user?.institution || "",
    userFirstName: user?.firstName || "",
    userLastName: user?.lastName || "",
    userIsFaculty: user?.isFaculty || false,

    institution: user?.institution || "",
    isBigGroup: false,
    independentDelegate: false,
    seats: 0,
    seatsRequested: [],
    requiresBackup: false,
    backupSeatsRequested: [],
    paymentMethod: "",
    amount: 0,
    transactionId: "",
  });

  const registrationSteps = [
    "Seleccionar cupos",
    "Selección de comité",
    "Método de pago",
    "Validar pago",
    "Finalizado",
  ];

  const paymentMethods = [
    "Transferencia bancaria",
    "Pago móvil",
    "Zelle",
    "Efectivo",
  ];

  return (
    <>
      <section className="text-[#f0f0f0] w-[90%] min-h-[80vh] flex justify-center">
        <div className="w-full max-w-[1200px] px-4">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={registrationSteps.length}
            steps={registrationSteps}
          />

          <Caroussel
            slides={registrationSteps.length}
            currentStep={currentStep}
            paymentMethods={paymentMethods}
            formData={formData}
            setFormData={setFormData}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </section>
    </>
  );
};

export default RegistrationsView;
