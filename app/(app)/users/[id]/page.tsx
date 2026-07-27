"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  FileText,
  MessageCircle,
  MessagesSquare,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useFriends, useMe, useUserProfile } from "@/lib/queries";
import { realName, timeAgo } from "@/lib/format";

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
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
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
    </div>
  );
}
