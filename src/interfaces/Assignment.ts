export interface Assignment {
  registrationId: string;

  institution: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;

  assignedSeats: string[];
  assignmentDate: string;
  assignmentNotes?: string;
  assignmentValidated: boolean;
  assignmentValidationDate: string;

  assignmentPdfUrl?: string;

  totalSeatsRequested: number;
  assignedSeatsCount: number;
  assignmentPercentage: number;
  isCompleteAssignment: boolean;

  status: "verified";
  emailSent: boolean;
  validationWarnings?: string[];

  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface AssignmentWithId extends Assignment {
  id: string;
}
