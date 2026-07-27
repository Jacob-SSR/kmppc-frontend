"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ExternalLink,
  FileQuestion,
  FileText,
  Globe,
  History,
  MessagesSquare,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RichText } from "@/components/rich-text";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { timeAgo } from "@/lib/format";

type AiSource = {
  source_type?: "ARTICLE" | "DISCUSSION" | "DOCUMENT" | string;
  source_id?: string;
  title: string;
  url: string;
  score?: number;
};

type AiAnswer = {
  found?: boolean;
  answer: string;
  sources: AiSource[];
  log_id?: string;
};

const suggestedQuestions = [
  "วิธีแก้ปัญหา Printer ไม่พิมพ์",
  "ขั้นตอนการ Backup ข้อมูล HOSxP",
  "การเบิกพัสดุทำอย่างไร",
  "ตั้งค่าเครือข่ายเครื่องใหม่",
];

const sourceMeta: Record<string, { label: string; icon: typeof FileText }> = {
  ARTICLE: { label: "บทความ", icon: FileText },
  DISCUSSION: { label: "กระทู้", icon: MessagesSquare },
  DOCUMENT: { label: "เอกสาร", icon: BookOpen },
};

export default function AiSearchPage() {
  return (
    <Suspense fallback={null}>
      <AiSearchContent />
    </Suspense>
  );
}

