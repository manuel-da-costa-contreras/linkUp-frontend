import { ReactNode } from "react";
import { cn } from "@utils/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6",
        className
      )}
    >
      {children}
    </article>
  );
}


