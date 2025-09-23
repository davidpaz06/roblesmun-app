import type { FC } from "react";
import { FaCheck } from "react-icons/fa6";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  className?: string;
}

const ProgressBar: FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  steps,
  className = "",
}) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 ${className}`}>
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-[#242424] rounded-full transform -translate-y-1/2" />

        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-transparent to-[#f0f0f0] rounded-full transform -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            // const isPending = stepNumber > currentStep;

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-montserrat-bold transition-all duration-300 border-1
                    ${
                      isCompleted
                        ? "bg-transparent border-[#f0f0f0] text-[#f0f0f0]"
                        : isCurrent
                        ? "bg-[#f0f0f0] text-[#242424]"
                        : "bg-transparent text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? <FaCheck /> : stepNumber}
                </div>

                <span
                  className={`
                    mt-4 text-xs font-montserrat-light text-center max-w-20 transition-colors duration-300
                    ${
                      isCompleted || isCurrent
                        ? "text-[#f0f0f0]"
                        : "text-gray-500"
                    }
                  `}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-montserrat-light text-gray-300">
          Paso {currentStep} de {totalSteps}: {steps[currentStep - 1]}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
