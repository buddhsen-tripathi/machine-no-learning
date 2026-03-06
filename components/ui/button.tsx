"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "primary";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 rounded-lg";

    const variants = {
      default: "bg-white/10 hover:bg-white/20 text-white",
      outline: "border border-white/20 bg-transparent hover:bg-white/10 text-white",
      ghost: "hover:bg-white/10 text-white/60 hover:text-white",
      primary: "bg-emerald-500 hover:bg-emerald-400 text-black",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-sm gap-2",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
