import type { FC } from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

const Loader: FC<LoaderProps> = ({ size = "md", message }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  // const dotSizes = {
  //   sm: "w-2 h-2",
  //   md: "w-3 h-3",
  //   lg: "w-4 h-4",
  // };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] font-montserrat-light">
      <div className="relative mb-2">
        <div
          className={`${sizeClasses[size]} border-2 border-[#282828] rounded-full animate-spin`}
        >
          <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent border-t-[#f0f0f0] rounded-full"></div>
        </div>

        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
            sizeClasses[size === "lg" ? "md" : "sm"]
          } border-2 border-[#282828] rounded-full animate-spin`}
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        >
          <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent border-t-[#d53137] rounded-full"></div>
        </div>
      </div>

      {message ? (
        <p className="text-[#f0f0f0] text-sm font-montserrat-light animate-pulse">
          {message}
        </p>
      ) : (
        <p className="text-[#f0f0f0] text-sm font-montserrat-light animate-pulse">
          Cargando...
        </p>
      )}
    </div>
  );
};

export default Loader;
