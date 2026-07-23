"use client";

import Link from "next/link";
import { useState } from "react";
import {
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
import { articles, allCategories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// รายการบทความ — จะเชื่อม GET /api/articles (page, limit, category_id, q) ในสปรินต์ถัดไป
export default function ArticlesPage() {
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState("");

  const filtered = articles.filter(
    (a) =>
      (category === "all" || a.category === category) &&
      (q === "" || a.title.includes(q) || a.excerpt.includes(q))
  );

  return (
    <PublicShell>
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
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาบทความ, คู่มือ, SOP..."
              className="bg-card pl-9"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[{ id: "all", category_name: "ทั้งหมด" }, ...allCategories].map(
              (c) => {
                const value = c.id === "all" ? "all" : c.category_name;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(value)}
                    className={cn(
                      "rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition-colors hover:bg-secondary",
                      category === value &&
                        "border-primary bg-primary text-primary-foreground hover:bg-primary"
                    )}
                  >
                    {c.category_name}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <p className="text-sm text-muted-foreground">
          พบ {filtered.length} บทความ
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Link key={a.slug} href={`/articles/${a.slug}`}>
              <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2">
                  <Badge>{a.category}</Badge>
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
                    <User className="h-3 w-3" /> {a.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {a.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" /> {a.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {a.comments}
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {a.time}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <Card className="mt-4 p-10 text-center text-sm text-muted-foreground">
            ไม่พบบทความที่ตรงกับเงื่อนไขการค้นหา
          </Card>
        )}
      </section>
    </PublicShell>
  );
}
