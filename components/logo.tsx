import { cn } from "@/lib/utils";

export function HospitalMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl bg-primary-dark text-white",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M9 3a1 1 0 0 0-1 1v4H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4h4a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-4V4a1 1 0 0 0-1-1H9z" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <HospitalMark className={light ? "bg-white/15" : undefined} />
      <div className="leading-tight">
        <p
          className={cn(
            "text-lg font-bold",
            light ? "text-white" : "text-primary-dark"
          )}
        >
          โรงพยาบาลศรีสุข
        </p>
        <p
          className={cn(
            "text-xs",
            light ? "text-white/80" : "text-muted-foreground"
          )}
        >
          ระบบจัดการองค์ความรู้ (KM)
        </p>
      </div>
    </div>
  );
}
