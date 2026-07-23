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
import { useSearchResults } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

function SearchResults() {
  const params = useSearchParams();
  const [input, setInput] = useState(params.get("q") ?? "");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [type, setType] = useState<"all" | "articles" | "discussions">("all");
  const results = useSearchResults(q, type);

  const foundArticles = results.data?.articles.items ?? [];
  const foundDiscussions = results.data?.discussions.items ?? [];
  const articleTotal = results.data?.articles.total ?? 0;
  const discussionTotal = results.data?.discussions.total ?? 0;

  const tabs = [
    { key: "all" as const, label: `ทั้งหมด (${articleTotal + discussionTotal})` },
    { key: "articles" as const, label: `บทความ (${articleTotal})` },
    { key: "discussions" as const, label: `กระทู้ (${discussionTotal})` },
  ];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setQ(input.trim());
  }

  return (
    <>
      <section className="border-b border-border bg-gradient-to-br from-secondary via-background to-accent/60">
        <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-primary-dark">
            <Search className="h-6 w-6 text-primary" />
            ค้นหาความรู้
          </h1>
          <form className="mt-5 flex gap-2" onSubmit={submit}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ค้นหาบทความ, กระทู้, คู่มือ, SOP..."
              className="bg-card"
            />
            <Button variant="dark" type="submit" loading={results.isFetching}>
              {!results.isFetching && <Search className="h-4 w-4" />}
              ค้นหา
            </Button>
          </form>
          {q && (
            <div className="mt-4 flex gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={cn(
                    "rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition-colors hover:bg-secondary",
                    type === t.key &&
                      "border-primary bg-primary text-primary-foreground hover:bg-primary",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-6 px-4 py-8 lg:px-6">
        {!q ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            พิมพ์คำค้นหาเพื่อค้นบทความและกระทู้ทั้งหมดในระบบ
          </Card>
        ) : results.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-24 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : results.isError ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            ค้นหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </Card>
        ) : (
          <>
            {(type === "all" || type === "articles") && (
              <div>
                <h2 className="flex items-center gap-2 font-bold">
                  <FileText className="h-5 w-5 text-primary" /> บทความ
                </h2>
                <div className="mt-3 space-y-3">
                  {foundArticles.map((a) => (
                    <Link key={a.id} href={`/articles/${a.slug}`} className="block">
                      <Card className="p-4 transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{a.title}</p>
                          <Badge>{a.category.category_name}</Badge>
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {a.excerpt}
                        </p>
                        <p className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {a.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {timeAgo(a.published_at)}
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
                    <Link key={d.id} href={`/discussions/${d.id}`} className="block">
                      <Card className="p-4 transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{d.title}</p>
                          <Badge>{d.category.category_name}</Badge>
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {d.content}
                        </p>
                        <p className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />{" "}
                            {d._count.replies ?? 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {timeAgo(d.created_at)}
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
          </>
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
