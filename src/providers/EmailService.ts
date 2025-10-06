import emailjs from "@emailjs/browser";
import type { RegistrationForm } from "../interfaces/RegistrationForm";

interface RegistrationWithId extends RegistrationForm {
  id: string;
  createdAt?: string;
  status?: "pending" | "verified" | "rejected";
  assignedSeats?: string[];
  assignmentDate?: string;
}

export class EmailService {
  private static config = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_xxxxxxx",
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_xxxxxxx",
    userId: import.meta.env.VITE_EMAILJS_USER_ID || "user_xxxxxxx",
  };

  /**
   * Enviar notificación de asignación usando EmailJS
   */
  static async sendAssignmentPDF(
    registration: RegistrationWithId,
    assignedSeats: string[],
    assignmentNotes?: string
  ): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        throw new Error("EmailJS no está configurado correctamente");
      }
      if (!registration.userEmail) {
        throw new Error("El correo del destinatario está vacío");
      }

      const templateParams = {
        to_email: registration.userEmail,
        to_name: `${registration.userFirstName} ${registration.userLastName}`,
        from_name: "ROBLESMUN 2024",
        subject: `Asignación de Cupos - ${registration.userInstitution}`,
        institution: registration.userInstitution,
        assigned_count: assignedSeats.length.toString(),
        total_requested: registration.seats.toString(),
        transaction_id: registration.transactionId,
        assignment_date: new Date().toLocaleDateString("es-ES"),
        seats_list: assignedSeats
          .map((seat, i) => `${i + 1}. ${seat}`)
          .join("\n"),
        notes: assignmentNotes || "",
        pdf_url: registration.pdfUrl || "",
      };

      console.log("Enviando a:", templateParams.to_email);
      console.log("templateParams:", templateParams);

      await emailjs.send(
        this.config.serviceId,
        this.config.templateId,
        templateParams,
        this.config.userId
      );

      return true;
    } catch (error) {
      console.error("❌ Error enviando email:", error);
      throw new Error(
        `No se pudo enviar el correo: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  static async sendSimpleNotification(
    registration: RegistrationWithId,
    assignedSeats: string[],
    assignmentNotes?: string
  ): Promise<boolean> {
    return this.sendAssignmentPDF(registration, assignedSeats, assignmentNotes);
  }

  static isConfigured(): boolean {
    return !!(
      this.config.serviceId &&
      this.config.templateId &&
      this.config.userId
    );
  }
}
