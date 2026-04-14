import { ReactNode } from "react";
import { cn } from "@/utils/cn";

type SectionHeadingProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function SectionHeading({
  title,
  description,
  actions,
  className,
}: SectionHeadingProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-zinc-600 sm:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </header>
  );
}
