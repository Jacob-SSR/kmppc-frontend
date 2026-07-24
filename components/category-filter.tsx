"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eraser, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FilterOption = { id: string; label: string; count?: number };
export type FilterValue = { category: string; tag: string; sort: string };

export const DEFAULT_FILTER: FilterValue = {
  category: "all",
  tag: "all",
  sort: "latest",
};

/** คอลัมน์รายการเลือกภายใน panel — มีช่องค้นหาเมื่อรายการยาว */
function FilterColumn({
  title,
  options,
  value,
  onChange,
  searchable,
  searchPlaceholder,
}: {
  title: string;
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <div className="flex min-w-0 flex-col">
      <p className="px-1 pb-2 text-sm font-bold text-primary-dark">{title}</p>
      {searchable && (
        <div className="relative mb-1.5">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder ?? "ค้นหา..."}
            className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}
      <div className="max-h-64 flex-1 overflow-y-auto pr-0.5">
        {filtered.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted",
              value === o.id && "bg-secondary font-medium text-primary-dark",
            )}
          >
            <span className="min-w-0 flex-1 truncate">{o.label}</span>
            {o.count !== undefined && (
              <span className="text-xs text-muted-foreground">{o.count}</span>
            )}
            {value === o.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-2.5 py-3 text-center text-sm text-muted-foreground">
            ไม่พบรายการ
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * ปุ่ม "ตัวกรอง" เปิด panel ใหญ่ 3 คอลัมน์ (หมวดหมู่ / แท็ก / เรียงตาม)
 * เลือกก่อนแล้วค่อยกด "ดูผลการค้นหา" ถึงจะกรองจริง — จุดแดงบอกว่ากรองอยู่
 */
export function CategoryFilter({
  categories,
  tags,
  sorts,
  value,
  onApply,
  loading,
}: {
  categories: FilterOption[];
  tags: FilterOption[];
  sorts: FilterOption[];
  value: FilterValue;
  onApply: (next: FilterValue) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  // ค่าที่เลือกค้างไว้ใน panel — ยังไม่กรองจนกว่าจะกดดูผลการค้นหา
  const [pending, setPending] = useState<FilterValue>(value);
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

  const active =
    value.category !== "all" || value.tag !== "all" || value.sort !== "latest";
  const activeCount =
    (value.category !== "all" ? 1 : 0) +
    (value.tag !== "all" ? 1 : 0) +
    (value.sort !== "latest" ? 1 : 0);

  function openPanel() {
    setPending(value); // เปิดมาเห็นค่าที่กรองอยู่จริง
    setOpen(true);
  }

  return (
    <div className="relative" ref={wrapRef}>
      <Button
        type="button"
        variant="outline"
        className="relative bg-card"
        disabled={loading}
        onClick={() => (open ? setOpen(false) : openPanel())}
      >
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        ตัวกรอง
        {active && (
          <>
            <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {activeCount}
            </span>
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
          </>
        )}
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-[min(92vw,46rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="grid gap-x-5 gap-y-5 p-4 sm:grid-cols-3 sm:divide-x sm:divide-border sm:[&>*+*]:pl-5">
            <FilterColumn
              title="หมวดหมู่"
              options={[{ id: "all", label: "ทั้งหมด" }, ...categories]}
              value={pending.category}
              onChange={(id) => setPending((p) => ({ ...p, category: id }))}
              searchable={categories.length > 8}
              searchPlaceholder="ค้นหาหมวดหมู่..."
            />
            <FilterColumn
              title="แท็ก"
              options={[{ id: "all", label: "ทั้งหมด" }, ...tags]}
              value={pending.tag}
              onChange={(id) => setPending((p) => ({ ...p, tag: id }))}
              searchable={tags.length > 8}
              searchPlaceholder="ค้นหาแท็ก..."
            />
            <FilterColumn
              title="เรียงตาม"
              options={sorts}
              value={pending.sort}
              onChange={(id) => setPending((p) => ({ ...p, sort: id }))}
            />
          </div>
          <div className="flex items-center justify-center gap-3 border-t border-border bg-muted/40 px-4 py-3">
            <Button
              type="button"
              variant="outline"
              className="min-w-36"
              onClick={() => setPending(DEFAULT_FILTER)}
            >
              <Eraser className="h-4 w-4 text-muted-foreground" />
              ล้างข้อมูล
            </Button>
            <Button
              type="button"
              variant="dark"
              className="min-w-44"
              onClick={() => {
                onApply(pending);
                setOpen(false);
              }}
            >
              <Search className="h-4 w-4" />
              ดูผลการค้นหา
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
