"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
  leaving?: boolean;
};

type ToastInput = {
  title: string;
  description?: string;
};

type ToastApi = {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = React.createContext<ToastApi | null>(null);

const AUTO_DISMISS_MS = 5000;
const LEAVE_MS = 200;

const variantStyles: Record<
  ToastVariant,
  { icon: React.ElementType; iconClass: string; barClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-primary",
    barClass: "bg-primary",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-destructive",
    barClass: "bg-destructive",
  },
  info: {
    icon: Info,
    iconClass: "text-ai",
    barClass: "bg-ai",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);
  const timersRef = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const remove = React.useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
    // ทำ animation ออกก่อนค่อยถอดจาก DOM
    setToasts((list) =>
      list.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, LEAVE_MS);
  }, []);

  const push = React.useCallback(
    (variant: ToastVariant, { title, description }: ToastInput) => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-3), { id, variant, title, description }]);
      timersRef.current.set(
        id,
        setTimeout(() => remove(id), AUTO_DISMISS_MS),
      );
    },
    [remove],
  );

  const api = React.useMemo<ToastApi>(
    () => ({
      success: (title, description) => push("success", { title, description }),
      error: (title, description) => push("error", { title, description }),
      info: (title, description) => push("info", { title, description }),
    }),
    [push],
  );

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4"
      >
        {toasts.map((t) => {
          const { icon: Icon, iconClass, barClass } = variantStyles[t.variant];
          return (
            <div
              key={t.id}
              role={t.variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:w-96",
                t.leaving ? "animate-toast-out" : "animate-toast-in",
              )}
            >
              <span className={cn("absolute inset-y-0 left-0 w-1", barClass)} />
              <div className="flex items-start gap-3 p-4 pl-5">
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  aria-label="ปิดการแจ้งเตือน"
                  className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast ต้องใช้ภายใน <ToastProvider>");
  }
  return ctx;
}
