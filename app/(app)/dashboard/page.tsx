"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MessageCircle,
  MessagesSquare,
  PlusCircle,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  articles,
  currentUser,
  discussions,
  myArticles,
  myDiscussions,
  notifications,
} from "@/lib/mock-data";

// แดชบอร์ดผู้ใช้งาน — จะเชื่อม API จริง (articles/discussions/notifications) ในสปรินต์ถัดไป
const stats = [
  { label: "บทความของฉัน", value: myArticles.length, icon: FileText },
  { label: "กระทู้ของฉัน", value: myDiscussions.length, icon: MessagesSquare },
  {
    label: "แจ้งเตือนที่ยังไม่อ่าน",
    value: notifications.filter((n) => !n.is_read).length,
    icon: Bell,
  },
  { label: "ยอดถูกใจที่ได้รับ", value: 46, icon: ThumbsUp },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            สวัสดี, คุณ{currentUser.fname} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentUser.position} · {currentUser.department}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/articles/new">
            <Button variant="dark" size="sm">
              <PlusCircle className="h-4 w-4" />
              เขียนบทความ
            </Button>
          </Link>
          <Link href="/discussions/new">
            <Button variant="outline" size="sm">
              <MessagesSquare className="h-4 w-4 text-primary" />
              ตั้งกระทู้
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
              <s.icon className="h-5 w-5 text-primary" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* งานของฉัน */}
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-bold">
            <FileText className="h-5 w-5 text-primary" />
            บทความของฉัน
          </h2>
          <div className="mt-3 space-y-2">
            {myArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {a.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" /> {a.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {a.time}
                    </span>
                  </p>
                </div>
                <Badge
                  variant={a.status === "PUBLISHED" ? "primary" : "outline"}
                >
                  {a.status === "PUBLISHED" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                </Badge>
              </Link>
            ))}
          </div>

          <h2 className="mt-5 flex items-center gap-2 border-t border-border pt-4 font-bold">
            <MessagesSquare className="h-5 w-5 text-primary" />
            กระทู้ของฉัน
          </h2>
          <div className="mt-3 space-y-2">
            {myDiscussions.map((d) => (
              <Link
                key={d.id}
                href={`/discussions/${d.id}`}
                className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {d.replies} คำตอบ
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {d.time}
                    </span>
                  </p>
                </div>
                {d.is_solved && (
                  <Badge className="gap-1 bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> แก้ไขแล้ว
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          {/* AI shortcut */}
          <Card className="border-ai/30 bg-ai/5 p-5">
            <h2 className="flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai text-ai-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              ถาม AI Search
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ติดปัญหาหน้างาน? ถาม AI เพื่อค้นคำตอบจากฐานความรู้ได้ทันที
            </p>
            <Link href="/ai-search" className="mt-3 block">
              <Button variant="ai" className="w-full">
                <Sparkles className="h-4 w-4" />
                เริ่มถาม AI
              </Button>
            </Link>
          </Card>

          {/* บทความล่าสุดในระบบ */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold">
                <BookOpen className="h-5 w-5 text-primary" />
                ล่าสุดในระบบ
              </h2>
              <Link
                href="/articles"
                className="text-sm text-primary hover:underline"
              >
                ดูทั้งหมด
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {articles.slice(0, 3).map((a) => (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="block rounded-lg p-2.5 transition-colors hover:bg-muted"
                >
                  <p className="text-sm font-medium leading-snug">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.category} · {a.time}
                  </p>
                </Link>
              ))}
              {discussions.slice(0, 2).map((d) => (
                <Link
                  key={d.id}
                  href={`/discussions/${d.id}`}
                  className="block rounded-lg p-2.5 transition-colors hover:bg-muted"
                >
                  <p className="text-sm font-medium leading-snug">{d.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    กระทู้ · {d.category} · {d.time}
                  </p>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
