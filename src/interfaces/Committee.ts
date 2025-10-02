export interface Committee {
  name: string;
  topic: string;
  img: string;
  color: string;
  seats: number;
  seatsList: Array<{
    name: string;
    available: boolean;
  }>;
  description?: string;
  studyGuide?: string;
  legalFramework?: string[];
  president?: string;
}
