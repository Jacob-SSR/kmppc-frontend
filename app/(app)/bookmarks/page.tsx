"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useBookmarks, type Bookmark as BookmarkItem } from "@/lib/queries";
import { timeAgo } from "@/lib/format";

export default function BookmarksPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const bookmarks = useBookmarks();

  const removeMutation = useMutation({
    mutationFn: async (b: BookmarkItem) =>
      api.post("/bookmarks/toggle", {
        article_id: b.article?.id,
        discussion_id: b.discussion?.id,
      }),
    onSuccess: () => {
      toast.success("นำออกจากบุ๊คมาร์คแล้ว");
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (err) => toast.error("ลบบุ๊คมาร์คไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const items = (bookmarks.data ?? []).map((b) => ({
    raw: b,
    href: b.article ? `/articles/${b.article.slug}` : `/discussions/${b.discussion?.id}`,
    title: b.article?.title ?? b.discussion?.title ?? "",
    sub: b.article?.excerpt ?? "",
    kind: b.article ? "บทความ" : "กระทู้",
    icon: b.article ? FileText : MessagesSquare,
  }));

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
        {bookmarks.isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-24 animate-pulse bg-muted/50" />
          ))}
        {items.map((b) => (
          <Card key={b.raw.id} className="flex items-start gap-4 p-5">
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
                </div>
                {b.sub && (
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {b.sub}
                  </p>
                )}
              </Link>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> บันทึกเมื่อ {timeAgo(b.raw.created_at)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              aria-label="ลบบุ๊คมาร์ค"
              onClick={() => removeMutation.mutate(b.raw)}
              disabled={removeMutation.isPending}
            >
              <BookmarkX className="h-5 w-5" />
            </Button>
          </Card>
        ))}
        {!bookmarks.isLoading && items.length === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            ยังไม่มีรายการที่บันทึกไว้ — กดปุ่มบุ๊คมาร์คในหน้าบทความหรือกระทู้เพื่อบันทึก
          </Card>
        )}
      </div>
    </div>
  );
}
