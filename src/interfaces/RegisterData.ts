export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institution?: string;
  facultyCode?: string | null;
}
