"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

// สถานะธีมอ่านจาก class บน <html> โดยตรง (sync ผ่าน MutationObserver)
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/**
 * ปุ่มสลับโหมดสว่าง/มืด — เก็บค่าไว้ใน localStorage ("theme")
 * สคริปต์ใน layout ตั้ง class ให้ตั้งแต่ก่อน render กันจอกะพริบ
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // private mode — ข้ามได้ ธีมยังสลับในหน้านี้
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
      title={dark ? "โหมดสว่าง" : "โหมดมืด"}
      className={
        "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground " +
        (className ?? "")
      }
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
