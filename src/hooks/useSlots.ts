import { useContext } from "react";
import { SlotsContext } from "../context/SlotsContext";

export const useSlots = () => {
  const ctx = useContext(SlotsContext);
  if (!ctx) throw new Error("useSlots debe usarse dentro de SlotsProvider");
  return ctx;
};
