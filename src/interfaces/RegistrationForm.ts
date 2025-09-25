export interface RegistrationForm {
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
}
