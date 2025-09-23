import { useState, type ReactNode } from "react";
import { SlotsContext } from "../context/SlotsContext";

export const SlotsProvider = ({ children }: { children: ReactNode }) => {
  const [slots, setSlots] = useState(0);
  return (
    <SlotsContext.Provider value={{ slots, setSlots }}>
      {children}
    </SlotsContext.Provider>
  );
};
