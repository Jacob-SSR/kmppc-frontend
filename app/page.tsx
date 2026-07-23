"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Monitor,
  Printer,
  Network,
  FlaskConical,
  ScanLine,
  BookOpen,
  LayoutGrid,
  FileText,
  MessagesSquare,
  Sparkles,
  Eye,
  MessageCircle,
  User,
  Clock,
  Tags,
  Database,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  useArticles,
  useCategories,
  useDiscussions,
  useTags,
} from "@/lib/queries";
import { formatNum, fullName, initial, timeAgo } from "@/lib/format";

// เลือกไอคอนตามชื่อหมวดหมู่ (fallback เป็น grid)
function categoryIcon(name: string): React.ElementType {
  const n = name.toLowerCase();
  if (n.includes("hosxp")) return Database;
  if (n.includes("printer") || n.includes("พิมพ์")) return Printer;
  if (n.includes("network") || n.includes("เครือข่าย")) return Network;
  if (n.includes("lab") || n.includes("แล็บ")) return FlaskConical;
  if (n.includes("x-ray") || n.includes("รังสี")) return ScanLine;
  if (n.includes("sop") || n.includes("คู่มือ")) return BookOpen;
  if (n.includes("it")) return Monitor;
  return LayoutGrid;
}

const avatarTones = [
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
];

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="mt-4 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse gap-3 p-2">
          <div className="h-14 w-16 shrink-0 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const categories = useCategories();
  const tags = useTags();
  const latestArticles = useArticles({ limit: 4 });
  const recentDiscussions = useDiscussions({ limit: 5 });

  const popularKeywords = (tags.data ?? [])
    .slice()
    .sort(
      (a, b) =>
        b.article_count + b.discussion_count - (a.article_count + a.discussion_count),
    )
    .slice(0, 7);

  const totalArticles = categories.data?.reduce((s, c) => s + c.article_count, 0);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
  }

  const stats = [
    {
      label: "บทความทั้งหมด",
      value: latestArticles.data?.total,
      icon: BookOpen,
    },
    {
      label: "กระทู้ทั้งหมด",
      value: recentDiscussions.data?.total,
      icon: MessageCircle,
    },
    { label: "หมวดหมู่ความรู้", value: categories.data?.length, icon: LayoutGrid },
    { label: "แท็กความรู้", value: tags.data?.length, icon: Tags },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero + Search */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-accent/60">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold leading-tight text-primary-dark lg:text-5xl">
              ระบบจัดการองค์ความรู้
              <br />
              โรงพยาบาลพลับพลาชัย
            </h1>
            <p className="mt-4 text-muted-foreground lg:text-lg">
              แหล่งรวมความรู้ คู่มือ และประสบการณ์ เพื่อพัฒนางานของเราให้ดียิ่งขึ้น
              <br className="hidden lg:block" />
              ค้นหา แลกเปลี่ยน และเรียนรู้ไปด้วยกัน
            </p>

            <form
              onSubmit={submitSearch}
              className="mt-8 flex items-stretch overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ค้นหาความรู้, บทความ, คู่มือ, SOP..."
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button variant="dark" className="h-auto rounded-none px-5" type="submit">
                <Search className="h-4 w-4" />
                ค้นหา
              </Button>
            </form>

            {popularKeywords.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-primary-dark">
                  คำค้นหายอดนิยม:
                </span>
                {popularKeywords.map((t) => (
                  <Link key={t.id} href={`/search?q=${encodeURIComponent(t.tag_name)}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer px-3 py-1 hover:bg-secondary"
                    >
                      {t.tag_name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto -mt-8 w-full max-w-7xl px-4 lg:px-6">
        <Card className="grid grid-cols-2 divide-border sm:grid-cols-4 lg:grid-cols-8 lg:divide-x">
          {(categories.data ?? []).slice(0, 7).map((c) => {
            const Icon = categoryIcon(c.category_name);
            return (
              <Link
                key={c.id}
                href={`/articles?category=${c.id}`}
                className="flex flex-col items-center gap-2 rounded-xl px-3 py-6 text-center transition-colors hover:bg-muted"
              >
                <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                <span className="text-sm font-semibold">{c.category_name}</span>
                <span className="text-xs text-muted-foreground">
                  {c.article_count} บทความ
                </span>
              </Link>
            );
          })}
          <Link
            href="/articles"
            className="flex flex-col items-center gap-2 rounded-xl px-3 py-6 text-center transition-colors hover:bg-muted"
          >
            <LayoutGrid className="h-8 w-8 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-semibold">ทั้งหมด</span>
            <span className="text-xs text-muted-foreground">
              {totalArticles ?? "-"} บทความ
            </span>
          </Link>
        </Card>
      </section>

      {/* Main content */}
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 lg:grid-cols-3 lg:px-6">
        {/* Latest articles */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <FileText className="h-5 w-5 text-primary" />
              บทความล่าสุด
            </h2>
            <Link href="/articles" className="text-sm text-primary hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          {latestArticles.isLoading ? (
            <ListSkeleton rows={4} />
          ) : (latestArticles.data?.items.length ?? 0) === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              ยังไม่มีบทความในระบบ
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {latestArticles.data?.items.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{a.title}</p>
                      <Badge className="shrink-0">{a.category.category_name}</Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {a.excerpt}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {fullName(a.author)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {a.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(a.published_at ?? a.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent discussions */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <MessagesSquare className="h-5 w-5 text-primary" />
              กระทู้ถาม-ตอบล่าสุด
            </h2>
            <Link
              href="/discussions"
              className="text-sm text-primary hover:underline"
            >
              ดูทั้งหมด
            </Link>
          </div>
          {recentDiscussions.isLoading ? (
            <ListSkeleton rows={5} />
          ) : (recentDiscussions.data?.items.length ?? 0) === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              ยังไม่มีกระทู้ในระบบ
            </p>
          ) : (
            <div className="mt-4 space-y-1.5">
              {recentDiscussions.data?.items.map((d, i) => {
                const name = fullName(d.author);
                return (
                  <Link
                    key={d.id}
                    href={`/discussions/${d.id}`}
                    className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarTones[i % avatarTones.length]}`}
                    >
                      {initial(name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{d.title}</p>
                        <Badge className="shrink-0">
                          {d.category.category_name}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        โดย {name} · {timeAgo(d.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {d._count.replies ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {d.view_count}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* AI Search card */}
        <Card className="flex flex-col p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai text-ai-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              AI Search (ถาม AI)
            </h2>
            <Badge variant="ai">ใหม่</Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            ถามคำถาม แล้ว AI จะหาคำตอบให้คุณจากฐานความรู้
          </p>
          <textarea
            placeholder="เช่น วิธีแก้ไขปัญหา Printer ไม่พิมพ์, วิธี Backup HOSxP..."
            className="mt-4 h-28 w-full resize-none rounded-lg border border-input bg-card p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Link href="/ai-search" className="mt-4">
            <Button variant="ai" size="lg" className="w-full">
              <Sparkles className="h-4 w-4" />
              ถาม AI เลย
            </Button>
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            ใช้เทคโนโลยี AI เพื่อค้นหาคำตอบที่แม่นยำจากเอกสารและประสบการณ์
          </p>
        </Card>
      </section>

      {/* Stats */}
      <section className="mx-auto mb-12 w-full max-w-7xl px-4 lg:px-6">
        <Card className="grid grid-cols-2 gap-y-6 px-4 py-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center justify-center gap-3">
              <s.icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-2xl font-bold leading-none">
                  {s.value === undefined ? "…" : formatNum(s.value)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </Card>
      </section>

      <div className="mt-auto">
        <SiteFooter />
      </div>
    </div>
  );
}
