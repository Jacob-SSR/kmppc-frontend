"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  MessageCircle,
  MessageCirclePlus,
  Paperclip,
  PencilLine,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmojiPickerButton } from "@/components/emoji-picker";
import { Input } from "@/components/ui/input";
import { RichText } from "@/components/rich-text";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { getChatSocket } from "@/lib/socket";
import {
  useChatMessages,
  useConversations,
  useDirectory,
  useFriends,
  useMe,
  type Conversation,
} from "@/lib/queries";
import { useDebounced } from "@/lib/use-debounce";
import { useRealtimeStore } from "@/lib/store";
import { fullName, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

function conversationName(c: Conversation, myId: string | undefined): string {
  if (c.type === "GROUP") return c.name ?? "กลุ่มสนทนา";
  const other = c.members.find((m) => m.user.id !== myId)?.user;
  return other ? fullName(other) : (c.name ?? "การสนทนา");
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
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
  // online ids อยู่ใน Zustand store กลาง (layout เป็นคน subscribe ให้แล้ว)
  const onlineIds = useRealtimeStore((s) => s.onlineIds);

  useEffect(() => {
    const socket = getChatSocket();
    socket.connect();
    const onNewMessage = (m: { conversation_id: string }) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", m.conversation_id],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };
    socket.on("message:new", onNewMessage);
    return () => {
      socket.off("message:new", onNewMessage);
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

  // มาจากปุ่ม "ส่งข้อความ" ในหน้าโปรไฟล์ (/chat?user=<id>) — เปิด DM ให้อัตโนมัติ
  const targetUserId = useSearchParams().get("user");
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (!targetUserId || autoStartedRef.current || !me.data) return;
    autoStartedRef.current = true;
    startChatMutation.mutate({ type: "DIRECT", member_ids: [targetUserId] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, me.data]);

  // ---------- แอดเพื่อนด้วยรหัสผู้ใช้ (8 ตัวแรกของ id) ----------
  const [friendCode, setFriendCode] = useState("");
  const [addingByCode, setAddingByCode] = useState(false);
  const myCode = me.data?.id.slice(0, 8) ?? "";

  async function addByCode() {
    const code = friendCode.trim();
    if (code.length < 6) {
      toast.error("รหัสไม่ถูกต้อง", "รหัสเพื่อนมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setAddingByCode(true);
    try {
      const { data: friend } = await api.get<{ id: string; fname: string }>(
        `/users/by-code/${encodeURIComponent(code)}`,
      );
      setFriendCode("");
      startChatMutation.mutate({ type: "DIRECT", member_ids: [friend.id] });
    } catch (err) {
      toast.error("แอดเพื่อนไม่สำเร็จ", getApiErrorMessage(err));
    } finally {
      setAddingByCode(false);
    }
  }

  function copyMyCode() {
    navigator.clipboard
      .writeText(myCode)
      .then(() => toast.success("คัดลอกรหัสเพื่อนแล้ว", "ส่งให้เพื่อนไปแอดได้เลย"))
      .catch(() => toast.error("คัดลอกไม่สำเร็จ"));
  }

  // ---------- ระบบเพื่อน ----------
  const friendsQuery = useFriends();
  const refreshFriends = () =>
    queryClient.invalidateQueries({ queryKey: ["friends"] });
  const acceptFriendMutation = useMutation({
    mutationFn: async (friendshipId: string) =>
      api.post(`/friends/${friendshipId}/accept`),
    onSuccess: () => {
      toast.success("เป็นเพื่อนกันแล้ว 🎉");
      refreshFriends();
    },
    onError: (err) => toast.error("ทำรายการไม่สำเร็จ", getApiErrorMessage(err)),
  });
  const declineFriendMutation = useMutation({
    mutationFn: async (friendshipId: string) =>
      api.delete(`/friends/${friendshipId}`),
    onSuccess: refreshFriends,
    onError: (err) => toast.error("ทำรายการไม่สำเร็จ", getApiErrorMessage(err)),
  });

  // ---------- จัดการสมาชิกกลุ่ม ----------
  const [showMembers, setShowMembers] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [addMemberQuery, setAddMemberQuery] = useState("");
  const debouncedAddMemberQuery = useDebounced(addMemberQuery);
  const addMemberDirectory = useDirectory(
    debouncedAddMemberQuery,
    showMembers && debouncedAddMemberQuery.trim().length > 0,
  );

  const addMemberMutation = useMutation({
    mutationFn: async (userId: string) =>
      api.post(`/chat/conversations/${activeId}/members`, {
        member_ids: [userId],
      }),
    onSuccess: () => {
      toast.success("เพิ่มสมาชิกเข้ากลุ่มแล้ว");
      setAddMemberQuery("");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) =>
      toast.error("เพิ่มสมาชิกไม่สำเร็จ", getApiErrorMessage(err)),
  });
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) =>
      api.delete(`/chat/conversations/${activeId}/members/${userId}`),
    onSuccess: () => {
      toast.success("ถอดสมาชิกออกจากกลุ่มแล้ว");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) =>
      toast.error("ถอดสมาชิกไม่สำเร็จ", getApiErrorMessage(err)),
  });
  const leaveMutation = useMutation({
    mutationFn: async () => api.post(`/chat/conversations/${activeId}/leave`),
    onSuccess: () => {
      toast.success("ออกจากกลุ่มแล้ว");
      setConfirmLeave(false);
      setShowMembers(false);
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) =>
      toast.error("ออกจากกลุ่มไม่สำเร็จ", getApiErrorMessage(err)),
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
  const amGroupAdmin = !!active?.members.some(
    (m) => m.user.id === me.data?.id && m.is_admin,
  );

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

  // ---------- แก้ไข/ลบข้อความของตัวเอง ----------
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [deleteMsgId, setDeleteMsgId] = useState<string | null>(null);

  const editMsgMutation = useMutation({
    mutationFn: async () =>
      api.patch(`/chat/messages/${editingMsg}`, { message: text.trim() }),
    onSuccess: () => {
      setText("");
      setEditingMsg(null);
      queryClient.invalidateQueries({ queryKey: ["chat-messages", activeId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) =>
      toast.error("แก้ไขข้อความไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const deleteMsgMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/chat/messages/${id}`),
    onSuccess: () => {
      setDeleteMsgId(null);
      toast.success("ลบข้อความแล้ว");
      queryClient.invalidateQueries({ queryKey: ["chat-messages", activeId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) => toast.error("ลบข้อความไม่สำเร็จ", getApiErrorMessage(err)),
  });

  function startEditMsg(id: string, current: string) {
    setEditingMsg(id);
    setText(current);
  }

  function cancelEditMsg() {
    setEditingMsg(null);
    setText("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    if (editingMsg) editMsgMutation.mutate();
    else sendMutation.mutate();
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
      const message = `[📎 ${data.filename ?? file.name}](${data.url})`;
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

  function directOtherImage(c: Conversation): string | null {
    if (c.type === "GROUP") return null;
    return (
      c.members.find((m) => m.user.id !== me.data?.id)?.user.profile_image ??
      null
    );
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
          {newChatMode && !groupMode && (
            <div className="mt-2 space-y-2 rounded-lg border border-dashed border-border bg-muted/40 p-2.5">
              <button
                type="button"
                onClick={copyMyCode}
                className="flex w-full items-center justify-between text-xs text-muted-foreground transition-colors hover:text-primary"
                title="คัดลอกรหัสเพื่อนของฉัน"
              >
                <span>
                  รหัสเพื่อนของฉัน:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {myCode || "…"}
                  </span>
                </span>
                <span className="text-primary">คัดลอก</span>
              </button>
              <div className="flex gap-1.5">
                <Input
                  placeholder="กรอกรหัสเพื่อนเพื่อเริ่มแชท"
                  className="h-8 flex-1 font-mono text-sm"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addByCode();
                    }
                  }}
                  disabled={addingByCode}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8"
                  onClick={addByCode}
                  loading={addingByCode}
                >
                  แอด
                </Button>
              </div>
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

        {/* คำขอเป็นเพื่อนที่รอตอบรับ */}
        {!newChatMode && (friendsQuery.data?.incoming.length ?? 0) > 0 && (
          <div className="border-b border-border bg-secondary/40 p-3">
            <p className="mb-2 text-xs font-bold text-primary-dark">
              👋 คำขอเป็นเพื่อน ({friendsQuery.data!.incoming.length})
            </p>
            <div className="space-y-2">
              {friendsQuery.data!.incoming.map((f) => (
                <div key={f.friendship_id} className="flex items-center gap-2">
                  <Avatar
                    name={fullName(f.user)}
                    src={f.user.profile_image}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {fullName(f.user)}
                  </span>
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs"
                    loading={acceptFriendMutation.isPending}
                    onClick={() =>
                      acceptFriendMutation.mutate(f.friendship_id)
                    }
                  >
                    ตอบรับ
                  </Button>
                  <button
                    type="button"
                    aria-label="ปฏิเสธ"
                    onClick={() =>
                      declineFriendMutation.mutate(f.friendship_id)
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {newChatMode ? (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* เพื่อนของฉัน — โชว์ก่อนเมื่อยังไม่ได้พิมพ์ค้นหา */}
              {!groupMode &&
                !userQuery.trim() &&
                (friendsQuery.data?.friends.length ?? 0) > 0 && (
                  <div className="border-b border-border/60 pb-1">
                    <p className="px-3.5 pb-1 pt-3 text-xs font-bold text-muted-foreground">
                      เพื่อนของฉัน ({friendsQuery.data!.friends.length})
                    </p>
                    {friendsQuery.data!.friends.map((f) => (
                      <button
                        key={f.friendship_id}
                        onClick={() =>
                          startChatMutation.mutate({
                            type: "DIRECT",
                            member_ids: [f.user.id],
                          })
                        }
                        disabled={startChatMutation.isPending}
                        className="flex w-full items-center gap-3 p-3.5 py-2 text-left transition-colors hover:bg-muted disabled:opacity-50"
                      >
                        <div className="relative">
                          <Avatar
                            name={fullName(f.user)}
                            src={f.user.profile_image}
                          />
                          {isOnline(f.user.id) && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {fullName(f.user)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {f.user.department?.dept_name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
                      <Avatar name={name} src={u.profile_image} />
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
                      <Avatar name={name} src={directOtherImage(c)} />
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
                  <Avatar
                    name={conversationName(active, me.data?.id)}
                    src={directOtherImage(active)}
                  />
                  {isOnline(directOtherId(active)) && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {conversationName(active, me.data?.id)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {active.type === "GROUP"
                    ? `สมาชิก ${active.members.length} คน — ${active.members
                        .map((m) => m.user.fname)
                        .join(", ")}`
                    : isOnline(directOtherId(active))
                      ? "ออนไลน์"
                      : "ออฟไลน์"}
                </p>
              </div>
              {active.type === "GROUP" && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="จัดการสมาชิกกลุ่ม"
                  title="สมาชิกกลุ่ม"
                  onClick={() => setShowMembers((v) => !v)}
                >
                  <Users className="h-5 w-5 text-primary" />
                </Button>
              )}
            </header>

            {/* แผงจัดการสมาชิกกลุ่ม */}
            {active.type === "GROUP" && showMembers && (
              <div className="border-b border-border bg-card px-5 py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">
                    สมาชิกกลุ่ม ({active.members.length})
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/5"
                    loading={leaveMutation.isPending}
                    onClick={() => setConfirmLeave(true)}
                  >
                    ออกจากกลุ่ม
                  </Button>
                </div>
                <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {active.members.map((m) => (
                    <div
                      key={m.user.id}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted"
                    >
                      <Avatar
                        name={fullName(m.user)}
                        src={m.user.profile_image}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {fullName(m.user)}
                        {m.user.id === me.data?.id && " (คุณ)"}
                      </span>
                      {m.is_admin && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary-dark">
                          แอดมิน
                        </span>
                      )}
                      {amGroupAdmin && m.user.id !== me.data?.id && (
                        <button
                          type="button"
                          aria-label="ถอดออกจากกลุ่ม"
                          title="ถอดออกจากกลุ่ม"
                          onClick={() =>
                            removeMemberMutation.mutate(m.user.id)
                          }
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {amGroupAdmin && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                      เพิ่มสมาชิกใหม่
                    </p>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="พิมพ์ชื่อเพื่อนร่วมงาน..."
                        className="h-8 pl-8 text-sm"
                        value={addMemberQuery}
                        onChange={(e) => setAddMemberQuery(e.target.value)}
                      />
                    </div>
                    {addMemberQuery.trim() && (
                      <div className="mt-1.5 max-h-36 space-y-0.5 overflow-y-auto">
                        {(addMemberDirectory.data ?? [])
                          .filter(
                            (u) =>
                              !active.members.some((m) => m.user.id === u.id),
                          )
                          .map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => addMemberMutation.mutate(u.id)}
                              disabled={addMemberMutation.isPending}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted disabled:opacity-60"
                            >
                              <Avatar
                                name={fullName(u)}
                                src={u.profile_image}
                                size="sm"
                              />
                              <span className="min-w-0 flex-1 truncate">
                                {fullName(u)}
                              </span>
                              <MessageCirclePlus className="h-4 w-4 shrink-0 text-primary" />
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
                      "group flex items-end gap-2",
                      mine && "flex-row-reverse",
                    )}
                  >
                    {!mine && (
                      <Avatar
                        name={fullName(m.sender)}
                        src={m.sender.profile_image}
                        size="sm"
                      />
                    )}
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
                        {m.edited_at && "แก้ไขแล้ว · "}
                        {timeAgo(m.created_at)}
                      </span>
                    </div>
                    {/* ปุ่มแก้ไข/ลบ — เฉพาะข้อความตัวเอง โผล่ตอน hover */}
                    {mine && (
                      <div className="flex gap-0.5 self-center opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label="แก้ไขข้อความ"
                          title="แก้ไขข้อความ"
                          onClick={() => startEditMsg(m.id, m.message)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="ลบข้อความ"
                          title="ลบข้อความ"
                          onClick={() => setDeleteMsgId(m.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {editingMsg && (
              <div className="flex items-center justify-between gap-2 border-t border-border bg-secondary/60 px-4 py-2 text-xs">
                <span className="flex items-center gap-1.5 text-primary-dark">
                  <PencilLine className="h-3.5 w-3.5" />
                  กำลังแก้ไขข้อความ
                </span>
                <button
                  type="button"
                  onClick={cancelEditMsg}
                  className="flex items-center gap-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" /> ยกเลิก
                </button>
              </div>
            )}
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
              <EmojiPickerButton
                onPick={(emoji) => setText((t) => t + emoji)}
                disabled={sendMutation.isPending}
              />
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
                aria-label={editingMsg ? "บันทึกการแก้ไข" : "ส่งข้อความ"}
                loading={sendMutation.isPending || editMsgMutation.isPending}
              >
                {!sendMutation.isPending &&
                  !editMsgMutation.isPending &&
                  (editingMsg ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  ))}
              </Button>
            </form>
          </>
        )}
      </section>

      <ConfirmDialog
        open={confirmLeave}
        danger
        title="ออกจากกลุ่มนี้?"
        description="คุณจะไม่เห็นข้อความในกลุ่มนี้อีก จนกว่าแอดมินกลุ่มจะเพิ่มคุณกลับเข้ามาใหม่"
        confirmLabel="ออกจากกลุ่ม"
        loading={leaveMutation.isPending}
        onConfirm={() => leaveMutation.mutate()}
        onCancel={() => setConfirmLeave(false)}
      />

      <ConfirmDialog
        open={!!deleteMsgId}
        danger
        title="ลบข้อความนี้?"
        description="ข้อความจะหายไปจากห้องแชทของทุกคน — การลบย้อนกลับไม่ได้"
        confirmLabel="ลบข้อความ"
        loading={deleteMsgMutation.isPending}
        onConfirm={() => deleteMsgId && deleteMsgMutation.mutate(deleteMsgId)}
        onCancel={() => setDeleteMsgId(null)}
      />
    </div>
  );
}
