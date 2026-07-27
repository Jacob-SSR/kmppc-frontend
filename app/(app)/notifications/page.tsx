"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Bell,
  CheckCheck,
  Megaphone,
  MessageCircle,
  Reply,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RichText } from "@/components/rich-text";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useNotifications, type AppNotification } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, React.ElementType> = {
  REPLY: Reply,
  COMMENT: MessageCircle,
  BEST_ANSWER: Award,
  LIKE: ThumbsUp,
  SYSTEM: Megaphone,
};

export default function NotificationsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const notifications = useNotifications({ limit: 50 });

  function refetch() {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  const readAllMutation = useMutation({
    mutationFn: async () => api.post("/notifications/read-all"),
    onSuccess: () => {
      toast.success("อ่านทั้งหมดแล้ว");
      refetch();
    },
    onError: (err) => toast.error("ทำรายการไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const readMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: refetch,
  });

  function open(n: AppNotification) {
    if (!n.is_read) readMutation.mutate(n.id);
  }

  // แท็บ: ทั้งหมด / เฉพาะแจ้งปัญหาระบบ (สำหรับทีมนักวิชาการคอมพิวเตอร์)
  const [tab, setTab] = useState<"all" | "issues">("all");
  const isIssue = (n: AppNotification) =>
    n.type === "SYSTEM" && n.title.includes("แจ้งปัญหา");

  const allItems = notifications.data?.items ?? [];
  const issueCount = allItems.filter(isIssue).length;
  const items = tab === "issues" ? allItems.filter(isIssue) : allItems;
  const unread = notifications.data?.unread_count ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Bell className="h-6 w-6 text-primary" />
            การแจ้งเตือน
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ยังไม่อ่าน {unread} รายการ
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => readAllMutation.mutate()}
          loading={readAllMutation.isPending}
          disabled={unread === 0}
        >
          {!readAllMutation.isPending && (
            <CheckCheck className="h-4 w-4 text-primary" />
          )}
          อ่านทั้งหมดแล้ว
        </Button>
      </div>

      {issueCount > 0 && (
        <div className="mt-5 flex w-fit gap-1 rounded-lg bg-muted p-1 text-sm">
          <button
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              tab === "all" && "bg-card font-semibold shadow-sm",
            )}
            onClick={() => setTab("all")}
          >
            ทั้งหมด
          </button>
          <button
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              tab === "issues" && "bg-card font-semibold shadow-sm",
            )}
            onClick={() => setTab("issues")}
          >
            🐞 แจ้งปัญหา ({issueCount})
          </button>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {notifications.isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-20 animate-pulse bg-muted/50" />
          ))}
        {!notifications.isLoading && items.length === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            ยังไม่มีการแจ้งเตือน
          </Card>
        )}
        {items.map((n) => {
          const Icon = typeIcons[n.type] ?? Bell;
          const card = (
            <Card
              className={cn(
                "flex items-start gap-3.5 p-4 transition-colors hover:bg-muted",
                !n.is_read && "border-primary/30 bg-secondary/50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  n.is_read
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm",
                    n.is_read ? "font-medium" : "font-semibold",
                  )}
                >
                  {n.title}
                </p>
                {/* render ลิงก์/รูปในข้อความได้ (ใช้กับแจ้งปัญหาที่แนบรูปมา) */}
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-muted-foreground">
                  <RichText text={n.message} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {timeAgo(n.created_at)}
                </p>
              </div>
              {!n.is_read && (
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
              )}
            </Card>
          );
          // ข้อความที่มีลิงก์/รูปในตัว (เช่นแจ้งปัญหา) ห้ามครอบด้วย <a> ซ้อน <a>
          const hasInlineLinks = /\]\(|https?:\/\//.test(n.message);
          return n.url && !hasInlineLinks ? (
            <Link key={n.id} href={n.url} className="block" onClick={() => open(n)}>
              {card}
            </Link>
          ) : (
            <button
              key={n.id}
              className="block w-full text-left"
              onClick={() => open(n)}
            >
              {card}
            </button>
          );
        })}
      </div>
    </div>
  );
}
