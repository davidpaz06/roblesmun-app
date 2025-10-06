import { useState, useEffect, type FC } from "react";
import {
  FaCheck,
  FaTimes,
  FaClipboardList,
  FaExclamationTriangle,
  FaEnvelope,
  FaSpinner,
} from "react-icons/fa";
import type { RegistrationForm } from "../interfaces/RegistrationForm";
import { AssignmentsPDFGenerator } from "./AssignmentsPDFGenerator";
import { AssignmentValidationService } from "../providers/AssignmentValidationService";
import XButton from "./XButton";
import { CiCircleCheck, CiImport } from "react-icons/ci";

interface RegistrationWithId extends RegistrationForm {
  id: string;
  createdAt?: string;
  status?: "pending" | "verified" | "rejected";
  assignedSeats?: string[];
  assignmentDate?: string;
}

interface AssignmentsModalProps {
  selectedRegistration: RegistrationWithId | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAssignment: (assignedSeats: string[], notes: string) => Promise<void>;
}

const AssignmentsModal: FC<AssignmentsModalProps> = ({
  selectedRegistration,
  isOpen,
  onClose,
  onSaveAssignment,
}) => {
  const [assignmentSeats, setAssignmentSeats] = useState<string[]>([]);
  const [assignmentNotes, setAssignmentNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [lastProcessResult, setLastProcessResult] = useState<{
    success: boolean;
    message: string;
    emailSent: boolean;
  } | null>(null);

  const getAllAvailableSeats = () => {
    if (!selectedRegistration) return [];

    const allSeats = [...selectedRegistration.seatsRequested];

    if (
      selectedRegistration.requiresBackup &&
      selectedRegistration.backupSeatsRequested.length > 0
    ) {
      allSeats.push(...selectedRegistration.backupSeatsRequested);
    }

    return [...new Set(allSeats)];
  };

  const getMaxAssignableSeats = () => {
    return selectedRegistration?.seats || 0;
  };

  // Validar asignación en tiempo real
  useEffect(() => {
    if (selectedRegistration && assignmentSeats.length > 0) {
      const validationResult = AssignmentValidationService.validateAssignment(
        selectedRegistration,
        assignmentSeats
      );
      setValidationErrors(validationResult.errors);
      setValidationWarnings(validationResult.warnings);
    } else {
      setValidationErrors([]);
      setValidationWarnings([]);
    }
  }, [selectedRegistration, assignmentSeats]);

  useEffect(() => {
    if (selectedRegistration && isOpen) {
      setAssignmentSeats(selectedRegistration.assignedSeats || []);
      setAssignmentNotes("");
      setLastProcessResult(null);
      setValidationErrors([]);
      setValidationWarnings([]);
    }
  }, [selectedRegistration, isOpen]);

  if (!isOpen || !selectedRegistration) return null;

  const allAvailableSeats = getAllAvailableSeats();
  const maxAssignableSeats = getMaxAssignableSeats();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSeatToggle = (seat: string) => {
    setAssignmentSeats((prev) => {
      const isCurrentlySelected = prev.includes(seat);

      if (isCurrentlySelected) {
        return prev.filter((s) => s !== seat);
      } else {
        if (prev.length < maxAssignableSeats) {
          return [...prev, seat];
        } else {
          alert(
            `No puedes asignar más de ${maxAssignableSeats} cupos. Este es el límite según los cupos solicitados en la inscripción.`
          );
          return prev;
        }
      }
    });
  };

  const handleSelectAll = () => {
    if (
      assignmentSeats.length ===
      Math.min(allAvailableSeats.length, maxAssignableSeats)
    ) {
      setAssignmentSeats([]);
    } else {
      const seatsToSelect = allAvailableSeats.slice(0, maxAssignableSeats);
      setAssignmentSeats(seatsToSelect);
    }
  };

  const handleSelectOnlyPrimary = () => {
    const primarySeatsToSelect = selectedRegistration.seatsRequested.slice(
      0,
      maxAssignableSeats
    );
    setAssignmentSeats(primarySeatsToSelect);
  };

  const handleProcessAssignment = async () => {
    if (!selectedRegistration) return;

    setIsProcessing(true);
    try {
      const result = await AssignmentValidationService.processAssignment(
        selectedRegistration,
        assignmentSeats,
        assignmentNotes
      );

      setLastProcessResult({
        success: result.success,
        message: result.message,
        emailSent: result.emailSent,
      });

      if (result.success) {
        // Llamar al callback original para actualizar la UI
        await onSaveAssignment(assignmentSeats, assignmentNotes);

        // Mostrar resultado exitoso
        alert(result.message);
      } else {
        // Mostrar errores de validación
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error procesando asignación:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setLastProcessResult({
        success: false,
        message: `Error procesando asignación: ${errorMessage}`,
        emailSent: false,
      });
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para reenviar PDF
  const handleResendPDF = async () => {
    if (!selectedRegistration) return;

    setIsSaving(true);
    try {
      const result = await AssignmentValidationService.resendAssignmentPDF(
        selectedRegistration
      );

      if (result.success) {
        alert(result.message);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error reenviando PDF:", error);
      alert("Error al reenviar el PDF");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAssignmentPDF = () => {
    AssignmentsPDFGenerator.downloadAssignmentsPDF(
      selectedRegistration,
      assignmentSeats
    );
  };

  const handleClose = () => {
    setAssignmentSeats([]);
    setAssignmentNotes("");
    setLastProcessResult(null);
    setValidationErrors([]);
    setValidationWarnings([]);
    onClose();
  };

  const isLimitReached = assignmentSeats.length >= maxAssignableSeats;
  const hasValidationIssues =
    validationErrors.length > 0 || validationWarnings.length > 0;

  const getSeatType = (seat: string) => {
    const isPrimary = selectedRegistration.seatsRequested.includes(seat);
    const isBackup = selectedRegistration.backupSeatsRequested?.includes(seat);

    if (isPrimary) return "primary";
    if (isBackup) return "backup";
    return "unknown";
  };

  const getSeatTypeLabel = (type: string) => {
    switch (type) {
      case "primary":
        return "Principal";
      case "backup":
        return "Respaldo";
      case "both":
        return "Principal/Respaldo";
      default:
        return "";
    }
  };

  const getSeatTypeColor = (type: string) => {
    switch (type) {
      case "primary":
        return "text-blue-400 bg-blue-900/20";
      case "backup":
        return "text-orange-400 bg-orange-900/20";
      case "both":
        return "text-purple-400 bg-purple-900/20";
      default:
        return "text-gray-400 bg-gray-900/20";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-glass p-8 rounded-lg max-w-8xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-montserrat-bold text-white">
              Asignar Cupos
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {selectedRegistration.userInstitution}
            </p>
            <p className="text-xs mt-1">
              Cupos Solicitados: {maxAssignableSeats}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar modal"
          >
            <XButton size={40} />
          </button>
        </div>

        {/* Validación en Tiempo Real */}
        {hasValidationIssues && (
          <div className="mb-6 space-y-3">
            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 text-sm font-medium mb-2">
                      Errores de Validación:
                    </p>
                    <ul className="text-red-200 text-xs space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {validationWarnings.length > 0 && (
              <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 text-sm font-medium mb-2">
                      Advertencias:
                    </p>
                    <ul className="text-yellow-200 text-xs space-y-1">
                      {validationWarnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resultado del Último Procesamiento */}
        {lastProcessResult && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              lastProcessResult.success
                ? "bg-green-900/20 border-green-600"
                : "bg-red-900/20 border-red-600"
            }`}
          >
            <div className="flex items-start gap-3">
              {lastProcessResult.success ? (
                <FaCheck className="text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <FaTimes className="text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm font-medium ${
                    lastProcessResult.success
                      ? "text-green-300"
                      : "text-red-300"
                  }`}
                >
                  {lastProcessResult.success
                    ? "Asignación Procesada"
                    : "Error en el Procesamiento"}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    lastProcessResult.success
                      ? "text-green-200"
                      : "text-red-200"
                  }`}
                >
                  {lastProcessResult.message}
                </p>
                {lastProcessResult.success && (
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span
                      className={`flex items-center gap-1 ${
                        lastProcessResult.emailSent
                          ? "text-green-300"
                          : "text-yellow-300"
                      }`}
                    >
                      <FaEnvelope />
                      {lastProcessResult.emailSent
                        ? "Email enviado"
                        : "Email no enviado"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Summary */}
        <div className="my-6 p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-600 rounded-lg">
          <h4 className="text-sm font-montserrat-bold text-gray-300 mb-3">
            Resumen de Asignación
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-900/20 rounded">
              <div className="text-lg font-bold text-blue-400">
                {allAvailableSeats.length}
              </div>
              <div className="text-xs text-gray-400">Disponibles</div>
            </div>
            <div className="p-3 bg-yellow-900/20 rounded">
              <div className="text-lg font-bold text-yellow-400">
                {maxAssignableSeats}
              </div>
              <div className="text-xs text-gray-400">Límite Máximo</div>
            </div>
            <div className="p-3 bg-green-900/20 rounded">
              <div className="text-lg font-bold text-green-400">
                {assignmentSeats.length}
              </div>
              <div className="text-xs text-gray-400">Asignados</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-montserrat-bold ">
                Cupos Disponibles
              </h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleSelectOnlyPrimary}
                  className="p-2 cursor-pointer bg-glass text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLimitReached && assignmentSeats.length === 0}
                  title="Seleccionar cupos principales hasta el límite"
                >
                  Solo Principales
                </button>
                <button
                  onClick={handleSelectAll}
                  className="p-2 cursor-pointer bg-glass text-xs rounded transition-colors"
                >
                  {assignmentSeats.length ===
                  Math.min(allAvailableSeats.length, maxAssignableSeats)
                    ? "Deseleccionar Todo"
                    : `Seleccionar primeros ${maxAssignableSeats} cupos`}
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto bg-[#101010] border border-gray-600 p-4 rounded-lg">
              {allAvailableSeats.map((seat, index) => {
                const seatType = getSeatType(seat);
                const isSelected = assignmentSeats.includes(seat);
                const canSelect = !isSelected && !isLimitReached;

                return (
                  <div
                    key={`${seat}-${index}`}
                    onClick={() => {
                      if (canSelect || isSelected) handleSeatToggle(seat);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        if (canSelect || isSelected) handleSeatToggle(seat);
                      }
                    }}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-disabled={!canSelect && !isSelected}
                    aria-label={`${
                      isSelected ? "Deseleccionar" : "Seleccionar"
                    } cupo: ${seat}`}
                    tabIndex={0}
                    className={`flex items-center gap-3 py-3 px-2 rounded transition-colors ${
                      isSelected
                        ? "bg-green-900/20 hover:bg-green-900/30"
                        : canSelect
                        ? "hover:bg-gray-800"
                        : "opacity-50 cursor-not-allowed"
                    } ${
                      (canSelect || isSelected) && "cursor-pointer select-none"
                    }`}
                  >
                    <input
                      aria-label={`Checkbox para ${
                        isSelected ? "deseleccionar" : "seleccionar"
                      } cupo ${seat}`}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSeatToggle(seat)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={!canSelect && !isSelected}
                      className="w-4 h-4 text-[#d53137] bg-transparent border-gray-600 rounded focus:ring-[#d53137] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-sm text-gray-300 block truncate"
                        title={seat}
                      >
                        <span className="text-[#d53137] font-medium">
                          {index + 1}.
                        </span>{" "}
                        {seat}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getSeatTypeColor(
                          seatType
                        )}`}
                      >
                        {getSeatTypeLabel(seatType)}
                      </span>
                    </div>
                    {isSelected && (
                      <FaCheck
                        className="text-green-400 text-xs flex-shrink-0"
                        aria-hidden="true" // ✅ Icono decorativo
                      />
                    )}
                    {!canSelect && !isSelected && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        Límite alcanzado
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-montserrat-bold text-green-400">
              Cupos Asignados
            </h3>

            <div className="h-96 overflow-y-auto bg-[#101010] border border-gray-600 p-4 rounded-lg">
              {assignmentSeats.length > 0 ? (
                assignmentSeats.map((seat, index) => {
                  const seatType = getSeatType(seat);

                  return (
                    <div
                      key={`assigned-${seat}-${index}`}
                      className="flex items-center gap-3 py-3 px-2 bg-green-900/10 rounded mb-2 last:mb-0"
                    >
                      <FaCheck className="text-green-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-sm text-green-300 block truncate"
                          title={seat}
                        >
                          <span className="text-green-400 font-medium">
                            {index + 1}.
                          </span>{" "}
                          {seat}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getSeatTypeColor(
                            seatType
                          )}`}
                        >
                          {getSeatTypeLabel(seatType)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSeatToggle(seat)}
                        className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                        title="Remover cupo"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <FaClipboardList className="mx-auto text-4xl text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 italic">
                    No hay cupos asignados
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Selecciona cupos de la lista de la izquierda
                  </p>
                  <p className="text-xs text-yellow-400 mt-2">
                    Máximo: {maxAssignableSeats} cupos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-montserrat-bold text-gray-300">
            Notas de Asignación
          </h3>
          <textarea
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            placeholder="Agregar notas sobre la asignación (opcional)..."
            className="w-full h-24 p-3 bg-[#101010] border border-gray-600 rounded text-gray-300 text-sm resize-none focus:border-[#d53137] focus:ring-1 focus:ring-[#d53137] outline-none transition-colors"
            maxLength={500}
          />
          <div className="text-right">
            <span className="text-xs text-gray-500">
              {assignmentNotes.length}/500 caracteres
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        {assignmentSeats.length > 0 && (
          <div
            className={`mt-4 p-3 rounded-lg border ${
              assignmentSeats.length === maxAssignableSeats
                ? "bg-green-900/10 border-green-700/30"
                : "bg-yellow-900/10 border-yellow-700/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {assignmentSeats.length === maxAssignableSeats ? (
                <>
                  <FaCheck className="text-green-400" />
                  <span className="text-sm text-green-300">
                    Asignación completa - Se han asignado todos los cupos
                    solicitados ({maxAssignableSeats} cupos)
                  </span>
                </>
              ) : (
                <>
                  <FaExclamationTriangle className="text-yellow-400" />
                  <span className="text-sm text-yellow-300">
                    Asignación parcial -{" "}
                    {maxAssignableSeats - assignmentSeats.length} cupos
                    pendientes por asignar (de {maxAssignableSeats} solicitados)
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={handleGenerateAssignmentPDF}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={assignmentSeats.length === 0}
            title={
              assignmentSeats.length === 0
                ? "Selecciona al menos un cupo para generar PDF"
                : ""
            }
          >
            <CiImport size={20} />
            Generar PDF
          </button>

          <button
            onClick={handleProcessAssignment}
            className="bg-green-600 hover:bg-green-700 cursor-pointer px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing || validationErrors.length > 0}
          >
            {isProcessing ? (
              <>
                <FaSpinner className="animate-spin" size={20} />
                Procesando...
              </>
            ) : (
              <>
                <CiCircleCheck size={20} />
                Confirmar Asignación
              </>
            )}
          </button>

          {selectedRegistration.assignedSeats &&
            selectedRegistration.assignedSeats.length > 0 && (
              <button
                onClick={handleResendPDF}
                className="bg-glass cursor-pointer px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin" size={20} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaEnvelope size={20} />
                    Reenviar PDF
                  </>
                )}
              </button>
            )}

          <button
            onClick={handleClose}
            className="bg-glass hover:bg-gray-700 cursor-pointer px-6 py-3 rounded-lg transition-colors text-white font-medium ml-auto"
            disabled={isProcessing || isSaving}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsModal;
