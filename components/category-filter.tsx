"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type FilterOption = { id: string; label: string; count?: number };

/**
 * ปุ่ม "ตัวกรอง" แบบ dropdown แทนแถวชิปหมวดหมู่ — รองรับหมวดจำนวนมาก
 * มีช่องค้นหาในตัว จุดแดงบนปุ่มบอกว่ากำลังกรองอยู่ (value !== "all")
 */
export function CategoryFilter({
  options,
  value,
  onChange,
  loading,
}: {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const active = value !== "all";
  const activeLabel = options.find((o) => o.id === value)?.label;
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(q.trim().toLowerCase()),
  );

  function pick(id: string) {
    onChange(id);
    setOpen(false);
    setQ("");
  }

  return (
    <div className="relative inline-block" ref={wrapRef}>
      <Button
        type="button"
        variant="outline"
        className="relative bg-card"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
      >
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        ตัวกรอง
        {active && activeLabel && (
          <span className="max-w-32 truncate text-primary">
            : {activeLabel}
          </span>
        )}
        {active && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
        )}
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-72 rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาหมวดหมู่..."
                className="h-8 pl-8 text-sm"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto p-1.5">
            <button
              type="button"
              onClick={() => pick("all")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                !active && "bg-secondary font-medium text-primary-dark",
              )}
            >
              <span className="flex-1">ทั้งหมด</span>
              {!active && <Check className="h-4 w-4 text-primary" />}
            </button>
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => pick(o.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                  value === o.id && "bg-secondary font-medium text-primary-dark",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {o.count !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {o.count}
                  </span>
                )}
                {value === o.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2.5 py-3 text-center text-sm text-muted-foreground">
                ไม่พบหมวดหมู่ที่ค้นหา
              </p>
            )}
          </div>
          {active && (
            <div className="border-t border-border p-1.5">
              <button
                type="button"
                onClick={() => pick("all")}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/5"
              >
                <X className="h-3.5 w-3.5" />
                ล้างตัวกรอง
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
