import type { PressItem } from "./PressItem";

export interface MediaGalleryProps {
  items: PressItem[];
  onMediaClick: (item: PressItem) => void;
}
