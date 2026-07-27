"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MessageCircle,
  MessagesSquare,
  ThumbsUp,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useFriends, useMe, useUserProfile } from "@/lib/queries";
import { realName, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

/** โปรไฟล์สาธารณะของสมาชิก — แสดงชื่อจริงสไตล์เฟซบุ๊ก + ปุ่มเริ่มแชท */
export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const me = useMe();
  const profile = useUserProfile(id);
  const friends = useFriends();

  const refreshFriends = () =>
    queryClient.invalidateQueries({ queryKey: ["friends"] });

  const addFriendMutation = useMutation({
    mutationFn: async () => api.post(`/friends/${id}`),
    onSuccess: () => {
      toast.success("ส่งคำขอเป็นเพื่อนแล้ว", "รออีกฝ่ายตอบรับ");
      refreshFriends();
    },
    onError: (err) =>
      toast.error("ส่งคำขอไม่สำเร็จ", getApiErrorMessage(err)),
  });
  const acceptMutation = useMutation({
    mutationFn: async (friendshipId: string) =>
      api.post(`/friends/${friendshipId}/accept`),
    onSuccess: () => {
      toast.success("เป็นเพื่อนกันแล้ว 🎉");
      refreshFriends();
    },
    onError: (err) => toast.error("ทำรายการไม่สำเร็จ", getApiErrorMessage(err)),
  });
  const removeMutation = useMutation({
    mutationFn: async (friendshipId: string) =>
      api.delete(`/friends/${friendshipId}`),
    onSuccess: () => {
      toast.success("ลบรายการเพื่อนแล้ว");
      refreshFriends();
    },
    onError: (err) => toast.error("ทำรายการไม่สำเร็จ", getApiErrorMessage(err)),
  });

  if (profile.isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
        <Card className="h-72 animate-pulse bg-muted/50" />
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center lg:px-6">
        <h1 className="text-xl font-bold">ไม่พบผู้ใช้งานนี้</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          บัญชีอาจถูกปิดใช้งาน หรือลิงก์ไม่ถูกต้อง
        </p>
      </div>
    );
  }

  const p = profile.data;
  const displayName = p.display_name?.trim() || realName(p);
  const isMe = me.data?.id === p.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-secondary via-accent/70 to-secondary" />
        <div className="-mt-10 px-6 pb-6 text-center">
          <Avatar name={displayName} src={p.profile_image} size="lg" className="mx-auto ring-4 ring-card" />
          <h1 className="mt-3 text-2xl font-bold">{displayName}</h1>
          {/* ชื่อจริงเห็นเฉพาะในหน้าโปรไฟล์ (สไตล์เฟซบุ๊ก) */}
          {p.display_name && (
            <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-primary" />
              ชื่อจริง: {realName(p)}
            </p>
          )}
          {p.position && (
            <p className="mt-1 text-sm text-muted-foreground">{p.position}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {p.department && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> {p.department.dept_name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> เป็นสมาชิก
              {timeAgo(p.created_at)}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xl font-bold">{p._count.articles}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> บทความ
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{p._count.discussions}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessagesSquare className="h-3.5 w-3.5" /> กระทู้
              </p>
            </div>
          </div>

          {!isMe && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="dark"
                onClick={() => router.push(`/chat?user=${p.id}`)}
              >
                <MessageCircle className="h-4 w-4" />
                ส่งข้อความ
              </Button>
              {(() => {
                const data = friends.data;
                if (!data) return null;
                const asFriend = data.friends.find((f) => f.user.id === p.id);
                const asIncoming = data.incoming.find(
                  (f) => f.user.id === p.id,
                );
                const asOutgoing = data.outgoing.find(
                  (f) => f.user.id === p.id,
                );
                if (asFriend)
                  return (
                    <Button
                      variant="outline"
                      loading={removeMutation.isPending}
                      onClick={() =>
                        removeMutation.mutate(asFriend.friendship_id)
                      }
                      title="เลิกเป็นเพื่อน"
                    >
                      <Check className="h-4 w-4 text-primary" />
                      เพื่อนกันแล้ว
                    </Button>
                  );
                if (asIncoming)
                  return (
                    <Button
                      variant="ai"
                      loading={acceptMutation.isPending}
                      onClick={() =>
                        acceptMutation.mutate(asIncoming.friendship_id)
                      }
                    >
                      <UserPlus className="h-4 w-4" />
                      ตอบรับคำขอเป็นเพื่อน
                    </Button>
                  );
                if (asOutgoing)
                  return (
                    <Button
                      variant="outline"
                      loading={removeMutation.isPending}
                      onClick={() =>
                        removeMutation.mutate(asOutgoing.friendship_id)
                      }
                      title="ยกเลิกคำขอ"
                    >
                      <UserMinus className="h-4 w-4" />
                      รอตอบรับ · ยกเลิก
                    </Button>
                  );
                return (
                  <Button
                    variant="outline"
                    loading={addFriendMutation.isPending}
                    onClick={() => addFriendMutation.mutate()}
                  >
                    <UserPlus className="h-4 w-4 text-primary" />
                    เพิ่มเพื่อน
                  </Button>
                );
              })()}
            </div>
          )}
          {isMe && (
            <Link href="/profile" className="mt-6 inline-block">
              <Button variant="outline">แก้ไขโปรไฟล์ของฉัน</Button>
            </Link>
          )}
        </div>
      </Card>

      {/* ผลงานของคนนี้ — สลับแท็บ บทความ/กระทู้ แสดงเป็นการ์ด */}
      {(p.articles.length > 0 || p.discussions.length > 0) && (
        <PostsSection
          articles={p.articles}
          discussions={p.discussions}
          isMe={isMe}
        />
      )}
    </div>
  );
}

function PostsSection({
  articles,
  discussions,
  isMe,
}: {
  articles: NonNullable<
    ReturnType<typeof useUserProfile>["data"]
  >["articles"];
  discussions: NonNullable<
    ReturnType<typeof useUserProfile>["data"]
  >["discussions"];
  isMe: boolean;
}) {
  const [tab, setTab] = useState<"articles" | "discussions">(
    articles.length > 0 ? "articles" : "discussions",
  );
  return (
    <div className="mt-6">
      <div className="flex w-fit gap-1 rounded-lg bg-muted p-1 text-sm">
        <button
          className={cn(
            "rounded-md px-3 py-1.5 transition-colors",
            tab === "articles" && "bg-card font-semibold shadow-sm",
          )}
          onClick={() => setTab("articles")}
        >
          บทความ ({articles.length})
        </button>
        <button
          className={cn(
            "rounded-md px-3 py-1.5 transition-colors",
            tab === "discussions" && "bg-card font-semibold shadow-sm",
          )}
          onClick={() => setTab("discussions")}
        >
          กระทู้ ({discussions.length})
        </button>
      </div>

      {tab === "articles" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {articles.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground sm:col-span-2">
              {isMe ? "คุณยังไม่มีบทความที่เผยแพร่" : "ยังไม่มีบทความที่เผยแพร่"}
            </Card>
          )}
          {articles.map((a) => (
            <Link key={a.id} href={`/articles/${a.slug}`}>
              <Card className="flex h-full flex-col overflow-hidden p-4 transition-shadow hover:shadow-md">
                {a.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.cover_image}
                    alt=""
                    className="-mx-4 -mt-4 mb-3 h-28 w-[calc(100%+2rem)] max-w-none object-cover"
                  />
                )}
                <Badge className="w-fit">{a.category.category_name}</Badge>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">
                  {a.title}
                </h3>
                <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {a.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" /> {a._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {a._count.comments}
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(a.published_at ?? "")}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {tab === "discussions" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {discussions.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground sm:col-span-2">
              {isMe ? "คุณยังไม่มีกระทู้" : "ยังไม่มีกระทู้"}
            </Card>
          )}
          {discussions.map((d) => (
            <Link key={d.id} href={`/discussions/${d.id}`}>
              <Card className="flex h-full flex-col p-4 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2">
                  <Badge className="w-fit">{d.category.category_name}</Badge>
                  {d.is_solved && (
                    <Badge className="gap-1 bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> แก้ไขแล้ว
                    </Badge>
                  )}
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">
                  {d.title}
                </h3>
                <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {d.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" /> {d._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessagesSquare className="h-3 w-3" /> {d._count.replies}
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(d.created_at)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
