import type { FC } from "react";

interface XButtonProps {
  size?: number;
  thickness?: "thin" | "normal" | "thick";
  color?: "white" | "black" | "red" | "blue";
  className?: string;
}

const thicknessClasses: Record<
  NonNullable<XButtonProps["thickness"]>,
  string
> = {
  thin: "h-px",
  normal: "h-[2px]",
  thick: "h-1",
};

const colorClasses: Record<NonNullable<XButtonProps["color"]>, string> = {
  white: "bg-white",
  black: "bg-black",
  red: "bg-red-500",
  blue: "bg-blue-500",
};

const sizeClassesMap: Record<number, string> = {
  16: "w-4 h-4",
  20: "w-5 h-5",
  24: "w-6 h-6",
  28: "w-7 h-7",
  32: "w-8 h-8",
  36: "w-9 h-9",
  40: "w-10 h-10",
  48: "w-12 h-12",
};

const XButton: FC<XButtonProps> = ({
  size = 48,
  thickness = "thin",
  color = "white",
  className = "",
}) => {
  const sizeClasses = sizeClassesMap[size];
  const lineBase = `absolute left-0 top-1/2 block w-full origin-center -translate-y-1/2 rounded ${thicknessClasses[thickness]} ${colorClasses[color]}`;

  return (
    <div
      className={`cursor-pointer relative inline-block align-middle select-none ${sizeClasses} ${className}`}
      role="presentation"
      aria-hidden="true"
    >
      <span className={`${lineBase} rotate-45`} />
      <span className={`${lineBase} -rotate-45`} />
    </div>
  );
};

export default XButton;
