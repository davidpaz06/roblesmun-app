import { createContext } from "react";

export interface SlotsContextType {
  slots: number;
  setSlots: (n: number) => void;
}

export const SlotsContext = createContext<SlotsContextType | undefined>(
  undefined
);
