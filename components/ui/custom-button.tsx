import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary";
}

export function CustomButton({
  className,
  variant = "default",
  ...props
}: CustomButtonProps) {
  return (
    <button
      className={cn(
        "px-[8px] py-[5px] rounded-md text-sm font-medium transition-colors cursor-pointer",
        variant === "default" && "bg-blue-500 text-white hover:bg-blue-600",
        variant === "outline" &&
          "border border-gray-600 text-gray-300 hover:bg-gray-700",
        variant === "secondary" &&
          "bg-[#fafafa1a] text-[#fffffff2]",
        className
      )}
      {...props}
    />
  );
}
