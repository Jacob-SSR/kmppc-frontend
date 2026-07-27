"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookMarked,
  Flag,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { useMe } from "@/lib/queries";
import { cn } from "@/lib/utils";

const adminTabs = [
  { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/admin/users", label: "ผู้ใช้งาน", icon: Users },
  { href: "/admin/categories", label: "หมวดหมู่", icon: LayoutGrid },
  { href: "/admin/tags", label: "แท็ก", icon: Tags },
  { href: "/admin/knowledge", label: "คลังเอกสาร AI", icon: BookMarked },
  { href: "/admin/stats", label: "สถิติ", icon: BarChart3 },
  { href: "/admin/reports", label: "รายงานเนื้อหา", icon: Flag },
  { href: "/admin/settings", label: "ตั้งค่าระบบ", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const me = useMe();

  // กันคนไม่ใช่ ADMIN เข้าโซนนี้ตั้งแต่ฝั่ง frontend (backend มี 403 อีกชั้นอยู่แล้ว)
  if (me.data && me.data.role.role_name !== "ADMIN") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">เฉพาะผู้ดูแลระบบเท่านั้น</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้าผู้ดูแลระบบ —
          หากคิดว่านี่เป็นความผิดพลาด กรุณาติดต่อผู้ดูแล
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm text-primary hover:underline"
        >
          ← กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <ShieldCheck className="h-6 w-6 text-primary" />
        ผู้ดูแลระบบ
      </h1>

      <nav className="mt-5 flex flex-wrap gap-1 border-b border-border">
        {adminTabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                active && "border-primary text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
