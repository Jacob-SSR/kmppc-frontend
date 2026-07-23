"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  MessageCircle,
  MessagesSquare,
  PlusCircle,
  Search,
  VenetianMask,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCategories, useDiscussions } from "@/lib/queries";
import { useDebounced } from "@/lib/use-debounce";
import { formatNum, fullName, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

export default function DiscussionsPage() {
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q);

  const categories = useCategories();
  const discussions = useDiscussions({
    page,
    limit: PAGE_SIZE,
    q: debouncedQ.trim() || undefined,
    category_id: category === "all" ? undefined : category,
  });

  const total = discussions.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PublicShell>
      <section className="border-b border-border bg-gradient-to-br from-secondary via-background to-accent/60">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-primary-dark lg:text-3xl">
                <MessagesSquare className="h-7 w-7 text-primary" />
                กระทู้ถาม-ตอบ
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                ถามปัญหาหน้างาน แลกเปลี่ยนประสบการณ์ ช่วยกันหาคำตอบ
              </p>
            </div>
            <Link href="/discussions/new">
              <Button variant="dark">
                <PlusCircle className="h-4 w-4" />
                ตั้งกระทู้ใหม่
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
              placeholder="ค้นหากระทู้..."
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
        {discussions.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="h-24 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : discussions.isError ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            โหลดกระทู้ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              พบ {formatNum(total)} กระทู้
            </p>
            <div className="mt-4 space-y-3">
              {discussions.data?.items.map((d) => {
                const name = fullName(d.author);
                return (
                  <Link key={d.id} href={`/discussions/${d.id}`} className="block">
                    <Card className="flex items-start gap-4 p-5 transition-shadow hover:shadow-md">
                      {d.is_anonymous ? (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <VenetianMask className="h-5 w-5" />
                        </span>
                      ) : (
                        <Avatar name={name} />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold leading-snug">{d.title}</h2>
                          <Badge>{d.category.category_name}</Badge>
                          {d.is_solved && (
                            <Badge className="gap-1 bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> แก้ไขแล้ว
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {d.content}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>โดย {name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {timeAgo(d.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />{" "}
                            {d._count.replies ?? 0} คำตอบ
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {d.view_count}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {total === 0 && (
              <Card className="mt-4 p-10 text-center text-sm text-muted-foreground">
                ไม่พบกระทู้ที่ตรงกับเงื่อนไขการค้นหา
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
    </PublicShell>
  );
}
