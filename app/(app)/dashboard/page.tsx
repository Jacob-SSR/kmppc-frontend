"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  Bookmark,
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
  useArticles,
  useBookmarks,
  useDiscussions,
  useMe,
  useNotifications,
} from "@/lib/queries";
import { timeAgo } from "@/lib/format";

export default function DashboardPage() {
  const me = useMe();
  const articles = useArticles({ limit: 50 });
  const discussions = useDiscussions({ limit: 50 });
  const bookmarks = useBookmarks();
  const notifications = useNotifications({ limit: 1 });

  // ยังไม่มี endpoint กรองตามผู้เขียน — กรองจากรายการเผยแพร่ล่าสุดฝั่ง client
  const myArticles = (articles.data?.items ?? []).filter(
    (a) => me.data && a.author.id === me.data.id,
  );
  const myDiscussions = (discussions.data?.items ?? []).filter(
    (d) => me.data && !d.is_anonymous && d.author.id === me.data.id,
  );
  const myLikes = myArticles.reduce((s, a) => s + a._count.likes, 0);

  const stats = [
    { label: "บทความของฉัน", value: myArticles.length, icon: FileText },
    { label: "กระทู้ของฉัน", value: myDiscussions.length, icon: MessagesSquare },
    {
      label: "แจ้งเตือนที่ยังไม่อ่าน",
      value: notifications.data?.unread_count ?? 0,
      icon: Bell,
    },
    { label: "บุ๊คมาร์คของฉัน", value: bookmarks.data?.length ?? 0, icon: Bookmark },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            สวัสดี, คุณ{me.data?.fname ?? "…"} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {me.data
              ? `${me.data.position ?? ""} · ${me.data.department.dept_name}`
              : "กำลังโหลดข้อมูลผู้ใช้..."}
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
            {myLikes > 0 && (
              <span className="ml-auto flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5" /> ได้รับ {myLikes} ถูกใจ
              </span>
            )}
          </h2>
          <div className="mt-3 space-y-2">
            {myArticles.length === 0 && (
              <p className="p-2.5 text-sm text-muted-foreground">
                ยังไม่มีบทความที่เผยแพร่ —{" "}
                <Link href="/articles/new" className="text-primary hover:underline">
                  เริ่มเขียนบทความแรกเลย
                </Link>
              </p>
            )}
            {myArticles.slice(0, 5).map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {a.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" /> {a._count.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(a.published_at ?? a.created_at)}
                    </span>
                  </p>
                </div>
                <Badge variant="primary">เผยแพร่แล้ว</Badge>
              </Link>
            ))}
          </div>

          <h2 className="mt-5 flex items-center gap-2 border-t border-border pt-4 font-bold">
            <MessagesSquare className="h-5 w-5 text-primary" />
            กระทู้ของฉัน
          </h2>
          <div className="mt-3 space-y-2">
            {myDiscussions.length === 0 && (
              <p className="p-2.5 text-sm text-muted-foreground">
                ยังไม่มีกระทู้ —{" "}
                <Link
                  href="/discussions/new"
                  className="text-primary hover:underline"
                >
                  ตั้งกระทู้ถามได้เลย
                </Link>
              </p>
            )}
            {myDiscussions.slice(0, 5).map((d) => (
              <Link
                key={d.id}
                href={`/discussions/${d.id}`}
                className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {d._count.replies ?? 0} คำตอบ
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {timeAgo(d.created_at)}
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

          {/* ล่าสุดในระบบ */}
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
              {(articles.data?.items ?? []).slice(0, 3).map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  className="block rounded-lg p-2.5 transition-colors hover:bg-muted"
                >
                  <p className="text-sm font-medium leading-snug">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.category.category_name} ·{" "}
                    {timeAgo(a.published_at ?? a.created_at)}
                  </p>
                </Link>
              ))}
              {(discussions.data?.items ?? []).slice(0, 2).map((d) => (
                <Link
                  key={d.id}
                  href={`/discussions/${d.id}`}
                  className="block rounded-lg p-2.5 transition-colors hover:bg-muted"
                >
                  <p className="text-sm font-medium leading-snug">{d.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    กระทู้ · {d.category.category_name} · {timeAgo(d.created_at)}
                  </p>
                </Link>
              ))}
              {articles.data?.items.length === 0 &&
                discussions.data?.items.length === 0 && (
                  <p className="p-2.5 text-sm text-muted-foreground">
                    ยังไม่มีเนื้อหาในระบบ
                  </p>
                )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
