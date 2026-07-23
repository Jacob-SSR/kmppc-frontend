"use client";

import Link from "next/link";
import {
  Bookmark,
  BookmarkX,
  Clock,
  FileText,
  MessagesSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { articles, bookmarks, discussions } from "@/lib/mock-data";

// บุ๊คมาร์คของฉัน — จะเชื่อม GET /api/bookmarks + POST /api/bookmarks/toggle ในสปรินต์ถัดไป
export default function BookmarksPage() {
  const items = bookmarks
    .map((b) => {
      if (b.kind === "article") {
        const a = articles.find((x) => x.slug === b.ref);
        return a
          ? {
              id: b.id,
              href: `/articles/${a.slug}`,
              title: a.title,
              sub: a.excerpt,
              category: a.category,
              kind: "บทความ",
              icon: FileText,
              saved_at: b.saved_at,
            }
          : null;
      }
      const d = discussions.find((x) => x.id === b.ref);
      return d
        ? {
            id: b.id,
            href: `/discussions/${d.id}`,
            title: d.title,
            sub: d.content,
            category: d.category,
            kind: "กระทู้",
            icon: MessagesSquare,
            saved_at: b.saved_at,
          }
        : null;
    })
    .filter((x) => x !== null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Bookmark className="h-6 w-6 text-primary" />
        บุ๊คมาร์คของฉัน
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        บทความและกระทู้ที่คุณบันทึกไว้ ({items.length} รายการ)
      </p>

      <div className="mt-6 space-y-3">
        {items.map((b) => (
          <Card key={b.id} className="flex items-start gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <b.icon className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <Link href={b.href} className="group">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold group-hover:text-primary">
                    {b.title}
                  </p>
                  <Badge variant="outline">{b.kind}</Badge>
                  <Badge>{b.category}</Badge>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {b.sub}
                </p>
              </Link>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> บันทึกเมื่อ {b.saved_at}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              aria-label="ลบบุ๊คมาร์ค"
            >
              <BookmarkX className="h-5 w-5" />
            </Button>
          </Card>
        ))}
        {items.length === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            ยังไม่มีรายการที่บันทึกไว้
          </Card>
        )}
      </div>
    </div>
  );
}
