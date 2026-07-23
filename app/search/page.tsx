"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Clock,
  Eye,
  FileText,
  MessageCircle,
  MessagesSquare,
  Search,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { articles, discussions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ผลการค้นหา — จะเชื่อม GET /api/search (q, type, page, limit) ในสปรินต์ถัดไป
function SearchResults() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [type, setType] = useState<"all" | "articles" | "discussions">("all");

  const foundArticles =
    q === ""
      ? articles
      : articles.filter((a) => a.title.includes(q) || a.excerpt.includes(q));
  const foundDiscussions =
    q === ""
      ? discussions
      : discussions.filter(
          (d) => d.title.includes(q) || d.content.includes(q)
        );
  const total = foundArticles.length + foundDiscussions.length;

  const tabs = [
    { key: "all" as const, label: `ทั้งหมด (${total})` },
    { key: "articles" as const, label: `บทความ (${foundArticles.length})` },
    {
      key: "discussions" as const,
      label: `กระทู้ (${foundDiscussions.length})`,
    },
  ];

  return (
    <>
      <section className="border-b border-border bg-gradient-to-br from-secondary via-background to-accent/60">
        <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-primary-dark">
            <Search className="h-6 w-6 text-primary" />
            ค้นหาความรู้
          </h1>
          <form
            className="mt-5 flex gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาบทความ, กระทู้, คู่มือ, SOP..."
              className="bg-card"
            />
            <Button variant="dark" type="submit">
              <Search className="h-4 w-4" />
              ค้นหา
            </Button>
          </form>
          <div className="mt-4 flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={cn(
                  "rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition-colors hover:bg-secondary",
                  type === t.key &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-6 px-4 py-8 lg:px-6">
        {(type === "all" || type === "articles") && (
          <div>
            <h2 className="flex items-center gap-2 font-bold">
              <FileText className="h-5 w-5 text-primary" /> บทความ
            </h2>
            <div className="mt-3 space-y-3">
              {foundArticles.map((a) => (
                <Link key={a.slug} href={`/articles/${a.slug}`} className="block">
                  <Card className="p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{a.title}</p>
                      <Badge>{a.category}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {a.excerpt}
                    </p>
                    <p className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {a.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {a.time}
                      </span>
                    </p>
                  </Card>
                </Link>
              ))}
              {foundArticles.length === 0 && (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  ไม่พบบทความ
                </Card>
              )}
            </div>
          </div>
        )}

        {(type === "all" || type === "discussions") && (
          <div>
            <h2 className="flex items-center gap-2 font-bold">
              <MessagesSquare className="h-5 w-5 text-primary" /> กระทู้ถาม-ตอบ
            </h2>
            <div className="mt-3 space-y-3">
              {foundDiscussions.map((d) => (
                <Link
                  key={d.id}
                  href={`/discussions/${d.id}`}
                  className="block"
                >
                  <Card className="p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{d.title}</p>
                      <Badge>{d.category}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {d.content}
                    </p>
                    <p className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {d.replies.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {d.time}
                      </span>
                    </p>
                  </Card>
                </Link>
              ))}
              {foundDiscussions.length === 0 && (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  ไม่พบกระทู้
                </Card>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default function SearchPage() {
  return (
    <PublicShell>
      <Suspense>
        <SearchResults />
      </Suspense>
    </PublicShell>
  );
}
