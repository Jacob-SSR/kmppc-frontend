"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownWideNarrow,
  Download,
  Eye,
  FileSpreadsheet,
  MessageCircle,
  MousePointerClick,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { type Author } from "@/lib/queries";
import { formatNum, fullName } from "@/lib/format";
import { cn } from "@/lib/utils";

type ArticleStat = {
  id: string;
  slug: string;
  title: string;
  view_count: number;
  published_at: string | null;
  author: Author;
  category: { category_name: string };
  _count: { comments: number; likes: number };
  link_click_count: number;
  file_download_count: number;
};

type SortKey = "views" | "likes" | "comments" | "links" | "downloads";

const sortValue: Record<SortKey, (a: ArticleStat) => number> = {
  views: (a) => a.view_count,
  likes: (a) => a._count.likes,
  comments: (a) => a._count.comments,
  links: (a) => a.link_click_count,
  downloads: (a) => a.file_download_count,
};

const columns: { key: SortKey; label: string; icon: typeof Eye }[] = [
  { key: "views", label: "ยอดชม", icon: Eye },
  { key: "likes", label: "ถูกใจ", icon: ThumbsUp },
  { key: "comments", label: "คอมเมนต์", icon: MessageCircle },
  { key: "links", label: "กดลิงก์", icon: MousePointerClick },
  { key: "downloads", label: "ดาวน์โหลด", icon: Download },
];

export default function AdminStatsPage() {
  const [sortBy, setSortBy] = useState<SortKey>("views");
  const stats = useQuery({
    queryKey: ["admin-article-stats"],
    queryFn: async () => (await api.get<ArticleStat[]>("/articles/stats")).data,
  });

  const items = [...(stats.data ?? [])].sort(
    (a, b) => sortValue[sortBy](b) - sortValue[sortBy](a),
  );

  // Export CSV (มี BOM ให้ Excel อ่านภาษาไทยถูก) — เปิดใน Excel ได้ทันที
  function exportCsv() {
    const header = [
      "บทความ",
      "หมวดหมู่",
      "ผู้เขียน",
      "วันที่เผยแพร่",
      "ยอดชม",
      "ถูกใจ",
      "คอมเมนต์",
      "กดลิงก์",
      "ดาวน์โหลดไฟล์",
    ];
    const rows = items.map((a) => [
      a.title,
      a.category.category_name,
      fullName(a.author),
      a.published_at ? new Date(a.published_at).toLocaleDateString("th-TH") : "",
      a.view_count,
      a._count.likes,
      a._count.comments,
      a.link_click_count,
      a.file_download_count,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `สถิติบทความ-${new Date().toLocaleDateString("th-TH")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const totals = items.reduce(
    (t, a) => ({
      views: t.views + a.view_count,
      likes: t.likes + a._count.likes,
      comments: t.comments + a._count.comments,
      links: t.links + a.link_click_count,
      downloads: t.downloads + a.file_download_count,
    }),
    { views: 0, likes: 0, comments: 0, links: 0, downloads: 0 },
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          สถิติบทความที่เผยแพร่ทั้งหมด {items.length} บทความ — กดหัวคอลัมน์เพื่อเรียงลำดับ
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={items.length === 0}
        >
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          Export Excel (CSV)
        </Button>
      </div>

      {/* สรุปยอดรวม */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {columns.map((c) => (
          <Card key={c.key} className="flex items-center gap-2.5 p-3.5">
            <c.icon className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-lg font-bold leading-none">
                {formatNum(totals[c.key])}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{c.label}รวม</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-4 overflow-x-auto">
        {stats.isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted/50" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            ยังไม่มีบทความที่เผยแพร่
          </p>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">บทความ</th>
                <th className="px-3 py-3 font-medium">ผู้เขียน</th>
                {columns.map((c) => (
                  <th key={c.key} className="px-3 py-3 text-right">
                    <button
                      onClick={() => setSortBy(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1 font-medium transition-colors hover:text-primary",
                        sortBy === c.key && "text-primary",
                      )}
                    >
                      {sortBy === c.key && (
                        <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                      )}
                      {c.label}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/50"
                >
                  <td className="max-w-72 px-5 py-3">
                    <Link
                      href={`/articles/${a.slug}`}
                      className="line-clamp-2 font-medium hover:text-primary hover:underline"
                    >
                      {a.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.category.category_name}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {fullName(a.author)}
                  </td>
                  <td className="px-3 py-3 text-right">{formatNum(a.view_count)}</td>
                  <td className="px-3 py-3 text-right">
                    {formatNum(a._count.likes)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatNum(a._count.comments)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatNum(a.link_click_count)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatNum(a.file_download_count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
