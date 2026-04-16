import type { ReactNode } from "react";
import { cn } from "@utils/cn";

type TooltipProps = {
  content: string;
  children: ReactNode;
  side?: "top" | "left" | "right";
};

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const sideClassName =
    side === "left"
      ? "right-full top-1/2 mr-2 -translate-y-1/2"
      : side === "right"
        ? "left-full top-1/2 ml-2 -translate-y-1/2"
        : "left-1/2 -top-9 -translate-x-1/2";

  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute hidden whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[11px] font-medium text-white shadow-sm group-focus-within:block group-hover:block",
          sideClassName
        )}
      >
        {content}
      </span>
    </span>
  );
}

