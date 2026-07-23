"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bookmark,
  ChevronDown,
  FileText,
  Home,
  MessageCircle,
  MessagesSquare,
  Sparkles,
  User,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/dashboard", label: "หน้าหลัก", icon: Home },
  { href: "/articles", label: "บทความ", icon: FileText },
  { href: "/discussions", label: "กระทู้ถาม-ตอบ", icon: MessagesSquare },
  { href: "/ai-search", label: "AI Search", icon: Sparkles },
  { href: "/chat", label: "แชท", icon: MessageCircle },
  { href: "/bookmarks", label: "บุ๊คมาร์ค", icon: Bookmark },
  { href: "/notifications", label: "แจ้งเตือน", icon: Bell },
  { href: "/profile", label: "โปรไฟล์", icon: User },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <button
              className="relative text-muted-foreground hover:text-foreground"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <button className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                ฐ
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibold">คุณณัฐวุฒิ</span>
                <span className="block text-xs text-muted-foreground">
                  IT Support
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-24 shrink-0 border-r border-border bg-card py-4 md:block">
          <nav className="flex flex-col items-stretch gap-1 px-2">
            {sidebarItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-secondary text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}
