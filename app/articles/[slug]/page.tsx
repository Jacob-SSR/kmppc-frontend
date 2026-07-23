"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  Bookmark,
  Clock,
  Eye,
  Flag,
  MessageCircle,
  Send,
  Share2,
  ThumbsUp,
  User,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { articles } from "@/lib/mock-data";

// ความคิดเห็นตัวอย่าง — จะเชื่อม GET /api/articles/:id/comments ในสปรินต์ถัดไป
const mockComments = [
  {
    id: "cm1",
    author: "คุณเอกชัย พ.",
    time: "1 ชม. ที่แล้ว",
    content: "เป็นประโยชน์มากครับ ขอเพิ่มเติมว่าควรตั้งเวลา Backup ช่วงหลังเที่ยงคืนจะดีที่สุด",
    likes: 3,
  },
  {
    id: "cm2",
    author: "คุณวิไลพร ส.",
    time: "3 ชม. ที่แล้ว",
    content: "ขอบคุณค่ะ ทำตามแล้วเข้าใจง่ายมาก",
    likes: 1,
  },
];

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = articles
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px] lg:px-6">
        <div>
          <Card className="p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{article.category}</Badge>
              {article.tags.map((t) => (
                <Badge key={t} variant="outline">
                  #{t}
                </Badge>
              ))}
            </div>
            <h1 className="mt-4 text-2xl font-bold leading-snug lg:text-3xl">
              {article.title}
            </h1>
            <p className="mt-2 text-muted-foreground">{article.excerpt}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-border pb-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" /> {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {article.time}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {article.views} ครั้ง
              </span>
            </div>

            <div className="mt-6 space-y-6">
              {article.content.map((sec) => (
                <section key={sec.heading}>
                  <h2 className="text-lg font-semibold text-primary-dark">
                    {sec.heading}
                  </h2>
                  <ul className="mt-2 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed">
                    {sec.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-5">
              <Button variant="outline" size="sm">
                <ThumbsUp className="h-4 w-4 text-primary" />
                ถูกใจ ({article.likes})
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 text-primary" />
                บุ๊คมาร์ค
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 text-primary" />
                แชร์
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground"
              >
                <Flag className="h-4 w-4" />
                รายงาน
              </Button>
            </div>
          </Card>

          {/* Comments */}
          <Card className="mt-6 p-6">
            <h2 className="flex items-center gap-2 font-bold">
              <MessageCircle className="h-5 w-5 text-primary" />
              ความคิดเห็น ({mockComments.length})
            </h2>

            <form
              className="mt-4 flex gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <Avatar name="ณัฐวุฒิ" size="sm" className="mt-1" />
              <div className="flex-1">
                <Textarea rows={3} placeholder="แสดงความคิดเห็นของคุณ..." />
                <div className="mt-2 flex justify-end">
                  <Button size="sm" type="submit">
                    <Send className="h-4 w-4" />
                    ส่งความคิดเห็น
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5 space-y-5">
              {mockComments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar name={c.author} size="sm" />
                  <div className="flex-1 rounded-xl bg-muted p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{c.author}</p>
                      <span className="text-xs text-muted-foreground">
                        {c.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed">{c.content}</p>
                    <button className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                      <ThumbsUp className="h-3.5 w-3.5" /> ถูกใจ ({c.likes})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold">บทความที่เกี่ยวข้อง</h3>
            <div className="mt-3 space-y-3">
              {related.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีบทความที่เกี่ยวข้อง
                </p>
              )}
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/articles/${r.slug}`}
                  className="block rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <p className="text-sm font-medium leading-snug">{r.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" /> {r.views} · {r.time}
                  </p>
                </Link>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold">แท็ก</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <Badge key={t} variant="outline">
                  #{t}
                </Badge>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </PublicShell>
  );
}
