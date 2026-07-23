"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  Paperclip,
  Search,
  Send,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  useChatMessages,
  useConversations,
  useMe,
  type Conversation,
} from "@/lib/queries";
import { fullName, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

function conversationName(c: Conversation, myId: string | undefined): string {
  if (c.type === "GROUP") return c.name ?? "กลุ่มสนทนา";
  const other = c.members.find((m) => m.user.id !== myId)?.user;
  return other ? fullName(other) : (c.name ?? "การสนทนา");
}

export default function ChatPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const me = useMe();
  const conversations = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // ยังไม่ได้เลือกห้อง → เปิดห้องแรกอัตโนมัติ
  const activeId = selectedId ?? conversations.data?.[0]?.id ?? null;
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const messages = useChatMessages(activeId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const list = (conversations.data ?? []).filter(
    (c) =>
      !search.trim() ||
      conversationName(c, me.data?.id)
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const active = conversations.data?.find((c) => c.id === activeId) ?? null;

  // เลื่อนลงล่างสุดเมื่อข้อความเปลี่ยน
  const messageCount = messages.data?.items.length ?? 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messageCount, activeId]);

  // mark อ่านเมื่อเปิดห้องที่มีข้อความ
  const latestId = messages.data?.items[0]?.id;
  useEffect(() => {
    if (activeId && latestId) {
      api
        .post(`/chat/conversations/${activeId}/read`, { message_id: latestId })
        .then(() =>
          queryClient.invalidateQueries({ queryKey: ["conversations"] }),
        )
        .catch(() => undefined);
    }
  }, [activeId, latestId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async () =>
      api.post(`/chat/conversations/${activeId}/messages`, {
        message: text.trim(),
      }),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages", activeId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) => toast.error("ส่งข้อความไม่สำเร็จ", getApiErrorMessage(err)),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    sendMutation.mutate();
  }

  // เรียงเก่า → ใหม่ (API ส่งใหม่ → เก่า)
  const thread = [...(messages.data?.items ?? [])].reverse();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* รายชื่อการสนทนา */}
      <aside className="flex w-full max-w-xs shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <h1 className="font-bold">แชท</h1>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาการสนทนา..."
              className="h-9 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.isLoading && (
            <p className="p-4 text-sm text-muted-foreground">กำลังโหลด...</p>
          )}
          {!conversations.isLoading && list.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              ยังไม่มีการสนทนา
            </p>
          )}
          {list.map((c) => {
            const name = conversationName(c, me.data?.id);
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-border/60 p-3.5 text-left transition-colors hover:bg-muted",
                  c.id === activeId && "bg-secondary",
                )}
              >
                {c.type === "GROUP" ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Users className="h-5 w-5" />
                  </span>
                ) : (
                  <Avatar name={name} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{name}</p>
                    {c.last_message && (
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {timeAgo(c.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {c.last_message?.message ?? "ยังไม่มีข้อความ"}
                    </p>
                    {c.unread_count > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* หน้าต่างสนทนา */}
      <section className="flex min-w-0 flex-1 flex-col">
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <MessageCircle className="h-10 w-10" />
            <p className="text-sm">เลือกการสนทนาจากรายการด้านซ้าย</p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
              {active.type === "GROUP" ? (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Users className="h-5 w-5" />
                </span>
              ) : (
                <Avatar name={conversationName(active, me.data?.id)} />
              )}
              <div>
                <p className="font-semibold">
                  {conversationName(active, me.data?.id)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {active.type === "GROUP"
                    ? `สมาชิก ${active.members.length} คน`
                    : "การสนทนาส่วนตัว"}
                </p>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-background p-5">
              {messages.isLoading && (
                <p className="text-center text-sm text-muted-foreground">
                  กำลังโหลดข้อความ...
                </p>
              )}
              {!messages.isLoading && thread.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  ยังไม่มีข้อความ — เริ่มการสนทนาได้เลย
                </p>
              )}
              {thread.map((m) => {
                const mine = m.sender.id === me.data?.id;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex items-end gap-2",
                      mine && "flex-row-reverse",
                    )}
                  >
                    {!mine && <Avatar name={fullName(m.sender)} size="sm" />}
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        mine
                          ? "rounded-br-md bg-primary-dark text-white"
                          : "rounded-bl-md border border-border bg-card",
                      )}
                    >
                      {m.message}
                      <span
                        className={cn(
                          "mt-1 block text-right text-[10px]",
                          mine ? "text-white/70" : "text-muted-foreground",
                        )}
                      >
                        {timeAgo(m.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form
              className="flex items-center gap-2 border-t border-border bg-card p-3"
              onSubmit={submit}
            >
              <Button
                variant="ghost"
                size="icon"
                type="button"
                aria-label="แนบไฟล์"
                onClick={() =>
                  toast.info("ยังไม่รองรับ", "การแนบไฟล์อยู่ระหว่างการพัฒนา")
                }
              >
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Input
                placeholder="พิมพ์ข้อความ..."
                className="flex-1"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sendMutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="ส่งข้อความ"
                loading={sendMutation.isPending}
              >
                {!sendMutation.isPending && <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
