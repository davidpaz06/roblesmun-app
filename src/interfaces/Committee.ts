export interface Committee {
  name: string;
  topic: string;
  img: string;
  color: string;
  seats: number;
  seatsList: string[];
  description?: string;
  studyGuide?: string;
  legalFramework?: string[];
}
