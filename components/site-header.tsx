"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  MessagesSquare,
  Sparkles,
  Info,
  Lock,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "หน้าแรก", icon: Home },
  { href: "/articles", label: "บทความ", icon: FileText },
  { href: "/discussions", label: "กระทู้ถาม-ตอบ", icon: MessagesSquare },
  { href: "/ai-search", label: "AI Search", icon: Sparkles },
  { href: "/about", label: "เกี่ยวกับระบบ", icon: Info },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 border-b-2 border-transparent px-3 py-5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                  active && "border-primary text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="dark">
              <Lock className="h-4 w-4" />
              เข้าสู่ระบบ
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="เปิดเมนู"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-card px-4 py-2 lg:hidden">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-3 rounded-lg bg-primary-dark px-3 py-3 text-sm font-medium text-white"
          >
            <Lock className="h-4 w-4" />
            เข้าสู่ระบบ
          </Link>
        </nav>
      )}
    </header>
  );
}
