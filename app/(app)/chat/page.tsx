"use client";

import { useState } from "react";
import {
  MessageCirclePlus,
  Paperclip,
  Search,
  Send,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatMessages, conversations } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// หน้าแชท — จะเชื่อม REST /api/chat + Socket.IO namespace `chat` ในสปรินต์ถัดไป
export default function ChatPage() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const active = conversations.find((c) => c.id === activeId)!;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* รายชื่อการสนทนา */}
      <aside className="flex w-full max-w-xs shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-bold">แชท</h1>
            <Button variant="ghost" size="icon" aria-label="เริ่มการสนทนาใหม่">
              <MessageCirclePlus className="h-5 w-5 text-primary" />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ค้นหาการสนทนา..." className="h-9 pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-border/60 p-3.5 text-left transition-colors hover:bg-muted",
                c.id === activeId && "bg-secondary"
              )}
            >
              <div className="relative">
                {c.type === "GROUP" ? (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Users className="h-5 w-5" />
                  </span>
                ) : (
                  <Avatar name={c.name} />
                )}
                {c.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {c.time}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {c.last_message}
                  </p>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* หน้าต่างสนทนา */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
          {active.type === "GROUP" ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Users className="h-5 w-5" />
            </span>
          ) : (
            <Avatar name={active.name} />
          )}
          <div>
            <p className="font-semibold">{active.name}</p>
            <p className="text-xs text-muted-foreground">
              {active.online ? "ออนไลน์" : "ออฟไลน์"}
            </p>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-background p-5">
          {chatMessages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-end gap-2",
                m.from === "me" && "flex-row-reverse"
              )}
            >
              {m.from === "them" && <Avatar name={m.author} size="sm" />}
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.from === "me"
                    ? "rounded-br-md bg-primary-dark text-white"
                    : "rounded-bl-md border border-border bg-card"
                )}
              >
                {m.text}
                <span
                  className={cn(
                    "mt-1 block text-right text-[10px]",
                    m.from === "me" ? "text-white/70" : "text-muted-foreground"
                  )}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <form
          className="flex items-center gap-2 border-t border-border bg-card p-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label="แนบไฟล์"
          >
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input placeholder="พิมพ์ข้อความ..." className="flex-1" />
          <Button type="submit" size="icon" aria-label="ส่งข้อความ">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </section>
    </div>
  );
}
