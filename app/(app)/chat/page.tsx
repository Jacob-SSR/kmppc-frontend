"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  MessageCircle,
  MessageCirclePlus,
  Paperclip,
  Search,
  Send,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichText } from "@/components/rich-text";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { getChatSocket } from "@/lib/socket";
import {
  useChatMessages,
  useConversations,
  useDirectory,
  useMe,
  type Conversation,
} from "@/lib/queries";
import { useDebounced } from "@/lib/use-debounce";
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

  // ---------- Socket.IO realtime ----------
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const socket = getChatSocket();
    socket.connect();
    const onNewMessage = (m: { conversation_id: string }) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", m.conversation_id],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };
    const onOnline = (ids: string[]) => setOnlineIds(new Set(ids));
    socket.on("message:new", onNewMessage);
    socket.on("users:online", onOnline);
    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("users:online", onOnline);
    };
  }, [queryClient]);

  // join ทุกห้องที่เป็นสมาชิก เพื่อรับข้อความ realtime แม้ไม่ได้เปิดห้องนั้นอยู่
  const conversationKey = (conversations.data ?? []).map((c) => c.id).join(",");
  useEffect(() => {
    const socket = getChatSocket();
    const join = () => {
      conversationKey
        .split(",")
        .filter(Boolean)
        .forEach((id) =>
          socket.emit("conversation:join", { conversation_id: id }),
        );
    };
    join();
    socket.on("connect", join);
    return () => {
      socket.off("connect", join);
    };
  }, [conversationKey]);

  // ---------- เริ่มการสนทนาใหม่ (ส่วนตัว/กลุ่ม) ----------
  const [newChatMode, setNewChatMode] = useState(false);
  const [groupMode, setGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<
    { id: string; name: string }[]
  >([]);
  const [userQuery, setUserQuery] = useState("");
  const debouncedUserQuery = useDebounced(userQuery);
  const directory = useDirectory(debouncedUserQuery, newChatMode);

  function resetNewChat() {
    setNewChatMode(false);
    setGroupMode(false);
    setGroupName("");
    setSelectedMembers([]);
    setUserQuery("");
  }

  const startChatMutation = useMutation({
    mutationFn: async (payload: {
      type: "DIRECT" | "GROUP";
      name?: string;
      member_ids: string[];
    }) => (await api.post<Conversation>("/chat/conversations", payload)).data,
    onSuccess: (conversation) => {
      resetNewChat();
      setSelectedId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) =>
      toast.error("เริ่มการสนทนาไม่สำเร็จ", getApiErrorMessage(err)),
  });

  function toggleMember(id: string, name: string) {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === id)
        ? prev.filter((m) => m.id !== id)
        : [...prev, { id, name }],
    );
  }

  function createGroup() {
    if (selectedMembers.length < 2) {
      toast.error("สมาชิกไม่พอ", "กลุ่มต้องมีสมาชิกอื่นอย่างน้อย 2 คน");
      return;
    }
    if (!groupName.trim()) {
      toast.error("กรุณาตั้งชื่อกลุ่ม");
      return;
    }
    startChatMutation.mutate({
      type: "GROUP",
      name: groupName.trim(),
      member_ids: selectedMembers.map((m) => m.id),
    });
  }

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
    mutationFn: async () => {
      const body = { conversation_id: activeId, message: text.trim() };
      // ส่งผ่าน socket ก่อนเพื่อ broadcast ทันที — ถ้าไม่สำเร็จ fallback เป็น REST
      const socket = getChatSocket();
      if (socket.connected) {
        const ok = await new Promise<boolean>((resolve) => {
          socket
            .timeout(4000)
            .emit(
              "message:send",
              body,
              (err: unknown, res?: { success?: boolean }) => {
                resolve(!err && !!res?.success);
              },
            );
        });
        if (ok) return;
      }
      await api.post(`/chat/conversations/${activeId}/messages`, {
        message: text.trim(),
      });
    },
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

  // แนบไฟล์ในแชท — อัปโหลดแล้วส่งเป็นข้อความลิงก์
  const chatFileRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  async function attachFile(files: FileList | null) {
    const file = files?.[0];
    if (!file || !activeId) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ไฟล์ใหญ่เกิน 10MB", file.name);
      return;
    }
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<{ url: string; filename?: string }>(
        "/upload",
        formData,
      );
      const message = `📎 ${data.filename ?? file.name}\n${data.url}`;
      const socket = getChatSocket();
      let sent = false;
      if (socket.connected) {
        sent = await new Promise<boolean>((resolve) => {
          socket
            .timeout(4000)
            .emit(
              "message:send",
              { conversation_id: activeId, message },
              (err: unknown, res?: { success?: boolean }) =>
                resolve(!err && !!res?.success),
            );
        });
      }
      if (!sent) {
        await api.post(`/chat/conversations/${activeId}/messages`, { message });
      }
      queryClient.invalidateQueries({ queryKey: ["chat-messages", activeId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (err) {
      toast.error("ส่งไฟล์ไม่สำเร็จ", getApiErrorMessage(err));
    } finally {
      setUploadingFile(false);
      if (chatFileRef.current) chatFileRef.current.value = "";
    }
  }

  // เรียงเก่า → ใหม่ (API ส่งใหม่ → เก่า)
  const thread = [...(messages.data?.items ?? [])].reverse();

  function isOnline(userId: string | null | undefined): boolean {
    return !!userId && onlineIds.has(userId);
  }

  function directOtherId(c: Conversation): string | null {
    if (c.type === "GROUP") return null;
    return c.members.find((m) => m.user.id !== me.data?.id)?.user.id ?? null;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* รายชื่อการสนทนา */}
      <aside className="flex w-full max-w-xs shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            {newChatMode ? (
              <button
                className="flex items-center gap-1.5 text-sm font-bold hover:text-primary"
                onClick={resetNewChat}
              >
                <ArrowLeft className="h-4 w-4" />
                {groupMode ? "สร้างกลุ่มสนทนา" : "เริ่มการสนทนาใหม่"}
              </button>
            ) : (
              <h1 className="font-bold">แชท</h1>
            )}
            {!newChatMode && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="เริ่มการสนทนาใหม่"
                onClick={() => setNewChatMode(true)}
              >
                <MessageCirclePlus className="h-5 w-5 text-primary" />
              </Button>
            )}
          </div>
          {newChatMode && (
            <div className="mt-2 flex gap-1 rounded-lg bg-muted p-1 text-sm">
              <button
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 transition-colors",
                  !groupMode && "bg-card font-semibold shadow-sm",
                )}
                onClick={() => setGroupMode(false)}
              >
                ส่วนตัว
              </button>
              <button
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 transition-colors",
                  groupMode && "bg-card font-semibold shadow-sm",
                )}
                onClick={() => setGroupMode(true)}
              >
                กลุ่ม
              </button>
            </div>
          )}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {newChatMode ? (
              <Input
                placeholder="ค้นหาชื่อเพื่อนร่วมงาน..."
                className="h-9 pl-9"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                autoFocus
              />
            ) : (
              <Input
                placeholder="ค้นหาการสนทนา..."
                className="h-9 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
          </div>
        </div>

        {newChatMode ? (
          <>
            <div className="flex-1 overflow-y-auto">
              {directory.isLoading && (
                <p className="p-4 text-sm text-muted-foreground">
                  กำลังค้นหา...
                </p>
              )}
              {!directory.isLoading && (directory.data?.length ?? 0) === 0 && (
                <p className="p-4 text-sm text-muted-foreground">
                  ไม่พบเพื่อนร่วมงานที่ค้นหา
                </p>
              )}
              {directory.data?.map((u) => {
                const name = fullName(u);
                const selected = selectedMembers.some((m) => m.id === u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() =>
                      groupMode
                        ? toggleMember(u.id, name)
                        : startChatMutation.mutate({
                            type: "DIRECT",
                            member_ids: [u.id],
                          })
                    }
                    disabled={startChatMutation.isPending}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border/60 p-3.5 text-left transition-colors hover:bg-muted disabled:opacity-50",
                      groupMode && selected && "bg-secondary",
                    )}
                  >
                    <div className="relative">
                      <Avatar name={name} />
                      {isOnline(u.id) && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[u.position, u.department?.dept_name]
                          .filter(Boolean)
                          .join(" · ") || "เจ้าหน้าที่"}
                      </p>
                    </div>
                    {groupMode ? (
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                    ) : (
                      <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            {groupMode && (
              <div className="border-t border-border p-3">
                <p className="text-xs text-muted-foreground">
                  เลือกแล้ว {selectedMembers.length} คน
                  {selectedMembers.length > 0 &&
                    ` — ${selectedMembers.map((m) => m.name).join(", ")}`}
                </p>
                <Input
                  placeholder="ตั้งชื่อกลุ่ม..."
                  className="mt-2 h-9"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <Button
                  className="mt-2 w-full"
                  size="sm"
                  variant="dark"
                  onClick={createGroup}
                  loading={startChatMutation.isPending}
                >
                  {!startChatMutation.isPending && <Users className="h-4 w-4" />}
                  สร้างกลุ่ม
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.isLoading && (
              <p className="p-4 text-sm text-muted-foreground">กำลังโหลด...</p>
            )}
            {!conversations.isLoading && list.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                ยังไม่มีการสนทนา — กดปุ่ม + มุมขวาบนเพื่อเริ่มคุยกับเพื่อนร่วมงาน
              </p>
            )}
            {list.map((c) => {
              const name = conversationName(c, me.data?.id);
              const otherId = directOtherId(c);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border/60 p-3.5 text-left transition-colors hover:bg-muted",
                    c.id === activeId && "bg-secondary",
                  )}
                >
                  <div className="relative">
                    {c.type === "GROUP" ? (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <Users className="h-5 w-5" />
                      </span>
                    ) : (
                      <Avatar name={name} />
                    )}
                    {isOnline(otherId) && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                    )}
                  </div>
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
        )}
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
                <div className="relative">
                  <Avatar name={conversationName(active, me.data?.id)} />
                  {isOnline(directOtherId(active)) && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                  )}
                </div>
              )}
              <div>
                <p className="font-semibold">
                  {conversationName(active, me.data?.id)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {active.type === "GROUP"
                    ? `สมาชิก ${active.members.length} คน — ${active.members
                        .map((m) => m.user.fname)
                        .join(", ")}`
                    : isOnline(directOtherId(active))
                      ? "ออนไลน์"
                      : "ออฟไลน์"}
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
                        "max-w-[70%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        mine
                          ? "rounded-br-md bg-primary-dark text-white"
                          : "rounded-bl-md border border-border bg-card",
                      )}
                    >
                      {active.type === "GROUP" && !mine && (
                        <p className="mb-0.5 text-xs font-semibold text-primary">
                          {fullName(m.sender)}
                        </p>
                      )}
                      <RichText
                        text={m.message}
                        linkClassName={
                          mine
                            ? "text-white hover:opacity-80"
                            : "text-primary hover:opacity-80"
                        }
                      />
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
              <input
                ref={chatFileRef}
                type="file"
                className="hidden"
                onChange={(e) => attachFile(e.target.files)}
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                aria-label="แนบไฟล์"
                loading={uploadingFile}
                onClick={() => chatFileRef.current?.click()}
              >
                {!uploadingFile && (
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                )}
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
