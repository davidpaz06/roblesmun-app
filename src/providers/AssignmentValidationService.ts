import { FirestoreService } from "../firebase/firestore";
import { EmailService } from "./EmailService";
import { AssignmentsPDFGenerator } from "../components/AssignmentsPDFGenerator";
import { SupabaseStorage } from "../supabase/storage"; // ✅ Usar tu servicio existente
import type { RegistrationForm } from "../interfaces/RegistrationForm";

interface RegistrationWithId extends RegistrationForm {
  id: string;
  createdAt?: string;
  status?: "pending" | "verified" | "rejected";
  assignedSeats?: string[];
  assignmentDate?: string;
  assignmentPdfUrl?: string;
  assignmentNotes?: string;
  assignmentValidated?: boolean;
  assignmentValidationDate?: string;
  assignmentPercentage?: number;
  isCompleteAssignment?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class AssignmentValidationService {
  /**
   * Validar asignación antes de guardar
   */
  static validateAssignment(
    registration: RegistrationWithId,
    assignedSeats: string[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validación 1: Límite de cupos
    if (assignedSeats.length > registration.seats) {
      errors.push(
        `No se pueden asignar más de ${registration.seats} cupos. Intentando asignar: ${assignedSeats.length}`
      );
    }

    // Validación 2: Cupos duplicados
    const uniqueSeats = new Set(assignedSeats);
    if (uniqueSeats.size !== assignedSeats.length) {
      errors.push("Se detectaron cupos duplicados en la asignación");
    }

    // Validación 3: Cupos válidos
    const availableSeats = [
      ...registration.seatsRequested,
      ...(registration.requiresBackup ? registration.backupSeatsRequested : []),
    ];
    const invalidSeats = assignedSeats.filter(
      (seat) => !availableSeats.includes(seat)
    );

    if (invalidSeats.length > 0) {
      errors.push(
        `Los siguientes cupos no están disponibles: ${invalidSeats.join(", ")}`
      );
    }

    // Advertencia 1: Asignación parcial
    if (assignedSeats.length < registration.seats && assignedSeats.length > 0) {
      warnings.push(
        `Asignación parcial: ${assignedSeats.length} de ${registration.seats} cupos solicitados`
      );
    }

    // Advertencia 2: Solo cupos de respaldo
    const primarySeatsAssigned = assignedSeats.filter((seat) =>
      registration.seatsRequested.includes(seat)
    );

    if (primarySeatsAssigned.length === 0 && assignedSeats.length > 0) {
      warnings.push("Todos los cupos asignados son de respaldo");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Procesar y guardar asignación con validación y envío de email
   */
  static async processAssignment(
    registration: RegistrationWithId,
    assignedSeats: string[],
    notes: string = ""
  ): Promise<{
    success: boolean;
    message: string;
    validationResult: ValidationResult;
    emailSent: boolean;
  }> {
    try {
      // Paso 1: Validar asignación
      const validationResult = this.validateAssignment(
        registration,
        assignedSeats
      );

      if (!validationResult.isValid) {
        return {
          success: false,
          message: `Validación fallida: ${validationResult.errors.join(", ")}`,
          validationResult,
          emailSent: false,
        };
      }

      // Paso 2: Generar PDF de asignaciones
      console.log("📄 Generando PDF de asignaciones...");
      const assignmentPDFBlob = AssignmentsPDFGenerator.getAssignmentsPDFBlob(
        registration,
        assignedSeats
      );

      let assignmentPdfUrl = "";
      try {
        const timestamp = Date.now();
        const institutionClean = registration.userInstitution
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase();
        const fileName = `asignacion-${institutionClean}-${timestamp}.pdf`;

        console.log("📄 Creando archivo PDF:", fileName);

        const pdfFile = new File([assignmentPDFBlob], fileName, {
          type: "application/pdf",
        });

        assignmentPdfUrl = await SupabaseStorage.uploadPDF(pdfFile);

        console.log("✅ PDF de asignaciones subido:", assignmentPdfUrl);
      } catch (uploadError) {
        console.error("❌ Error subiendo PDF de asignaciones:", uploadError);
      }

      // Paso 4: Preparar datos de asignación
      const assignmentData = {
        assignedSeats: assignedSeats,
        assignmentDate: new Date().toISOString(),
        assignmentNotes: notes,
        assignmentValidated: true,
        assignmentValidationDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "verified" as const,
        // ✅ AGREGAR: URL del PDF de asignaciones
        assignmentPdfUrl: assignmentPdfUrl,
        assignmentPercentage: Math.round(
          (assignedSeats.length / registration.seats) * 100
        ),
        isCompleteAssignment: assignedSeats.length === registration.seats,
      };

      // Paso 5: Guardar en Firestore
      await FirestoreService.update(
        "registrations",
        registration.id,
        assignmentData
      );

      console.log("✅ Asignación guardada en Firestore:", assignmentData);

      let emailSent = false;
      try {
        if (EmailService.isConfigured()) {
          // ✅ Pasar el registro actualizado con el PDF URL
          const updatedRegistration = { ...registration, ...assignmentData };
          await EmailService.sendSimpleNotification(
            updatedRegistration,
            assignedSeats,
            notes
          );
          emailSent = true;
          console.log("✅ PDF de asignaciones enviado por correo exitosamente");
        } else {
          console.warn("⚠️ Servicio de email no configurado - PDF no enviado");
        }
      } catch (emailError) {
        console.error("❌ Error enviando email:", emailError);
        // El email falló, pero la asignación se guardó exitosamente
      }

      // Paso 7: Log de auditoria
      await this.logAssignmentAction(registration.id, {
        action: "assignment_created",
        assignedSeatsCount: assignedSeats.length,
        totalSeatsRequested: registration.seats,
        emailSent,
        validationWarnings: validationResult.warnings,
        statusChanged: "verified",
        assignmentPdfUrl: assignmentPdfUrl,
        timestamp: new Date().toISOString(),
      });

      let successMessage = `Asignación procesada exitosamente. ${assignedSeats.length} cupos asignados.`;

      if (validationResult.warnings.length > 0) {
        successMessage += ` Advertencias: ${validationResult.warnings.join(
          ", "
        )}`;
      }

      if (emailSent) {
        successMessage +=
          " PDF de asignaciones enviado por correo electrónico.";
      } else {
        successMessage += " (PDF de asignaciones no enviado por correo)";
      }

      successMessage += " Estado cambiado a 'Verificado'.";

      return {
        success: true,
        message: successMessage,
        validationResult,
        emailSent,
      };
    } catch (error) {
      console.error("❌ Error procesando asignación:", error);

      // Log del error
      try {
        await this.logAssignmentAction(registration.id, {
          action: "assignment_error",
          error: error instanceof Error ? error.message : "Error desconocido",
          timestamp: new Date().toISOString(),
        });
      } catch (logError) {
        console.error("Error logging assignment error:", logError);
      }

      return {
        success: false,
        message: `Error procesando asignación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        validationResult: {
          isValid: false,
          errors: ["Error interno del sistema"],
          warnings: [],
        },
        emailSent: false,
      };
    }
  }

  private static async logAssignmentAction(
    registrationId: string,
    actionData: Record<string, any>
  ): Promise<void> {
    try {
      await FirestoreService.add("assignment_logs", {
        registrationId,
        ...actionData,
      });
    } catch (error) {
      console.error("Error logging assignment action:", error);
    }
  }

  /**
   * Reenviar PDF de asignación
   */
  static async resendAssignmentPDF(
    registration: RegistrationWithId
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (
        !registration.assignedSeats ||
        registration.assignedSeats.length === 0
      ) {
        return {
          success: false,
          message: "No hay cupos asignados para enviar",
        };
      }

      if (!EmailService.isConfigured()) {
        return {
          success: false,
          message: "Servicio de email no configurado",
        };
      }

      await EmailService.sendSimpleNotification(
        registration,
        registration.assignedSeats
      );

      // Log del reenvío
      await this.logAssignmentAction(registration.id, {
        action: "pdf_resent",
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: "PDF reenviado exitosamente por correo electrónico",
      };
    } catch (error) {
      console.error("Error reenviando PDF:", error);
      return {
        success: false,
        message: `Error reenviando PDF: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }
}
