"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, MessageCircle, Send, Share2 } from "lucide-react";

// lucide เวอร์ชันนี้ไม่มีไอคอน Facebook — ใช้ SVG โลโก้ f แบบ inline
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.9 3.78-3.9 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/** ปุ่มแชร์แบบเมนู — Facebook / LINE / Telegram / คัดลอกลิงก์ */
export function ShareMenu({ title }: { title: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function pageUrl() {
    return window.location.href;
  }

  function openShare(buildUrl: (url: string, title: string) => string) {
    window.open(
      buildUrl(encodeURIComponent(pageUrl()), encodeURIComponent(title)),
      "_blank",
      "noopener,noreferrer,width=600,height=600",
    );
    setOpen(false);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl());
      toast.success("คัดลอกลิงก์แล้ว", "ส่งต่อให้เพื่อนร่วมงานได้เลย");
    } catch {
      toast.error("คัดลอกลิงก์ไม่สำเร็จ");
    }
    setOpen(false);
  }

  const items = [
    {
      label: "Facebook",
      icon: FacebookIcon,
      onClick: () =>
        openShare((url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`),
    },
    {
      label: "LINE",
      icon: MessageCircle,
      onClick: () =>
        openShare(
          (url) => `https://social-plugins.line.me/lineit/share?url=${url}`,
        ),
    },
    {
      label: "Telegram",
      icon: Send,
      onClick: () =>
        openShare(
          (url, text) => `https://t.me/share/url?url=${url}&text=${text}`,
        ),
    },
    { label: "คัดลอกลิงก์", icon: Link2, onClick: copyLink },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Share2 className="h-4 w-4" />
        แชร์
      </Button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              <item.icon className="h-4 w-4 text-primary" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