function AiSearchContent() {
  const toast = useToast();
  // คำถามที่ส่งมาจากการ์ดหน้าแรก (?q=...) — ถามให้เลยไม่ต้องพิมพ์ซ้ำ
  const initialQ = useSearchParams().get("q")?.trim() ?? "";
  const [query, setQuery] = useState(initialQ);
  // คำถามที่ส่งไปแล้วของคำตอบปัจจุบัน — ใช้โชว์หัวคำตอบ + ปุ่มค้นเว็บ
  const [askedQuery, setAskedQuery] = useState("");
  const [result, setResult] = useState<AiAnswer | null>(null);
  const [isWebResult, setIsWebResult] = useState(false);
  // feedback ที่ส่งไปแล้วของ log ปัจจุบัน (true=มีประโยชน์)
  const [feedbackSent, setFeedbackSent] = useState<boolean | null>(null);

  const askMutation = useMutation({
    mutationFn: async (q: string) =>
      (await api.post<AiAnswer>("/ai-search", { query: q })).data,
    onMutate: (q) => {
      setAskedQuery(q);
      setResult(null);
      setIsWebResult(false);
      setFeedbackSent(null);
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["ai-history"] });
    },
    onError: (err) =>
      toast.error("ถาม AI ไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const webMutation = useMutation({
    mutationFn: async (q: string) =>
      (await api.post<AiAnswer>("/ai-search/web", { query: q })).data,
    onSuccess: (data) => {
      setResult(data);
      setIsWebResult(true);
      setFeedbackSent(null);
    },
    onError: (err) =>
      toast.error("ค้นจากอินเทอร์เน็ตไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const feedbackMutation = useMutation({
    mutationFn: async (payload: { logId: string; was_helpful: boolean }) =>
      api.post(`/ai-search/${payload.logId}/feedback`, {
        was_helpful: payload.was_helpful,
      }),
    onSuccess: (_, vars) => {
      setFeedbackSent(vars.was_helpful);
      toast.success("ขอบคุณสำหรับ feedback", "ช่วยให้ AI พัฒนาคำตอบได้ดีขึ้น");
    },
    onError: (err) =>
      toast.error("ส่ง feedback ไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const loading = askMutation.isPending || webMutation.isPending;
  const queryClient = useQueryClient();

  // ประวัติคำถามของฉัน — refresh หลังถามเสร็จแต่ละครั้ง
  const historyQuery = useQuery({
    queryKey: ["ai-history"],
    queryFn: async () =>
      (
        await api.get<
          { id: string; query: string; created_at: string }[]
        >("/ai-search/history")
      ).data,
  });

  // มี ?q= ติดมา → ยิงถามอัตโนมัติครั้งเดียวตอนเข้าหน้า
  const autoAskedRef = useRef(false);
  useEffect(() => {
    if (!initialQ || autoAskedRef.current) return;
    autoAskedRef.current = true;
    askMutation.mutate(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      toast.error("กรุณาพิมพ์คำถามก่อน");
      return;
    }
    if (loading) return;
    setQuery(trimmed);
    askMutation.mutate(trimmed);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-bold">AI Search (ถาม AI)</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ถามคำถาม แล้ว AI จะหาคำตอบให้จากฐานความรู้ขององค์กร
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(query);
        }}
      >
        <Card className="mt-6 flex items-center gap-3 p-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="พิมพ์คำถามของคุณ..."
            disabled={loading}
            className="h-11 flex-1 rounded-lg bg-secondary/60 px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          />
          <Button
            variant="dark"
            size="icon"
            aria-label="ส่งคำถาม"
            type="submit"
            loading={loading}
          >
            {!loading && <Send className="h-4 w-4" />}
          </Button>
        </Card>
      </form>

      {/* กำลังคิด */}
      {loading && (
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 animate-pulse items-center justify-center rounded-lg bg-ai text-ai-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">AI กำลังค้นหาคำตอบ...</p>
              <p className="text-xs text-muted-foreground">
                “{askedQuery}”
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            {[100, 92, 76].map((w) => (
              <div
                key={w}
                className="h-3.5 animate-pulse rounded bg-muted"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </Card>
      )}

      {/* คำตอบ */}
      {!loading && result && (
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai text-ai-foreground">
                {isWebResult ? (
                  <Globe className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </span>
              {isWebResult ? "คำตอบจากอินเทอร์เน็ต" : "คำตอบจาก AI"}
            </h2>
            <span className="truncate text-xs text-muted-foreground">
              “{askedQuery}”
            </span>
          </div>

          <div className="mt-4 space-y-3 whitespace-pre-wrap text-sm leading-relaxed">
            <RichText text={result.answer} />
          </div>

          {/* ไม่พบในฐานความรู้ → เสนอค้นเว็บ */}
          {result.found === false && !isWebResult && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-ai/40 bg-ai/5 p-4">
              <p className="flex-1 text-sm text-muted-foreground">
                ฐานความรู้ยังไม่มีเรื่องนี้ — ลองให้ AI
                ค้นจากอินเทอร์เน็ตแทนได้
              </p>
              <Button
                variant="ai"
                size="sm"
                loading={webMutation.isPending}
                onClick={() => webMutation.mutate(askedQuery)}
              >
                {!webMutation.isPending && <Globe className="h-4 w-4" />}
                ค้นจากอินเทอร์เน็ต
              </Button>
            </div>
          )}

          {result.sources.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <h3 className="text-sm font-bold">แหล่งอ้างอิง</h3>
              <div className="mt-3 space-y-2">
                {result.sources.map((s, i) => {
                  const meta = sourceMeta[s.source_type ?? ""] ?? {
                    label: "ลิงก์",
                    icon: FileQuestion,
                  };
                  const Icon = isWebResult ? ExternalLink : meta.icon;
                  const isInternal = s.url.startsWith("/");
                  const row = (
                    <>
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate">{s.title}</span>
                      </span>
                      <Badge
                        variant={
                          s.source_type === "DOCUMENT" ? "primary" : "default"
                        }
                      >
                        {isWebResult ? "เว็บ" : meta.label}
                      </Badge>
                    </>
                  );
                  const className =
                    "flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted";
                  return isInternal ? (
                    <Link key={i} href={s.url} className={className}>
                      {row}
                    </Link>
                  ) : (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {row}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* feedback */}
          {result.log_id && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                AI อาจให้ข้อมูลไม่สมบูรณ์ โปรดตรวจสอบจากแหล่งข้อมูลทางการเสมอ
              </p>
              {feedbackSent === null ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={feedbackMutation.isPending}
                    onClick={() =>
                      feedbackMutation.mutate({
                        logId: result.log_id!,
                        was_helpful: true,
                      })
                    }
                  >
                    <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                    มีประโยชน์
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={feedbackMutation.isPending}
                    onClick={() =>
                      feedbackMutation.mutate({
                        logId: result.log_id!,
                        was_helpful: false,
                      })
                    }
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    ไม่ตรงคำถาม
                  </Button>
                </div>
              ) : (
                <p className="text-xs font-medium text-primary">
                  ✓ บันทึก feedback แล้ว ขอบคุณครับ
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ยังไม่ได้ถาม */}
      {!loading && !result && (
        <Card className="mt-6 p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ai/10">
            <Sparkles className="h-6 w-6 text-ai" />
          </span>
          <p className="mt-3 text-sm text-muted-foreground">
            พิมพ์คำถาม แล้ว AI จะค้นคำตอบจากบทความ กระทู้
            และคลังเอกสารของโรงพยาบาลให้ทันที
          </p>
        </Card>
      )}

      <Card className="mt-6 p-5">
        <h3 className="text-sm font-bold">คำถามที่แนะนำ</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button key={q} type="button" onClick={() => ask(q)}>
              <Badge className="cursor-pointer px-3 py-1.5 hover:bg-accent">
                {q}
              </Badge>
            </button>
          ))}
        </div>
      </Card>

      {(historyQuery.data?.length ?? 0) > 0 && (
        <Card className="mt-6 p-5">
          <h3 className="flex items-center gap-1.5 text-sm font-bold">
            <History className="h-4 w-4 text-primary" />
            ประวัติคำถามของฉัน
          </h3>
          <div className="mt-3 space-y-1">
            {historyQuery.data!.slice(0, 8).map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => ask(h.query)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <span className="min-w-0 flex-1 truncate">{h.query}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(h.created_at)}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
