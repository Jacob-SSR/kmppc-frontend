"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Clock,
  Eye,
  Flag,
  MessageCircle,
  Lock,
  Send,
  Share2,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import { useArticle, useArticles, useComments, useMe } from "@/lib/queries";
import { fullName, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const article = useArticle(slug);
  const me = useMe();
  const comments = useComments(article.data?.id);
  const related = useArticles({
    category_id: article.data?.category.id,
    limit: 4,
  });
  const [comment, setComment] = useState("");
  const commentBoxRef = useRef<HTMLTextAreaElement>(null);

  // ตอบกลับแบบ mention — comment ของบทความเป็นเธรดชั้นเดียว
  function replyToComment(name: string) {
    setComment((prev) =>
      prev.startsWith(`@${name} `) ? prev : `@${name} ${prev}`,
    );
    commentBoxRef.current?.focus();
    commentBoxRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
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
      (await api.post<{ liked: boolean }>(`/articles/${article.data!.id}/like`))
        .data,
    onSuccess: (data) => {
      toast.success(data.liked ? "ถูกใจบทความแล้ว" : "เลิกถูกใจบทความแล้ว");
      // อัปเดต cache ตรง ๆ — ไม่ refetch เพื่อไม่ให้ view_count เพิ่มซ้ำ
      queryClient.setQueryData<typeof article.data>(["article", slug], (old) =>
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
          article_id: article.data!.id,
        })
      ).data,
    onSuccess: (data) => {
      toast.success(
        data.bookmarked ? "บันทึกบุ๊คมาร์คแล้ว" : "นำออกจากบุ๊คมาร์คแล้ว",
      );
      queryClient.setQueryData<typeof article.data>(["article", slug], (old) =>
        old ? { ...old, bookmarked_by_me: data.bookmarked } : old,
      );
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (err) => handleAuthError(err, "บุ๊คมาร์ค"),
  });

  const reportMutation = useMutation({
    mutationFn: async (reason: string) =>
      api.post("/reports", { reason, article_id: article.data!.id }),
    onSuccess: () =>
      toast.success("ส่งรายงานแล้ว", "ผู้ดูแลระบบจะตรวจสอบโดยเร็วที่สุด"),
    onError: (err) => handleAuthError(err, "รายงาน"),
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) =>
      api.post(`/articles/${article.data!.id}/comments`, { content }),
    onSuccess: () => {
      setComment("");
      toast.success("ส่งความคิดเห็นแล้ว");
      queryClient.invalidateQueries({ queryKey: ["comments", article.data?.id] });
      queryClient.invalidateQueries({ queryKey: ["article", slug] });
    },
    onError: (err) => handleAuthError(err, "แสดงความคิดเห็น"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`/articles/${article.data!.id}`),
    onSuccess: () => {
      toast.success("ลบบทความแล้ว");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      router.push("/articles");
    },
    onError: (err) => handleAuthError(err, "ลบบทความ"),
  });

  const commentLikeMutation = useMutation({
    mutationFn: async (commentId: string) =>
      api.post(`/articles/${article.data!.id}/comments/${commentId}/like`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["comments", article.data?.id] }),
    onError: (err) => handleAuthError(err, "กดถูกใจ"),
  });

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("คัดลอกลิงก์แล้ว", "ส่งต่อให้เพื่อนร่วมงานได้เลย");
    } catch {
      toast.error("คัดลอกลิงก์ไม่สำเร็จ");
    }
  }

  function report() {
    const reason = window.prompt("โปรดระบุเหตุผลในการรายงานบทความนี้");
    if (reason?.trim()) reportMutation.mutate(reason.trim());
  }

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("กรุณากรอกความคิดเห็นก่อนส่ง");
      return;
    }
    commentMutation.mutate(comment.trim());
  }

  if (article.isLoading) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <Card className="h-96 animate-pulse bg-muted/50" />
        </div>
      </PublicShell>
    );
  }

  if (article.isError || !article.data) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-6">
          <h1 className="text-2xl font-bold">ไม่พบบทความนี้</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            บทความอาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง
          </p>
          <Link href="/articles" className="mt-4 inline-block text-primary hover:underline">
            กลับไปหน้ารวมบทความ
          </Link>
        </div>
      </PublicShell>
    );
  }

  const a = article.data;
  const tags = a.tags?.map((t) => t.tag) ?? [];
  const canDelete =
    !!me.data &&
    (me.data.role.role_name === "ADMIN" || a.author.id === me.data.id);
  // ยังไม่ login — เห็นแค่หัวข้อ ปิดชื่อผู้เขียน เนื้อหา/ความคิดเห็นถูกเบลอ
  const isGuest = me.isError;
  const relatedItems = (related.data?.items ?? [])
    .filter((r) => r.id !== a.id)
    .slice(0, 3);

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px] lg:px-6">
        <div>
          <Card className="p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{a.category.category_name}</Badge>
              {tags.map((t) => (
                <Badge key={t.id} variant="outline">
                  #{t.tag_name}
                </Badge>
              ))}
            </div>
            <h1 className="mt-4 text-2xl font-bold leading-snug lg:text-3xl">
              {a.title}
            </h1>
            {a.excerpt && <p className="mt-2 text-muted-foreground">{a.excerpt}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-border pb-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {isGuest ? "สมาชิกในระบบ" : fullName(a.author)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {timeAgo(a.published_at ?? a.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {a.view_count} ครั้ง
              </span>
            </div>

            {isGuest ? (
              <div className="relative mt-6 min-h-[260px] overflow-hidden">
                <div
                  className="pointer-events-none select-none blur-sm"
                  aria-hidden
                >
                  <div className="space-y-4 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {a.content.slice(0, 600)}
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-end gap-3 bg-gradient-to-b from-transparent via-background/70 to-background pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                    <Lock className="h-5 w-5 text-primary" />
                  </span>
                  <p className="text-center text-sm text-muted-foreground">
                    เข้าสู่ระบบเพื่ออ่านบทความฉบับเต็มและความคิดเห็น (
                    {a._count.comments} ความคิดเห็น)
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
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed whitespace-pre-wrap">
                {a.content}
              </div>
            )}

            {!isGuest && (
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeMutation.mutate()}
                loading={likeMutation.isPending}
                className={cn(
                  "text-muted-foreground",
                  a.liked_by_me && "font-semibold text-primary hover:text-primary",
                )}
              >
                <ThumbsUp
                  className={cn("h-4 w-4", a.liked_by_me && "fill-current")}
                />
                ถูกใจ ({a._count.likes})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => bookmarkMutation.mutate()}
                loading={bookmarkMutation.isPending}
                className={cn(
                  "text-muted-foreground",
                  a.bookmarked_by_me &&
                    "font-semibold text-primary hover:text-primary",
                )}
              >
                <Bookmark
                  className={cn("h-4 w-4", a.bookmarked_by_me && "fill-current")}
                />
                บุ๊คมาร์ค
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={share}
              >
                <Share2 className="h-4 w-4" />
                แชร์
              </Button>
              <div className="ml-auto flex items-center gap-2">
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/5"
                    onClick={() => {
                      if (window.confirm("ยืนยันลบบทความนี้?"))
                        deleteMutation.mutate();
                    }}
                    loading={deleteMutation.isPending}
                  >
                    {!deleteMutation.isPending && <Trash2 className="h-4 w-4" />}
                    ลบบทความ
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
            )}
          </Card>

          {/* Comments */}
          {!isGuest && (
          <Card className="mt-6 p-6">
            <h2 className="flex items-center gap-2 font-bold">
              <MessageCircle className="h-5 w-5 text-primary" />
              ความคิดเห็น ({comments.data?.length ?? 0})
            </h2>

            <form className="mt-4 flex gap-3" onSubmit={submitComment}>
              <div className="flex-1">
                <Textarea
                  ref={commentBoxRef}
                  rows={3}
                  placeholder="แสดงความคิดเห็นของคุณ..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={commentMutation.isPending}
                />
                <div className="mt-2 flex justify-end">
                  <Button size="sm" type="submit" loading={commentMutation.isPending}>
                    {!commentMutation.isPending && <Send className="h-4 w-4" />}
                    ส่งความคิดเห็น
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5 space-y-5">
              {comments.data?.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  ยังไม่มีความคิดเห็น — เป็นคนแรกที่แสดงความคิดเห็นเลย
                </p>
              )}
              {comments.data?.map((c) => {
                const name = fullName(c.user);
                return (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={name} size="sm" />
                    <div className="flex-1 rounded-xl bg-muted p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{name}</p>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(c.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                        {c.content}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <button
                          className={cn(
                            "flex items-center gap-1 text-muted-foreground hover:text-primary",
                            c.liked_by_me && "font-semibold text-primary",
                          )}
                          onClick={() => commentLikeMutation.mutate(c.id)}
                        >
                          <ThumbsUp
                            className={cn(
                              "h-3.5 w-3.5",
                              c.liked_by_me && "fill-current",
                            )}
                          />
                          ถูกใจ ({c._count.likes})
                        </button>
                        <button
                          className="text-muted-foreground hover:text-primary"
                          onClick={() => replyToComment(name)}
                        >
                          ตอบกลับ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold">บทความที่เกี่ยวข้อง</h3>
            <div className="mt-3 space-y-3">
              {relatedItems.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีบทความที่เกี่ยวข้อง
                </p>
              )}
              {relatedItems.map((r) => (
                <Link
                  key={r.id}
                  href={`/articles/${r.slug}`}
                  className="block rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <p className="text-sm font-medium leading-snug">{r.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" /> {r.view_count} ·{" "}
                    {timeAgo(r.published_at ?? r.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          </Card>
          {tags.length > 0 && (
            <Card className="p-5">
              <h3 className="font-bold">แท็ก</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Badge key={t.id} variant="outline">
                    #{t.tag_name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </PublicShell>
  );
}
