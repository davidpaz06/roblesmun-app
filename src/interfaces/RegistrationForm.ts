export interface RegistrationForm {
  faculty: string;
  institution: string;
  isBigGroup: boolean;
  independentDelegate: boolean;
  seats: number;
  seatsRequested: string[];
  paymentMethod: string;
  transactionId: string;
}
