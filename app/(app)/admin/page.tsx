import Link from "next/link";
import {
  BookMarked,
  FileText,
  Flag,
  MessagesSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  adminReports,
  adminUsers,
  articles,
  discussions,
  knowledgeDocs,
} from "@/lib/mock-data";

// ภาพรวมผู้ดูแลระบบ — สรุปจากข้อมูล mock, จะเชื่อม API จริงในสปรินต์ถัดไป
export default function AdminOverviewPage() {
  const stats = [
    {
      label: "ผู้ใช้งานทั้งหมด",
      value: adminUsers.length,
      sub: `ใช้งานอยู่ ${adminUsers.filter((u) => u.is_active).length} บัญชี`,
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "บทความ",
      value: articles.length,
      sub: "เผยแพร่แล้วทั้งหมด",
      icon: FileText,
      href: "/articles",
    },
    {
      label: "กระทู้",
      value: discussions.length,
      sub: `แก้ไขแล้ว ${discussions.filter((d) => d.is_solved).length} กระทู้`,
      icon: MessagesSquare,
      href: "/discussions",
    },
    {
      label: "เอกสารคลังความรู้ AI",
      value: knowledgeDocs.length,
      sub: `รอ index ${knowledgeDocs.filter((k) => k.index_status !== "DONE").length} รายการ`,
      icon: BookMarked,
      href: "/admin/knowledge",
    },
    {
      label: "รายงานที่รอตรวจสอบ",
      value: adminReports.filter((r) => r.status === "PENDING").length,
      sub: `ทั้งหมด ${adminReports.length} รายการ`,
      icon: Flag,
      href: "/admin/reports",
    },
    {
      label: "การเข้าชมเดือนนี้",
      value: "4,512",
      sub: "+12% จากเดือนก่อน",
      icon: TrendingUp,
      href: "/admin",
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
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="mt-1.5 text-sm font-medium">{s.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
