"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Trash2,
  VenetianMask,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import { useDiscussion, useMe } from "@/lib/queries";
import { fullName, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const discussion = useDiscussion(id);
  const me = useMe();
  const [reply, setReply] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  function refetchThread() {
    queryClient.invalidateQueries({ queryKey: ["discussion", id] });
  }

  function handleAuthError(err: unknown, action: string) {
    if (isUnauthorizedError(err)) {
      toast.error("กรุณาเข้าสู่ระบบ", `ต้องเข้าสู่ระบบก่อนจึงจะ${action}ได้`);
      router.push("/login");
    } else {
      toast.error("ทำรายการไม่สำเร็จ", getApiErrorMessage(err));
    }
  }

  const likeMutation = useMutation({
    mutationFn: async () =>
      (await api.post<{ liked: boolean }>(`/discussions/${id}/like`)).data,
    onSuccess: (data) => {
      toast.success(data.liked ? "ถูกใจกระทู้แล้ว" : "เลิกถูกใจกระทู้แล้ว");
      refetchThread();
    },
    onError: (err) => handleAuthError(err, "กดถูกใจ"),
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () =>
      (
        await api.post<{ bookmarked: boolean }>("/bookmarks/toggle", {
          discussion_id: id,
        })
      ).data,
    onSuccess: (data) => {
      toast.success(
        data.bookmarked ? "บันทึกบุ๊คมาร์คแล้ว" : "นำออกจากบุ๊คมาร์คแล้ว",
      );
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (err) => handleAuthError(err, "บุ๊คมาร์ค"),
  });

  const reportMutation = useMutation({
    mutationFn: async (reason: string) =>
      api.post("/reports", { reason, discussion_id: id }),
    onSuccess: () =>
      toast.success("ส่งรายงานแล้ว", "ผู้ดูแลระบบจะตรวจสอบโดยเร็วที่สุด"),
    onError: (err) => handleAuthError(err, "รายงาน"),
  });

  const replyMutation = useMutation({
    mutationFn: async () =>
      api.post(`/discussions/${id}/replies`, {
        content: reply.trim(),
        is_anonymous: anonymous,
      }),
    onSuccess: () => {
      setReply("");
      setAnonymous(false);
      toast.success("ส่งคำตอบแล้ว", "ขอบคุณที่ร่วมช่วยตอบ");
      refetchThread();
    },
    onError: (err) => handleAuthError(err, "ตอบกระทู้"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`/discussions/${id}`),
    onSuccess: () => {
      toast.success("ลบกระทู้แล้ว");
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      router.push("/discussions");
    },
    onError: (err) => handleAuthError(err, "ลบกระทู้"),
  });

  const bestAnswerMutation = useMutation({
    mutationFn: async (replyId: string) =>
      api.post(`/discussions/${id}/replies/${replyId}/best-answer`),
    onSuccess: () => {
      toast.success("เลือกเป็นคำตอบที่ดีที่สุดแล้ว");
      refetchThread();
    },
    onError: (err) => handleAuthError(err, "เลือกคำตอบที่ดีที่สุด"),
  });

  function report() {
    const reason = window.prompt("โปรดระบุเหตุผลในการรายงานกระทู้นี้");
    if (reason?.trim()) reportMutation.mutate(reason.trim());
  }

  function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) {
      toast.error("กรุณากรอกคำตอบก่อนส่ง");
      return;
    }
    replyMutation.mutate();
  }

  if (discussion.isLoading) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
          <Card className="h-72 animate-pulse bg-muted/50" />
        </div>
      </PublicShell>
    );
  }

  if (discussion.isError || !discussion.data) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:px-6">
          <h1 className="text-2xl font-bold">ไม่พบกระทู้นี้</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            กระทู้อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง
          </p>
          <Link
            href="/discussions"
            className="mt-4 inline-block text-primary hover:underline"
          >
            กลับไปหน้ารวมกระทู้
          </Link>
        </div>
      </PublicShell>
    );
  }

  const d = discussion.data;
  const tags = d.tags?.map((t) => t.tag) ?? [];
  const replies = d.replies ?? [];
  const authorName = fullName(d.author);
  // เจ้าของกระทู้ (ที่ไม่ anonymous) หรือ ADMIN เท่านั้นที่เลือก best answer ได้
  const canPickBest =
    !!me.data &&
    !d.is_solved &&
    (me.data.role.role_name === "ADMIN" ||
      (!d.is_anonymous && d.author.id === me.data.id));
  const canDelete =
    !!me.data &&
    (me.data.role.role_name === "ADMIN" ||
      (!d.is_anonymous && d.author.id === me.data.id));

  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        <Card className="p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{d.category.category_name}</Badge>
            {d.is_solved && (
              <Badge className="gap-1 bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> แก้ไขแล้ว
              </Badge>
            )}
            {tags.map((t) => (
              <Badge key={t.id} variant="outline">
                #{t.tag_name}
              </Badge>
            ))}
          </div>

          <h1 className="mt-4 text-2xl font-bold leading-snug">{d.title}</h1>

          <div className="mt-4 flex items-center gap-3">
            {d.is_anonymous ? (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <VenetianMask className="h-5 w-5" />
              </span>
            ) : (
              <Avatar name={authorName} />
            )}
            <div className="text-sm">
              <p className="font-semibold">{authorName}</p>
              <p className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {timeAgo(d.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {d.view_count} ครั้ง
                </span>
              </p>
            </div>
          </div>

          <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed">
            {d.content}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => likeMutation.mutate()}
              loading={likeMutation.isPending}
              className={cn(
                d.liked_by_me &&
                  "border-primary bg-secondary text-primary hover:bg-secondary",
              )}
            >
              <ThumbsUp
                className={cn(
                  "h-4 w-4 text-primary",
                  d.liked_by_me && "fill-current",
                )}
              />
              {d.liked_by_me ? "ถูกใจแล้ว" : "ถูกใจ"} ({d._count.likes})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bookmarkMutation.mutate()}
              loading={bookmarkMutation.isPending}
              className={cn(
                d.bookmarked_by_me &&
                  "border-primary bg-secondary text-primary hover:bg-secondary",
              )}
            >
              <Bookmark
                className={cn(
                  "h-4 w-4 text-primary",
                  d.bookmarked_by_me && "fill-current",
                )}
              />
              {d.bookmarked_by_me ? "บุ๊คมาร์คแล้ว" : "บุ๊คมาร์ค"}
            </Button>
            <div className="ml-auto flex items-center gap-2">
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/5"
                  onClick={() => {
                    if (window.confirm("ยืนยันลบกระทู้นี้?"))
                      deleteMutation.mutate();
                  }}
                  loading={deleteMutation.isPending}
                >
                  {!deleteMutation.isPending && <Trash2 className="h-4 w-4" />}
                  ลบกระทู้
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={report}
                loading={reportMutation.isPending}
              >
                <Flag className="h-4 w-4" />
                รายงาน
              </Button>
            </div>
          </div>
        </Card>

        <h2 className="mt-8 flex items-center gap-2 font-bold">
          <MessageCircle className="h-5 w-5 text-primary" />
          {replies.length} คำตอบ
        </h2>

        <div className="mt-4 space-y-4">
          {replies.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              ยังไม่มีคำตอบ — เป็นคนแรกที่ช่วยตอบกระทู้นี้เลย
            </Card>
          )}
          {replies.map((r) => {
            const name = fullName(r.author);
            return (
              <Card
                key={r.id}
                className={cn(
                  "p-5",
                  r.is_best_answer && "border-emerald-300 bg-emerald-50/50",
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
                    <Avatar name={name} size="sm" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{name}</p>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(r.created_at)}
                      </span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">
                      {r.content}
                    </p>
                    <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" /> ถูกใจ ({r._count.likes})
                      </span>
                      {canPickBest && !r.is_best_answer && (
                        <button
                          className="flex items-center gap-1 hover:text-emerald-700"
                          onClick={() => bestAnswerMutation.mutate(r.id)}
                        >
                          <Award className="h-3.5 w-3.5" />
                          เลือกเป็นคำตอบที่ดีที่สุด
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Reply form */}
        <Card className="mt-6 p-5">
          <h3 className="font-bold">ตอบกระทู้นี้</h3>
          <form className="mt-3" onSubmit={submitReply}>
            <Textarea
              rows={4}
              placeholder="เขียนคำตอบของคุณ..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              disabled={replyMutation.isPending}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-[var(--primary)]"
                />
                ตอบแบบไม่ระบุตัวตน
              </label>
              <Button type="submit" loading={replyMutation.isPending}>
                {!replyMutation.isPending && <Send className="h-4 w-4" />}
                ส่งคำตอบ
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PublicShell>
  );
}
