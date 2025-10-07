import { type FC } from "react";
import { IoEyeOutline } from "react-icons/io5";
import { CiImport } from "react-icons/ci";
import type { RegistrationForm } from "../interfaces/RegistrationForm";
import XButton from "./XButton";

interface RegistrationWithId extends RegistrationForm {
  id: string;
  createdAt?: string;
  status?: "pending" | "verified" | "rejected";
}

interface RegistrationsManagementModalProps {
  selectedRegistration: RegistrationWithId | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF: (pdfUrl: string, fileName: string) => void;
}

const RegistrationsManagementModal: FC<RegistrationsManagementModalProps> = ({
  selectedRegistration,
  isOpen,
  onClose,
  onDownloadPDF,
}) => {
  if (!isOpen || !selectedRegistration) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    if (selectedRegistration.pdfUrl) {
      onDownloadPDF(
        selectedRegistration.pdfUrl,
        `inscripcion-${selectedRegistration.userFirstName}-${selectedRegistration.userLastName}.pdf`
      );
    }
  };

  const handleViewPDF = () => {
    if (selectedRegistration.pdfUrl) {
      window.open(selectedRegistration.pdfUrl, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-black/10 rounded-xl border border-white/20 shadow-lg backdrop-blur-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#242424] flex justify-between items-center">
          <h2 className="text-2xl font-montserrat-bold">
            Detalles de Inscripción
          </h2>
          <button
            aria-label="Cerrar modal"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XButton size={40} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del Usuario */}
            <div className="space-y-4">
              <h3 className="text-lg font-montserrat-bold text-[#d53137] mb-3">
                Información del Usuario
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex flex-col sm:flex-row">
                  <strong className="text-gray-300 min-w-[120px]">
                    Nombre:
                  </strong>
                  <span className="text-white">
                    {selectedRegistration.userFirstName}{" "}
                    {selectedRegistration.userLastName}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <strong className="text-gray-300 min-w-[120px]">
                    Email:
                  </strong>
                  <span className="text-white break-all">
                    {selectedRegistration.userEmail}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <strong className="text-gray-300 min-w-[120px]">
                    Institución:
                  </strong>
                  <span className="text-white">
                    {selectedRegistration.userInstitution}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <strong className="text-gray-300 min-w-[120px]">Tipo:</strong>
                  <span className="text-white">
                    {selectedRegistration.userIsFaculty
                      ? "Faculty"
                      : "Estudiante"}
                  </span>
                </div>
              </div>
            </div>

            {/* Detalles de Inscripción */}
            <div className="space-y-4">
              <h3 className="text-lg font-montserrat-bold text-[#d53137] mb-3">
                Detalles de Inscripción
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex flex-col sm:flex-row">
                  <strong className="text-gray-300 min-w-[140px]">
                    Fecha:
                  </strong>
                  <span className="text-white">
                    {selectedRegistration.createdAt
                      ? new Date(
                          selectedRegistration.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <strong className="text-gray-300 min-w-[140px]">
                    Tipo delegación:
                  </strong>
                  <span className="text-white">
                    {selectedRegistration.independentDelegate
                      ? "Delegación independiente"
                      : selectedRegistration.isBigGroup
                      ? "Delegación grande"
                      : "Delegación pequeña"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <strong className="text-gray-300 min-w-[140px]">
                    Cupos:
                  </strong>
                  <span className="text-white">
                    {selectedRegistration.seats}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <strong className="text-gray-300 min-w-[140px]">
                    Método pago:
                  </strong>
                  <span className="text-white">
                    {selectedRegistration.paymentMethod}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <strong className="text-gray-300 min-w-[140px]">
                    Monto:
                  </strong>
                  <span className="text-white">
                    ${selectedRegistration.amount || 0} USD
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <strong className="text-gray-300 min-w-[140px]">
                    ID transacción:
                  </strong>
                  <span className="text-white font-mono text-xs break-all">
                    {selectedRegistration.transactionId}
                  </span>
                </div>
              </div>
            </div>

            {/* Cupos Principales */}
            <div className="space-y-4">
              <h3 className="text-lg font-montserrat-bold text-[#d53137] mb-3">
                Cupos Principales ({selectedRegistration.seatsRequested.length})
              </h3>
              <div className="max-h-40 overflow-y-auto bg-[#101010] border border-[rgba(255,255,255,0.2)] p-3 rounded">
                {selectedRegistration.seatsRequested.length > 0 ? (
                  selectedRegistration.seatsRequested.map((seat, index) => (
                    <div
                      key={index}
                      className="text-sm py-1 border-b border-[#242424] last:border-b-0 text-gray-300"
                    >
                      <span className="text-[#d53137] font-medium">
                        {index + 1}.
                      </span>{" "}
                      {seat}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No hay cupos principales registrados
                  </div>
                )}
              </div>
            </div>

            {/* Cupos de Respaldo */}
            {selectedRegistration.requiresBackup &&
              selectedRegistration.backupSeatsRequested.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-montserrat-bold text-[#d53137] mb-3">
                    Cupos de Respaldo (
                    {selectedRegistration.backupSeatsRequested.length})
                  </h3>
                  <div className="max-h-40 overflow-y-auto bg-[#101010] border border-[rgba(255,255,255,0.2)] p-3 rounded">
                    {selectedRegistration.backupSeatsRequested.map(
                      (seat, index) => (
                        <div
                          key={index}
                          className="text-sm py-1 border-b border-[#242424] last:border-b-0 text-gray-300"
                        >
                          <span className="text-[#d53137] font-medium">
                            {index + 1}.
                          </span>{" "}
                          {seat}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Estado de la Inscripción */}
          <div className="mt-6 p-4 bg-[#101010] border border-[rgba(255,255,255,0.2)] rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-montserrat-bold text-gray-300 mb-1">
                  Estado de la Inscripción
                </h4>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedRegistration.status === "verified"
                        ? "bg-green-900/20 text-green-400"
                        : selectedRegistration.status === "rejected"
                        ? "bg-red-900/20 text-red-400"
                        : "bg-yellow-900/20 text-yellow-400"
                    }`}
                  >
                    {selectedRegistration.status === "verified"
                      ? "Verificada"
                      : selectedRegistration.status === "rejected"
                      ? "Rechazada"
                      : "⏳ Pendiente"}
                  </span>
                </div>
              </div>

              {/* PDF Status */}
              <div className="text-right">
                <h4 className="text-sm font-montserrat-bold text-gray-300 mb-1">
                  Documento PDF
                </h4>
                <div className="flex items-center gap-2">
                  {selectedRegistration.pdfUrl ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400">
                      Disponible
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400">
                      No disponible
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-700">
            {selectedRegistration.pdfUrl && (
              <>
                <button
                  onClick={handleViewPDF}
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-white font-medium"
                >
                  <IoEyeOutline size={20} />
                  Ver PDF
                </button>

                <button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 cursor-pointer px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-white font-medium"
                >
                  <CiImport size={20} />
                  Descargar PDF
                </button>

                <button
                  onClick={onClose}
                  className="bg-glass hover:bg-gray-700 cursor-pointer px-6 py-3 rounded-lg transition-colors text-white font-medium ml-auto"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationsManagementModal;
