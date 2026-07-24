"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Bookmark,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  ImagePlus,
  MessageCircle,
  Lock,
  Send,
  ThumbsUp,
  Trash2,
  VenetianMask,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmojiPickerButton } from "@/components/emoji-picker";
import { PublicShell } from "@/components/public-shell";
import { RichText } from "@/components/rich-text";
import { ShareMenu } from "@/components/share-menu";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import { useDiscussion, useMe, type Reply } from "@/lib/queries";
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
  // ตอบกลับซ้อน — เก็บ id + ชื่อของคำตอบที่กำลังตอบกลับ
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(
    null,
  );
  const replyBoxRef = useRef<HTMLTextAreaElement>(null);

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
      // อัปเดต cache ตรง ๆ — ไม่ refetch เพื่อไม่ให้ view_count เพิ่มซ้ำ
      queryClient.setQueryData<typeof discussion.data>(
        ["discussion", id],
        (old) =>
          old
            ? {
                ...old,
                liked_by_me: data.liked,
                _count: {
                  ...old._count,
                  likes: old._count.likes + (data.liked ? 1 : -1),
                },
              }
            : old,
      );
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
      queryClient.setQueryData<typeof discussion.data>(
        ["discussion", id],
        (old) => (old ? { ...old, bookmarked_by_me: data.bookmarked } : old),
      );
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (err) => handleAuthError(err, "บุ๊คมาร์ค"),
  });

  // modal ยืนยันลบ / รายงาน
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const reportMutation = useMutation({
    mutationFn: async (reason: string) =>
      api.post("/reports", { reason, discussion_id: id }),
    onSuccess: () => {
      toast.success("ส่งรายงานแล้ว", "ผู้ดูแลระบบจะตรวจสอบโดยเร็วที่สุด");
      setReportOpen(false);
      setReportReason("");
    },
    onError: (err) => handleAuthError(err, "รายงาน"),
  });

  const replyMutation = useMutation({
    mutationFn: async () =>
      api.post(`/discussions/${id}/replies`, {
        content: reply.trim(),
        is_anonymous: anonymous,
        parent_reply_id: replyTo?.id,
      }),
    onSuccess: () => {
      setReply("");
      setAnonymous(false);
      setReplyTo(null);
      toast.success("ส่งคำตอบแล้ว", "ขอบคุณที่ร่วมช่วยตอบ");
      refetchThread();
    },
    onError: (err) => handleAuthError(err, "ตอบกระทู้"),
  });

  function startReplyTo(replyId: string, name: string) {
    setReplyTo({ id: replyId, name });
    replyBoxRef.current?.focus();
    replyBoxRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  // แทรก emoji/รูปที่ตำแหน่งเคอร์เซอร์ในช่องตอบ
  function insertIntoReply(snippet: string, blockLevel = false) {
    const el = replyBoxRef.current;
    const pos = el?.selectionStart ?? reply.length;
    const before = reply.slice(0, pos);
    const after = reply.slice(pos);
    const text = blockLevel
      ? `${before && !before.endsWith("\n") ? "\n" : ""}${snippet}\n`
      : snippet;
    setReply(before + text + after);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const p = pos + text.length;
      el.setSelectionRange(p, p);
    });
  }

  const [uploadingReplyImage, setUploadingReplyImage] = useState(false);
  const replyImageRef = useRef<HTMLInputElement>(null);

  async function attachReplyImage(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("ไม่ใช่ไฟล์รูปภาพ", file.name);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("รูปใหญ่เกิน 10MB", file.name);
      return;
    }
    setUploadingReplyImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<{ url: string; filename?: string }>(
        "/upload",
        formData,
      );
      insertIntoReply(`![${data.filename ?? file.name}](${data.url})`, true);
    } catch (err) {
      handleAuthError(err, "แนบรูป");
    } finally {
      setUploadingReplyImage(false);
      if (replyImageRef.current) replyImageRef.current.value = "";
    }
  }

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

  function submitReport() {
    if (!reportReason.trim()) {
      toast.error("กรุณาระบุเหตุผลในการรายงาน");
      return;
    }
    reportMutation.mutate(reportReason.trim());
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
  const realAuthorName = fullName(d.author);
  // guest ไม่เห็นชื่อผู้ตั้งกระทู้ (โพสต์ anonymous แสดง "ไม่ระบุตัวตน" ตามเดิม)
  const authorName =
    me.isError && !d.is_anonymous ? "สมาชิกในระบบ" : realAuthorName;
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

  // ยังไม่ login (เช็คจาก /auth/me ที่ตอบ 401) — เห็นแค่หัวข้อ เนื้อหาและบทสนทนาถูกเบลอ
  const isGuest = me.isError;

  const topLevelReplies = replies.filter((r) => !r.parent_reply_id);
  const childrenOf = (parentId: string) =>
    replies.filter((r) => r.parent_reply_id === parentId);

  function renderReplyItem(r: Reply) {
    const name = fullName(r.author);
    return (
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
            <RichText text={r.content} />
          </p>
          <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" /> ถูกใจ ({r._count.likes})
            </span>
            <button
              className="hover:text-primary"
              onClick={() => startReplyTo(r.parent_reply_id ?? r.id, name)}
            >
              ตอบกลับ
            </button>
            {canPickBest && !r.is_best_answer && !r.parent_reply_id && (
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
    );
  }

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

          {isGuest ? (
            <div className="relative mt-5 min-h-[260px] overflow-hidden">
              <div
                className="pointer-events-none select-none blur-sm"
                aria-hidden
              >
                <p className="whitespace-pre-line text-[15px] leading-relaxed">
                  {d.content}
                </p>
                <div className="mt-4 space-y-3">
                  {replies.slice(0, 2).map((r) => (
                    <div key={r.id} className="rounded-xl bg-muted p-4 text-sm">
                      {r.content}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-end gap-3 bg-gradient-to-b from-transparent via-background/70 to-background pb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                  <Lock className="h-5 w-5 text-primary" />
                </span>
                <p className="text-center text-sm text-muted-foreground">
                  เข้าสู่ระบบเพื่ออ่านเนื้อหาและบทสนทนาทั้งหมด ({replies.length}{" "}
                  คำตอบ)
                </p>
                <Link href="/login">
                  <Button variant="dark">
                    <Lock className="h-4 w-4" />
                    เข้าสู่ระบบเพื่ออ่านต่อ
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed">
              <RichText text={d.content} />
            </p>
          )}

          {!isGuest && (
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              loading={likeMutation.isPending}
              className={cn(
                "text-muted-foreground",
                d.liked_by_me && "font-semibold text-primary hover:text-primary",
              )}
            >
              <ThumbsUp
                className={cn("h-4 w-4", d.liked_by_me && "fill-current")}
              />
              ถูกใจ ({d._count.likes})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => bookmarkMutation.mutate()}
              loading={bookmarkMutation.isPending}
              className={cn(
                "text-muted-foreground",
                d.bookmarked_by_me &&
                  "font-semibold text-primary hover:text-primary",
              )}
            >
              <Bookmark
                className={cn("h-4 w-4", d.bookmarked_by_me && "fill-current")}
              />
              บุ๊คมาร์ค
            </Button>
            <ShareMenu title={d.title} />
            <div className="ml-auto flex items-center gap-2">
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/5"
                  onClick={() => setConfirmingDelete(true)}
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
                onClick={() => setReportOpen(true)}
                loading={reportMutation.isPending}
              >
                <Flag className="h-4 w-4" />
                รายงาน
              </Button>
            </div>
          </div>
          )}
        </Card>

        {!isGuest && (
        <>
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
          {topLevelReplies.map((r) => {
            const children = childrenOf(r.id);
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
                {renderReplyItem(r)}
                {children.length > 0 && (
                  <div className="ml-6 mt-3 space-y-3 border-l-2 border-border pl-4">
                    {children.map((c) => (
                      <div key={c.id}>{renderReplyItem(c)}</div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Reply form */}
        <Card className="mt-6 p-5">
          <h3 className="font-bold">ตอบกระทู้นี้</h3>
          {replyTo && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-sm">
              <span className="text-secondary-foreground">
                กำลังตอบกลับคำตอบของ{" "}
                <span className="font-semibold">{replyTo.name}</span>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ยกเลิก
              </button>
            </div>
          )}
          <form className="mt-3" onSubmit={submitReply}>
            <Textarea
              ref={replyBoxRef}
              rows={4}
              placeholder={
                replyTo
                  ? `ตอบกลับคุณ${replyTo.name}...`
                  : "เขียนคำตอบของคุณ..."
              }
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              disabled={replyMutation.isPending}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <EmojiPickerButton
                  onPick={(emoji) => insertIntoReply(emoji)}
                  disabled={replyMutation.isPending}
                />
                <input
                  ref={replyImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => attachReplyImage(e.target.files)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="แนบรูปภาพ"
                  title="แนบรูปภาพ"
                  loading={uploadingReplyImage}
                  disabled={replyMutation.isPending}
                  onClick={() => replyImageRef.current?.click()}
                >
                  {!uploadingReplyImage && (
                    <ImagePlus className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <label className="ml-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-[var(--primary)]"
                  />
                  ตอบแบบไม่ระบุตัวตน
                </label>
              </div>
              <Button type="submit" loading={replyMutation.isPending}>
                {!replyMutation.isPending && <Send className="h-4 w-4" />}
                ส่งคำตอบ
              </Button>
            </div>
          </form>
        </Card>
        </>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        danger
        title="ลบกระทู้นี้?"
        description={`"${d.title}" และคำตอบทั้งหมดจะถูกลบ — การลบย้อนกลับไม่ได้`}
        confirmLabel="ลบกระทู้"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmingDelete(false)}
      />

      <ConfirmDialog
        open={reportOpen}
        title="รายงานกระทู้นี้"
        description="โปรดระบุเหตุผล ผู้ดูแลระบบจะตรวจสอบโดยเร็วที่สุด"
        confirmLabel="ส่งรายงาน"
        loading={reportMutation.isPending}
        onConfirm={submitReport}
        onCancel={() => {
          setReportOpen(false);
          setReportReason("");
        }}
      >
        <Textarea
          rows={3}
          placeholder="เช่น เนื้อหาไม่เหมาะสม, สแปม..."
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          autoFocus
        />
      </ConfirmDialog>
    </PublicShell>
  );
}
