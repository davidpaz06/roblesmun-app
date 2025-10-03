import { useEffect, type FC } from "react";
import type { Sponsor } from "../interfaces/Sponsor";

interface SponsorsCarousselProps {
  sponsors: Sponsor[];
  currentSlide: number;
  setCurrentSlide: (idx: number) => void;
  autoSlideInterval?: number;
}

const SponsorsCaroussel: FC<SponsorsCarousselProps> = ({
  sponsors,
  currentSlide,
  setCurrentSlide,
  autoSlideInterval = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((currentSlide + 1) % sponsors.length);
    }, autoSlideInterval);
    return () => clearTimeout(timer);
  }, [currentSlide, sponsors.length, setCurrentSlide, autoSlideInterval]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex items-center justify-center h-48 w-full transition-all duration-700 ease-in-out">
        <img
          src={sponsors[currentSlide].logo}
          alt={`Logo de ${sponsors[currentSlide].name}`}
          className="max-h-48 max-w-full object-contain"
        />
      </div>
      <div className="flex gap-2 mt-8">
        {sponsors.map((_, idx) => (
          <button
            aria-label={`Go to slide ${idx + 1}`}
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              idx === currentSlide ? "bg-[#d53137] scale-125" : "bg-[#242424]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SponsorsCaroussel;
