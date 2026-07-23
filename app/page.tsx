import Link from "next/link";
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
  Users,
  ThumbsUp,
  ChevronDown,
  Database,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  categories,
  latestArticles,
  popularKeywords,
  recentDiscussions,
  siteStats,
} from "@/lib/mock-data";

const categoryIcons: Record<string, React.ElementType> = {
  monitor: Monitor,
  printer: Printer,
  network: Network,
  flask: FlaskConical,
  scan: ScanLine,
  book: BookOpen,
  grid: LayoutGrid,
};

const statIcons: Record<string, React.ElementType> = {
  book: BookOpen,
  chat: MessageCircle,
  users: Users,
  eye: Eye,
  like: ThumbsUp,
};

const avatarTones = [
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
];

export default function Home() {
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

            <div className="mt-8 flex items-stretch overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  placeholder="ค้นหาความรู้, บทความ, คู่มือ, SOP..."
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button className="hidden items-center gap-1 border-l border-border px-4 text-sm text-muted-foreground hover:bg-muted sm:flex">
                ทั้งหมด
                <ChevronDown className="h-4 w-4" />
              </button>
              <Button variant="dark" className="h-auto rounded-none px-5">
                <Search className="h-4 w-4" />
                ค้นหา
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-primary-dark">
                คำค้นหายอดนิยม:
              </span>
              {popularKeywords.map((k) => (
                <Badge
                  key={k}
                  variant="outline"
                  className="cursor-pointer px-3 py-1 hover:bg-secondary"
                >
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto -mt-8 w-full max-w-7xl px-4 lg:px-6">
        <Card className="grid grid-cols-2 divide-border sm:grid-cols-4 lg:grid-cols-8 lg:divide-x">
          {categories.map((c) => {
            const Icon = categoryIcons[c.icon] ?? LayoutGrid;
            return (
              <Link
                key={c.key}
                href={c.key === "all" ? "/articles" : `/articles?category=${c.key}`}
                className="flex flex-col items-center gap-2 rounded-xl px-3 py-6 text-center transition-colors hover:bg-muted"
              >
                <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                <span className="text-sm font-semibold">{c.name}</span>
                <span className="text-xs text-muted-foreground">
                  {c.count} บทความ
                </span>
              </Link>
            );
          })}
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
            <Link
              href="/articles"
              className="text-sm text-primary hover:underline"
            >
              ดูทั้งหมด
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {latestArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{a.title}</p>
                    <Badge className="shrink-0">{a.category}</Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {a.excerpt}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {a.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {a.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {a.time}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
          <div className="mt-4 space-y-1.5">
            {recentDiscussions.map((d, i) => (
              <Link
                key={d.id}
                href={`/discussions/${d.id}`}
                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarTones[i % avatarTones.length]}`}
                >
                  {d.author.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{d.title}</p>
                    <Badge className="shrink-0">{d.category}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    โดย {d.author} · {d.time}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {d.replies}
                  </span>
                  <span>{d.views}</span>
                </div>
              </Link>
            ))}
          </div>
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
        <Card className="grid grid-cols-2 gap-y-6 px-4 py-6 sm:grid-cols-3 lg:grid-cols-5">
          {siteStats.map((s) => {
            const Icon = statIcons[s.icon] ?? BookOpen;
            return (
              <div key={s.label} className="flex items-center justify-center gap-3">
                <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="text-2xl font-bold leading-none">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            );
          })}
        </Card>
      </section>

      <div className="mt-auto">
        <SiteFooter />
      </div>
    </div>
  );
}
