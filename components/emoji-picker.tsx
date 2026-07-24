"use client";

import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "🥰", "😘",
  "😎", "🤔", "🙄", "😅", "😢", "😭", "😡", "😱",
  "👍", "👎", "🙏", "👏", "💪", "🤝", "🙌", "👌",
  "❤️", "💚", "🔥", "🎉", "✨", "💯", "⭐", "💡",
  "✅", "❌", "⚠️", "📌", "📎", "📷", "🏥", "💊",
  "🩺", "🧑‍⚕️", "😴", "🤒", "🥳", "😇", "🫡", "🤗",
];

/** ปุ่มเลือก emoji — กดแล้วส่งอักษรที่เลือกกลับผ่าน onPick */
export function EmojiPickerButton({
  onPick,
  disabled,
}: {
  onPick: (emoji: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="แทรก emoji"
        title="แทรก emoji"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <Smile className="h-4 w-4 text-muted-foreground" />
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-1 grid w-64 grid-cols-8 gap-0.5 rounded-xl border border-border bg-card p-2 shadow-lg">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted"
              onClick={() => {
                onPick(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
