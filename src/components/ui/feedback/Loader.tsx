import { cn } from "@utils/cn";

type LoaderSize = "sm" | "md" | "lg";

type LoaderProps = {
  label?: string;
  size?: LoaderSize;
  centered?: boolean;
  className?: string;
};

const sizeStyles: Record<LoaderSize, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function Loader({
  label = "Cargando...",
  size = "md",
  centered = false,
  className,
}: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-3 text-sm text-neutral-600",
        centered && "w-full justify-center",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("relative inline-block", sizeStyles[size])}
      >
        <span className="absolute inset-0 rounded-full border border-neutral-300/80" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-600 border-r-primary-400 animate-spin" />
        <span className="absolute inset-1 rounded-full border border-primary-200/70 animate-pulse" />
      </span>
      {label ? <span>{label}</span> : null}
    </div>
  );
}


