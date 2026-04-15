"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

type RatingStarsProps = {
  value: number;
  max?: number;
  onChange: (nextValue: number) => void;
  label?: string;
  className?: string;
};

export function RatingStars({ value, max = 5, onChange, label, className }: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const activeValue = hoverValue > 0 ? hoverValue : value;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <p className="text-sm font-medium text-neutral-700">{label}</p> : null}
      <div role="radiogroup" aria-label={label ?? "Rating"} className="flex items-center gap-1">
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          const active = starValue <= activeValue;

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${starValue} de ${max}`}
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHoverValue(starValue)}
              onMouseLeave={() => setHoverValue(0)}
              onFocus={() => setHoverValue(starValue)}
              onBlur={() => setHoverValue(0)}
              className="rounded p-1 text-neutral-300 transition-colors hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={cn("h-7 w-7", active ? "text-amber-400" : "text-neutral-300")}
                fill="currentColor"
              >
                <path d="M12 2.75c.3 0 .58.16.73.42l2.64 4.85 5.43.78c.31.04.57.26.67.56.1.3.02.64-.2.86l-3.92 3.86.93 5.45c.05.3-.07.61-.3.79-.24.18-.56.22-.83.1L12 18.9l-4.85 2.22c-.27.12-.59.08-.83-.1a.87.87 0 0 1-.3-.8l.94-5.44-3.93-3.86a.9.9 0 0 1-.2-.86.9.9 0 0 1 .67-.56l5.43-.78 2.64-4.85c.15-.26.43-.42.73-.42Z" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}

