"use client";

import Link from "next/link";
import {
  BookMarked,
  FileText,
  Flag,
  LayoutGrid,
  MessagesSquare,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useAdminReports,
  useAdminUsers,
  useArticles,
  useCategories,
  useDiscussions,
  useKnowledgeDocs,
} from "@/lib/queries";

export default function AdminOverviewPage() {
  const users = useAdminUsers({ limit: 1 });
  const articles = useArticles({ limit: 1 });
  const discussions = useDiscussions({ limit: 1 });
  const docs = useKnowledgeDocs();
  const reports = useAdminReports({ limit: 1 });
  const pendingReports = useAdminReports({ limit: 1, status: "PENDING" });
  const categories = useCategories();

  const pendingDocs = (docs.data ?? []).filter(
    (d) => d.index_status !== "DONE",
  ).length;

  const stats = [
    {
      label: "ผู้ใช้งานทั้งหมด",
      value: users.data?.total,
      sub: "บัญชีในระบบทั้งหมด",
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "บทความ",
      value: articles.data?.total,
      sub: "เผยแพร่แล้วทั้งหมด",
      icon: FileText,
      href: "/articles",
    },
    {
      label: "กระทู้",
      value: discussions.data?.total,
      sub: "กระทู้ถาม-ตอบทั้งหมด",
      icon: MessagesSquare,
      href: "/discussions",
    },
    {
      label: "เอกสารคลังความรู้ AI",
      value: docs.data?.length,
      sub: `รอ index ${pendingDocs} รายการ`,
      icon: BookMarked,
      href: "/admin/knowledge",
    },
    {
      label: "รายงานที่รอตรวจสอบ",
      value: pendingReports.data?.total,
      sub: `ทั้งหมด ${reports.data?.total ?? "…"} รายการ`,
      icon: Flag,
      href: "/admin/reports",
    },
    {
      label: "หมวดหมู่ความรู้",
      value: categories.data?.length,
      sub: "หมวดหมู่บทความและกระทู้",
      icon: LayoutGrid,
      href: "/articles",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <Link key={s.label} href={s.href}>
          <Card className="flex h-full items-start gap-3 p-5 transition-shadow hover:shadow-md">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <s.icon className="h-5 w-5 text-primary" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">
                {s.value ?? "…"}
              </p>
              <p className="mt-1.5 text-sm font-medium">{s.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
