export interface PressItem {
  id?: string;
  edition: string;
  type: "photo" | "video";
  url: string;
  title: string;
  section: string;
  sectionBucket?: string;
  createdAt?: string;
}
