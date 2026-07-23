"use client";

import { notFound, useParams } from "next/navigation";
import {
  Award,
  Bookmark,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  MessageCircle,
  Send,
  ThumbsUp,
  VenetianMask,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { discussions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// รายละเอียดกระทู้ — จะเชื่อม GET /api/discussions/:id + POST replies ในสปรินต์ถัดไป
export default function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const discussion = discussions.find((d) => d.id === id);
  if (!discussion) notFound();

  const best = discussion.replies.find((r) => r.is_best_answer);
  const rest = discussion.replies.filter((r) => !r.is_best_answer);

  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        <Card className="p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{discussion.category}</Badge>
            {discussion.is_solved && (
              <Badge className="gap-1 bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> แก้ไขแล้ว
              </Badge>
            )}
            {discussion.tags.map((t) => (
              <Badge key={t} variant="outline">
                #{t}
              </Badge>
            ))}
          </div>

          <h1 className="mt-4 text-2xl font-bold leading-snug">
            {discussion.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            {discussion.is_anonymous ? (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <VenetianMask className="h-5 w-5" />
              </span>
            ) : (
              <Avatar name={discussion.author} />
            )}
            <div className="text-sm">
              <p className="font-semibold">{discussion.author}</p>
              <p className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {discussion.time}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {discussion.views} ครั้ง
                </span>
              </p>
            </div>
          </div>

          <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed">
            {discussion.content}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm">
              <ThumbsUp className="h-4 w-4 text-primary" />
              ถูกใจ ({discussion.likes})
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 text-primary" />
              บุ๊คมาร์ค
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

        <h2 className="mt-8 flex items-center gap-2 font-bold">
          <MessageCircle className="h-5 w-5 text-primary" />
          {discussion.replies.length} คำตอบ
        </h2>

        <div className="mt-4 space-y-4">
          {[...(best ? [best] : []), ...rest].map((r) => (
            <Card
              key={r.id}
              className={cn(
                "p-5",
                r.is_best_answer && "border-emerald-300 bg-emerald-50/50"
              )}
            >
              {r.is_best_answer && (
                <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                  <Award className="h-4 w-4" /> คำตอบที่ดีที่สุด
                </p>
              )}
              <div className="flex gap-3">
                {r.is_anonymous ? (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <VenetianMask className="h-4 w-4" />
                  </span>
                ) : (
                  <Avatar name={r.author} size="sm" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{r.author}</p>
                    <span className="text-xs text-muted-foreground">
                      {r.time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed">{r.content}</p>
                  <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary">
                      <ThumbsUp className="h-3.5 w-3.5" /> ถูกใจ ({r.likes})
                    </button>
                    <button className="hover:text-primary">ตอบกลับ</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Reply form */}
        <Card className="mt-6 p-5">
          <h3 className="font-bold">ตอบกระทู้นี้</h3>
          <form className="mt-3" onSubmit={(e) => e.preventDefault()}>
            <Textarea rows={4} placeholder="เขียนคำตอบของคุณ..." />
            <div className="mt-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input accent-[var(--primary)]"
                />
                ตอบแบบไม่ระบุตัวตน
              </label>
              <Button type="submit">
                <Send className="h-4 w-4" />
                ส่งคำตอบ
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PublicShell>
  );
}
