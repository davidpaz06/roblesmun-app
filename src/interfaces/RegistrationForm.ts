export interface RegistrationForm {
  userEmail: string;
  userInstitution: string;
  userFirstName: string;
  userLastName: string;
  userIsFaculty: boolean;

  institution: string;
  isBigGroup: boolean;
  independentDelegate: boolean;
  seats: number;
  seatsRequested: string[];
  requiresBackup: boolean;
  backupSeatsRequested: string[];
  paymentMethod: string;
  amount: number;
  transactionId: string;

  pdfUrl?: string;
}
