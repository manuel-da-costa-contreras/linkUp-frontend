import { cn } from "@/utils/cn";

type LoaderSize = "sm" | "md" | "lg";

type LoaderProps = {
  label?: string;
  size?: LoaderSize;
  centered?: boolean;
  className?: string;
};

const sizeStyles: Record<LoaderSize, string> = {
  sm: "h-6 w-6 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-10 w-10 border-4",
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
        "inline-flex items-center gap-3 text-sm text-zinc-600",
        centered && "w-full justify-center",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("relative rounded-full border-zinc-200", sizeStyles[size])}
      >
        <span className="absolute inset-px rounded-full border-inherit border-t-cyan-600 animate-spin" />
      </span>
      {label ? <span>{label}</span> : null}
    </div>
  );
}
