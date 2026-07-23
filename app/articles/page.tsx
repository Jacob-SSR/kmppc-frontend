"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  MessageCircle,
  Pin,
  PlusCircle,
  Search,
  ThumbsUp,
  User,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useArticles, useCategories } from "@/lib/queries";
import { useDebounced } from "@/lib/use-debounce";
import { formatNum, fullName, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

function ArticlesContent() {
  const initialCategory = useSearchParams().get("category") ?? "all";
  const [category, setCategory] = useState(initialCategory);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q);

  const categories = useCategories();
  const articles = useArticles({
    page,
    limit: PAGE_SIZE,
    q: debouncedQ.trim() || undefined,
    category_id: category === "all" ? undefined : category,
  });

  const total = articles.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <section className="border-b border-border bg-gradient-to-br from-secondary via-background to-accent/60">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-primary-dark lg:text-3xl">
                <FileText className="h-7 w-7 text-primary" />
                บทความความรู้
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                รวมคู่มือ บทความ และ SOP จากทุกแผนกของโรงพยาบาล
              </p>
            </div>
            <Link href="/articles/new">
              <Button variant="dark">
                <PlusCircle className="h-4 w-4" />
                เขียนบทความ
              </Button>
            </Link>
          </div>

          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="ค้นหาบทความ, คู่มือ, SOP..."
              className="bg-card pl-9"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { id: "all", category_name: "ทั้งหมด" },
              ...(categories.data ?? []),
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCategory(c.id);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition-colors hover:bg-secondary",
                  category === c.id &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary",
                )}
              >
                {c.category_name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {articles.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-44 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : articles.isError ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            โหลดบทความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              พบ {formatNum(total)} บทความ
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.data?.items.map((a) => (
                <Link key={a.id} href={`/articles/${a.slug}`}>
                  <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <Badge>{a.category.category_name}</Badge>
                      {a.is_pinned && (
                        <Badge variant="outline" className="gap-1">
                          <Pin className="h-3 w-3" /> ปักหมุด
                        </Badge>
                      )}
                    </div>
                    <h2 className="mt-3 font-semibold leading-snug">{a.title}</h2>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {a.excerpt}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {fullName(a.author)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {a.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {a._count.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {a._count.comments}
                      </span>
                      <span className="ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(a.published_at ?? a.created_at)}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            {total === 0 && (
              <Card className="mt-4 p-10 text-center text-sm text-muted-foreground">
                ไม่พบบทความที่ตรงกับเงื่อนไขการค้นหา
              </Card>
            )}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> ก่อนหน้า
                </Button>
                <span className="text-sm text-muted-foreground">
                  หน้า {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ถัดไป <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default function ArticlesPage() {
  return (
    <PublicShell>
      <Suspense fallback={null}>
        <ArticlesContent />
      </Suspense>
    </PublicShell>
  );
}
