"use client";

import { forwardRef, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-lg border border-white/10 bg-white/5 p-4 ${
          hover ? "hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`mb-3 ${className}`} {...props} />
  )
);

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h3 ref={ref} className={`text-sm font-medium text-white ${className}`} {...props} />
  )
);

CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p ref={ref} className={`text-xs text-white/50 mt-1 ${className}`} {...props} />
  )
);

CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => <div ref={ref} className={className} {...props} />
);

CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
